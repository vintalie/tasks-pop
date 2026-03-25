<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MediaStorageService
{
    public const MAX_IMAGE_MB = 10;

    public const MAX_VIDEO_MB = 50;

    public function store(UploadedFile $file): ?array
    {
        $type = $this->getMediaType($file);
        if ($this->useCloudinary()) {
            return $this->storeCloudinary($file, $type);
        }

        $path = $file->store('task-logs', 'public');

        return $path ? ['url' => Storage::disk('public')->url($path), 'type' => $type] : null;
    }

    public function url(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    protected function getMediaType(UploadedFile $file): string
    {
        $mime = $file->getMimeType();

        return str_starts_with($mime ?? '', 'video/') ? 'video' : 'image';
    }

    protected function useCloudinary(): bool
    {
        return $this->getCloudinaryConfig() !== null;
    }

    protected function getCloudinaryConfig(): ?string
    {
        $url = config('services.cloudinary.url');
        if (! empty($url)) {
            return $url;
        }

        return $this->buildCloudinaryUrl();
    }

    protected function storeCloudinary(UploadedFile $file, string $type): ?array
    {
        try {
            $config = $this->getCloudinaryConfig();
            if (! $config) {
                \Log::warning('MediaStorage: Cloudinary não configurado, usando disco local');
                return $this->storeLocal($file, $type);
            }
            $cloudinary = new Cloudinary($config);
            $result = $cloudinary->uploadApi()->upload(
                $file->getRealPath(),
                [
                    'folder' => 'tasks-pop/task-logs',
                    'resource_type' => $type,
                ]
            );

            $url = $result['secure_url'] ?? null;

            if ($url) {
                return ['url' => $url, 'type' => $type];
            }
            \Log::warning('MediaStorage: Cloudinary sem secure_url, usando disco local');
            return $this->storeLocal($file, $type);
        } catch (\Throwable $e) {
            report($e);
            \Log::error('MediaStorage: Cloudinary falhou, fallback para disco local', ['error' => $e->getMessage(), 'file' => $file->getClientOriginalName()]);

            return $this->storeLocal($file, $type);
        }
    }

    protected function storeLocal(UploadedFile $file, string $type): ?array
    {
        $path = $file->store('task-logs', 'public');

        return $path ? ['url' => Storage::disk('public')->url($path), 'type' => $type] : null;
    }

    protected function buildCloudinaryUrl(): ?string
    {
        $cloudName = config('services.cloudinary.cloud_name');
        $apiKey = config('services.cloudinary.api_key');
        $apiSecret = config('services.cloudinary.api_secret');

        if (empty($cloudName) || empty($apiKey) || empty($apiSecret)) {
            return null;
        }

        return sprintf(
            'cloudinary://%s:%s@%s',
            $apiKey,
            $apiSecret,
            $cloudName
        );
    }
}
