<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('recurrence')->default('daily')->after('type'); // single | daily | weekly | monthly
            $table->date('due_date')->nullable()->after('recurrence'); // para tarefas single
            $table->foreignId('user_id')->nullable()->after('shift_id')->constrained()->nullOnDelete();
            $table->boolean('requires_observation')->default(false)->after('requires_photo');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['recurrence', 'due_date', 'user_id', 'requires_observation']);
        });
    }
};
