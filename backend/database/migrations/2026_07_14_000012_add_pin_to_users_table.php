<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Only Kitchen users (C-12) populate this -- Owner, Cashier, and
            // Server rows leave it null. Nullable + unique is safe on
            // Postgres (and SQLite, used in tests): multiple NULLs are
            // allowed under a unique index, only duplicate non-null PINs
            // are rejected.
            $table->string('pin')->nullable()->unique()->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('pin');
        });
    }
};
