<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Request;

class StorageUrlHelper
{
    /**
     * Corrige URLs de storage para usar o host/porta da requisição atual.
     * Resolve APP_URL=http://localhost (sem porta) quando o servidor está em :8000.
     */
    public static function fixStorageUrl(string $url): string
    {
        if (empty($url) || (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://'))) {
            return $url;
        }

        if (app()->runningInConsole()) {
            return $url;
        }

        try {
            $parsed = parse_url($url);
            $host = $parsed['host'] ?? '';
            $port = $parsed['port'] ?? null;
            $requestHost = Request::getHost();
            $requestPort = Request::getPort();

            if ($host === 'localhost' && $requestHost === 'localhost') {
                $path = $parsed['path'] ?? '';
                $query = $parsed['query'] ?? '';
                $scheme = $parsed['scheme'] ?? 'http';

                if ($requestPort && ! in_array($requestPort, [80, 443]) && $port !== $requestPort) {
                    return sprintf('%s://%s:%d%s%s', $scheme, $requestHost, $requestPort, $path, $query ? '?'.$query : '');
                }
            }
        } catch (\Throwable $e) {
            // ignore
        }

        return $url;
    }
}
