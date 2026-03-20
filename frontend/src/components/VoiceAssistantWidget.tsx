import { useState, useRef } from 'react';
import { useA11y } from '../contexts/A11yContext';
import { ask, type VoiceMessage } from '../services/voiceAssistant';

export function VoiceAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const { speak, sttEnabled, startListening, stopListening } = useA11y();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = (base64: string) => {
    try {
      const audio = new Audio(`data:audio/mpeg;base64,${base64}`);
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch {
      // ignore
    }
  };

  const handleSpeak = (text: string) => {
    speak(text);
  };

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages((m) => [...m, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: msg });

      const { text, audio_base64 } = await ask(msg, history);

      setMessages((m) => [...m, { role: 'assistant', content: text }]);

      if (audio_base64) {
        playAudio(audio_base64);
      } else if (text) {
        speak(text);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: err instanceof Error ? err.message : 'Erro ao processar.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMicClick = () => {
    if (listening) {
      stopListening();
      setListening(false);
      return;
    }
    setListening(true);
    startListening((text) => {
      setInput((p) => (p ? `${p} ${text}` : text));
      setListening(false);
    });
  };

  return (
    <div className="voice-assistant">
      <button
        type="button"
        className="voice-assistant-fab"
        onClick={() => setOpen((o) => !o)}
        title={open ? 'Fechar assistente' : 'Abrir assistente de voz'}
        aria-expanded={open}
      >
        {open ? '✕' : '🎙'}
      </button>

      {open && (
        <div className="voice-assistant-panel">
          <h3>Assistente de voz</h3>
          <div className="voice-assistant-messages">
            {messages.length === 0 && !loading && (
              <p className="voice-assistant-hint">
                Pergunte: &quot;Quais tarefas faltam?&quot; ou &quot;O que já concluí?&quot;
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`voice-assistant-msg voice-assistant-msg-${m.role}`}>
                <span>{m.content}</span>
                {m.role === 'assistant' && m.content && (
                  <button
                    type="button"
                    className="voice-assistant-btn-listen"
                    onClick={() => handleSpeak(m.content)}
                    title="Ouvir"
                  >
                    🔊
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div className="voice-assistant-msg voice-assistant-msg-assistant">
                <span>Processando...</span>
              </div>
            )}
          </div>
          <div className="voice-assistant-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite ou pressione o microfone..."
              disabled={loading}
            />
            {sttEnabled && (
              <button
                type="button"
                className={`voice-assistant-mic ${listening ? 'listening' : ''}`}
                onClick={handleMicClick}
                title={listening ? 'Parar' : 'Falar'}
              >
                🎤
              </button>
            )}
            <button
              type="button"
              className="voice-assistant-send"
              onClick={() => handleSend()}
              disabled={loading}
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
