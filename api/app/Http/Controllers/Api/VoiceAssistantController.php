<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VoiceAssistantTools;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenAI\Laravel\Facades\OpenAI;

const SYSTEM_PROMPT = <<<'PROMPT'
Você é um assistente de voz do Tasks POP, sistema de checklist operacional.
O usuário pode perguntar sobre tarefas pendentes, concluídas, ou pedir explicações.
Use as ferramentas disponíveis para consultar os dados reais antes de responder.
Responda em português, de forma clara e breve (pensando em resposta falada).
O usuário pode ter dificuldade de leitura - seja direto e use linguagem simples.

IMPORTANTE - Confirmação com gerente:
Quando o usuário perguntar COMO FAZER uma tarefa, COMO ADICIONAR na observação,
o que escrever na observação, ou qualquer instrução de execução, SEMPRE inclua no final:
"Confirme com um gerente antes de executar a tarefa."
Exemplos de perguntas que exigem esse aviso: "Como faço essa tarefa?", "O que colocar na observação?",
"Como adicionar na observação?", "Me explica o passo a passo".
PROMPT;

class VoiceAssistantController extends Controller
{
    public function ask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
            'history' => 'array',
            'history.*.role' => 'in:user,assistant',
            'history.*.content' => 'string',
        ]);

        $user = $request->user();
        $message = trim($validated['message']);
        $history = $validated['history'] ?? [];

        $messages = [
            ['role' => 'system', 'content' => SYSTEM_PROMPT],
            ...array_map(fn ($h) => [
                'role' => $h['role'],
                'content' => $h['content'] ?? '',
            ], array_slice($history, -10)),
            ['role' => 'user', 'content' => $message],
        ];

        $tools = VoiceAssistantTools::getToolsDefinition();
        $maxIterations = 5;
        $text = '';

        for ($i = 0; $i < $maxIterations; $i++) {
            $response = OpenAI::chat()->create([
                'model' => 'gpt-4o-mini',
                'messages' => $messages,
                'tools' => $tools,
            ]);

            $choice = $response->choices[0];
            $msg = $choice->message;

            if ($msg->content) {
                $text = trim($msg->content);
            }

            if (empty($msg->toolCalls)) {
                break;
            }

            foreach ($msg->toolCalls as $tc) {
                $name = $tc->function->name;
                $args = json_decode($tc->function->arguments, true) ?? [];
                $result = VoiceAssistantTools::execute($name, $args, $user);

                $messages[] = $msg->toArray();
                $messages[] = [
                    'role' => 'tool',
                    'tool_call_id' => $tc->id,
                    'content' => $result,
                ];
            }
        }

        if (empty($text)) {
            $text = 'Desculpe, não consegui processar sua pergunta. Tente novamente.';
        }

        $audioBase64 = null;
        $apiKey = config('openai.api_key');
        if ($apiKey && strlen($text) > 0 && strlen($text) < 4000) {
            try {
                $audio = OpenAI::audio()->speech([
                    'model' => 'tts-1',
                    'input' => $text,
                    'voice' => 'nova',
                ]);
                $audioBase64 = base64_encode($audio);
            } catch (\Throwable $e) {
                // Fallback: frontend will use Web Speech API
            }
        }

        return response()->json([
            'text' => $text,
            'audio_base64' => $audioBase64,
        ]);
    }
}
