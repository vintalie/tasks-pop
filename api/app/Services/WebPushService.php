<?php

namespace App\Services;

use App\Models\PushSubscription;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class WebPushService
{
    public function sendToUser(int $userId, string $title, string $body, array $data = []): int
    {
        return $this->sendToUsers([$userId], $title, $body, $data);
    }

    public function sendToUsers(array $userIds, string $title, string $body, array $data = []): int
    {
        $subscriptions = PushSubscription::whereIn('user_id', $userIds)->get();
        $sent = 0;

        $webPush = $this->createWebPush();
        if (! $webPush) {
            return 0;
        }

        foreach ($subscriptions as $sub) {
            try {
                $subscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'keys' => $sub->keys,
                    'contentEncoding' => 'aes128gcm',
                ]);

                $payload = json_encode(array_merge($data, [
                    'title' => $title,
                    'body' => $body,
                    'tag' => $data['tag'] ?? 'tasks-pop',
                ]));

                $report = $webPush->sendOneNotification($subscription, $payload);

                if ($report->isSuccess()) {
                    $sent++;
                } elseif ($report->isSubscriptionExpired()) {
                    $sub->delete();
                }
            } catch (\Throwable $e) {
                \Log::warning('WebPush send failed', ['error' => $e->getMessage(), 'user_id' => $sub->user_id]);
                $sub->delete();
            }
        }

        return $sent;
    }

    protected function createWebPush(): ?WebPush
    {
        $publicKey = config('webpush.vapid.public_key');
        $privateKey = config('webpush.vapid.private_key');

        if (empty($publicKey) || empty($privateKey)) {
            return null;
        }

        $subject = config('app.url');
        if (! str_starts_with((string) $subject, 'mailto:') && ! str_starts_with((string) $subject, 'http')) {
            $subject = 'mailto:'.(config('mail.from.address', 'noreply@taskspop.local'));
        }

        return new WebPush([
            'VAPID' => [
                'subject' => $subject,
                'publicKey' => $publicKey,
                'privateKey' => $privateKey,
            ],
        ]);
    }
}
