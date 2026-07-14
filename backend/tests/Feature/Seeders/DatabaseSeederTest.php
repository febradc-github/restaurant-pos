<?php

namespace Tests\Feature\Seeders;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The demo data seeder (C-27): running `php artisan db:seed` should leave a
 * database that's immediately demoable -- fixed login/PIN credentials for
 * every role, a visible restock shortfall, real sales history, and
 * attendance data -- without any manual setup.
 */
class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeds_exactly_one_owner_cashier_and_server_with_documented_emails(): void
    {
        $this->seed();

        $this->assertSame(1, User::query()->where('role', UserRole::Owner)->count());
        $this->assertSame(1, User::query()->where('role', UserRole::Cashier)->count());
        $this->assertSame(1, User::query()->where('role', UserRole::Server)->count());

        $this->assertTrue(User::query()->where('email', 'owner@demo.pos')->where('role', UserRole::Owner)->exists());
        $this->assertTrue(User::query()->where('email', 'cashier@demo.pos')->where('role', UserRole::Cashier)->exists());
        $this->assertTrue(User::query()->where('email', 'server@demo.pos')->where('role', UserRole::Server)->exists());
    }

    public function test_seeds_exactly_two_kitchen_users_with_documented_pins(): void
    {
        $this->seed();

        $this->assertSame(2, User::query()->where('role', UserRole::Kitchen)->count());
        $this->assertTrue(User::query()->where('pin', '111111')->where('role', UserRole::Kitchen)->exists());
        $this->assertTrue(User::query()->where('pin', '222222')->where('role', UserRole::Kitchen)->exists());
    }

    public function test_all_seeded_users_are_active(): void
    {
        $this->seed();

        $this->assertSame(0, User::query()->where('active', false)->count());
        $this->assertSame(5, User::query()->where('active', true)->count());
    }

    public function test_seeds_an_inventory_item_below_its_threshold(): void
    {
        $this->seed();

        $this->assertTrue(
            InventoryItem::query()->whereColumn('stock', '<', 'threshold')->exists(),
            'Expected at least one inventory item with stock below threshold (a restock shortfall).'
        );

        $this->assertTrue(
            InventoryItem::query()->whereColumn('stock', '>=', 'threshold')->exists(),
            'Expected at least one inventory item comfortably at or above its threshold.'
        );
    }

    public function test_seeds_paid_orders_with_paid_at_set(): void
    {
        $this->seed();

        $this->assertTrue(
            Order::query()->where('status', OrderStatus::Paid)->whereNotNull('paid_at')->exists()
        );

        // Cancelled orders must not be dated as paid.
        $this->assertSame(
            0,
            Order::query()->where('status', OrderStatus::Cancelled)->whereNotNull('paid_at')->count()
        );
    }

    public function test_seeds_time_entries_for_every_server_cashier_and_kitchen_user(): void
    {
        $this->seed();

        $loginRoleUsers = User::query()->whereIn('role', [UserRole::Cashier, UserRole::Server, UserRole::Kitchen])->get();

        $this->assertCount(4, $loginRoleUsers, 'Expected one Cashier, one Server, and two Kitchen users.');

        foreach ($loginRoleUsers as $user) {
            $this->assertTrue(
                TimeEntry::query()->where('user_id', $user->id)->exists(),
                "Expected at least one time entry for user {$user->id} ({$user->role->value})."
            );
        }
    }

    public function test_is_safe_to_run_twice(): void
    {
        $this->seed();
        $this->seed();

        $this->assertSame(5, User::query()->count());
    }
}
