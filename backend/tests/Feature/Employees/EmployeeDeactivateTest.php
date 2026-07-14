<?php

namespace Tests\Feature\Employees;

use App\Models\Order;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PATCH /api/employees/{user}/deactivate and /reactivate (C-21): Owner-only.
 * Deactivating/reactivating only flips `active` -- it never touches the
 * employee's historical time_entries or orders rows. Self-deactivation and
 * deactivating the last active Owner are both rejected.
 */
class EmployeeDeactivateTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return $user->createToken('test-token')->plainTextToken;
    }

    public function test_requires_authentication(): void
    {
        $cashier = User::factory()->cashier()->create();

        $response = $this->patchJson("/api/employees/{$cashier->id}/deactivate");

        $response->assertUnauthorized();
    }

    public function test_non_owner_roles_are_forbidden(): void
    {
        $actor = User::factory()->cashier()->create();
        $target = User::factory()->server()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($actor))
            ->patchJson("/api/employees/{$target->id}/deactivate");

        $response->assertForbidden();
    }

    public function test_owner_deactivates_a_cashier(): void
    {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create(['active' => true]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->patchJson("/api/employees/{$cashier->id}/deactivate");

        $response->assertOk()->assertJsonPath('active', false);
        $this->assertFalse($cashier->fresh()->active);
    }

    public function test_owner_reactivates_a_deactivated_employee(): void
    {
        $owner = User::factory()->owner()->create();
        $cashier = User::factory()->cashier()->create(['active' => false]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->patchJson("/api/employees/{$cashier->id}/reactivate");

        $response->assertOk()->assertJsonPath('active', true);
        $this->assertTrue($cashier->fresh()->active);
    }

    public function test_self_deactivation_is_rejected(): void
    {
        $owner1 = User::factory()->owner()->create(['active' => true]);
        // A second active Owner exists, so this is not a last-owner case --
        // isolates the self-deactivation rejection from the last-owner one.
        User::factory()->owner()->create(['active' => true]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner1))
            ->patchJson("/api/employees/{$owner1->id}/deactivate");

        $response->assertUnprocessable();
        $this->assertTrue($owner1->fresh()->active);
    }

    public function test_deactivating_the_last_active_owner_is_rejected(): void
    {
        $onlyOwner = User::factory()->owner()->create(['active' => true]);
        $cashier = User::factory()->cashier()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($onlyOwner))
            ->patchJson("/api/employees/{$onlyOwner->id}/deactivate");

        $response->assertUnprocessable();
        $this->assertTrue($onlyOwner->fresh()->active);
    }

    public function test_deactivating_the_last_active_owner_is_rejected_even_when_requested_by_a_different_owner(): void
    {
        $onlyActiveOwner = User::factory()->owner()->create(['active' => true]);
        $alreadyInactiveOwner = User::factory()->owner()->create(['active' => false]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($alreadyInactiveOwner))
            ->patchJson("/api/employees/{$onlyActiveOwner->id}/deactivate");

        $response->assertUnprocessable();
        $this->assertTrue($onlyActiveOwner->fresh()->active);
    }

    public function test_deactivating_an_owner_succeeds_when_another_active_owner_remains(): void
    {
        $owner1 = User::factory()->owner()->create(['active' => true]);
        $owner2 = User::factory()->owner()->create(['active' => true]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner1))
            ->patchJson("/api/employees/{$owner2->id}/deactivate");

        $response->assertOk()->assertJsonPath('active', false);
        $this->assertFalse($owner2->fresh()->active);
    }

    public function test_deactivating_and_reactivating_does_not_touch_the_employees_time_entries_or_orders(): void
    {
        $owner = User::factory()->owner()->create();
        $server = User::factory()->server()->create();

        $timeEntry = TimeEntry::factory()->create([
            'user_id' => $server->id,
            'role' => 'server',
            'clock_in' => '2026-07-01 09:00:00',
            'clock_out' => '2026-07-01 17:00:00',
        ]);
        $order = Order::factory()->create();

        $timeEntryBefore = $timeEntry->fresh()->toArray();
        $orderBefore = $order->fresh()->toArray();

        $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->patchJson("/api/employees/{$server->id}/deactivate")
            ->assertOk();

        $this->assertEquals($timeEntryBefore, $timeEntry->fresh()->toArray());
        $this->assertEquals($orderBefore, $order->fresh()->toArray());
        $this->assertDatabaseCount('time_entries', 1);
        $this->assertDatabaseCount('orders', 1);

        $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->patchJson("/api/employees/{$server->id}/reactivate")
            ->assertOk();

        $this->assertEquals($timeEntryBefore, $timeEntry->fresh()->toArray());
        $this->assertEquals($orderBefore, $order->fresh()->toArray());
        $this->assertDatabaseCount('time_entries', 1);
        $this->assertDatabaseCount('orders', 1);
    }
}
