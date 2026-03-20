<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PhotoStorageService
{
    public function store(UploadedFile $file): ?string
    {
        if ($this->useCloudinary()) {
            return $this->storeCloudinary($file);
        }

        return $file->store('task-logs', 'public');
    }

    public function url(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        // Se for URL completa (Cloudinary), retorna como está
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
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

    protected function storeCloudinary(UploadedFile $file): ?string
    {
        try {
            $config = $this->getCloudinaryConfig();
            if (! $config) {
                return null;
            }
            $cloudinary = new Cloudinary($config);
            $result = $cloudinary->uploadApi()->upload(
                $file->getRealPath(),
                [
                    'folder' => 'tasks-pop/task-logs',
                    'resource_type' => 'image',
                ]
            );

            return $result['secure_url'] ?? null;
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
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
