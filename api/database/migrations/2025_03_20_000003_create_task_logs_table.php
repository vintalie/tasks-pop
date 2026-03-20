<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->date('log_date');
            $table->timestamp('completed_at')->nullable();
            $table->text('observation')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('status')->default('pending'); // pending | completed | corrected
            $table->timestamp('corrected_at')->nullable();
            $table->text('correction_reason')->nullable();
            $table->foreignId('corrected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'task_id', 'log_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_logs');
    }
};
