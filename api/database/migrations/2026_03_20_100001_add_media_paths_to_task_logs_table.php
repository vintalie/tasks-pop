<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('task_logs', function (Blueprint $table) {
            $table->json('media_paths')->nullable()->after('photo_path');
        });

        // Migrar photo_path existente para media_paths
        DB::table('task_logs')
            ->whereNotNull('photo_path')
            ->where('photo_path', '!=', '')
            ->get()
            ->each(function ($row) {
                $media = [['url' => $row->photo_path, 'type' => 'image']];
                DB::table('task_logs')
                    ->where('id', $row->id)
                    ->update(['media_paths' => json_encode($media)]);
            });
    }

    public function down(): void
    {
        Schema::table('task_logs', function (Blueprint $table) {
            $table->dropColumn('media_paths');
        });
    }
};
