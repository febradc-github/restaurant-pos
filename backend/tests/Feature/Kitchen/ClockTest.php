<?php

namespace Tests\Feature\Kitchen;

use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PIN-based clock-in/clock-out for Kitchen (C-12). Deliberately outside
 * auth:sanctum -- Kitchen has no login at all, same as the order endpoints
 * it shares a display with (C-6). No Sanctum token is ever issued here.
 */
class ClockTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_valid_pin_with_no_open_entry_clocks_the_kitchen_user_in(): void
    {
        $cook = User::factory()->kitchen('123456')->create(['name' => 'Kitchen Kev']);

        $this->travelTo(now());

        $response = $this->postJson('/api/kitchen/clock', ['pin' => '123456']);

        $response->assertOk()
            ->assertJsonPath('action', 'clocked_in')
            ->assertJsonPath('employee.id', $cook->id)
            ->assertJsonPath('employee.name', 'Kitchen Kev');

        $this->assertDatabaseHas('time_entries', [
            'user_id' => $cook->id,
            'role' => 'kitchen',
            'clock_in' => now(),
            'clock_out' => null,
            'auto_closed' => false,
        ]);
        $this->assertDatabaseCount('time_entries', 1);
    }

    public function test_submitting_the_same_pin_again_clocks_the_kitchen_user_back_out(): void
    {
        $cook = User::factory()->kitchen('123456')->create(['name' => 'Kitchen Kev']);

        $this->travelTo(now());
        $this->postJson('/api/kitchen/clock', ['pin' => '123456'])->assertOk();

        $this->travelTo(now()->addHour());
        $response = $this->postJson('/api/kitchen/clock', ['pin' => '123456']);

        $response->assertOk()
            ->assertJsonPath('action', 'clocked_out')
            ->assertJsonPath('employee.id', $cook->id);

        $this->assertDatabaseCount('time_entries', 1);
        $this->assertDatabaseHas('time_entries', [
            'user_id' => $cook->id,
            'clock_out' => now(),
        ]);
    }

    public function test_pin_entry_toggles_clock_in_and_out_across_repeated_submissions(): void
    {
        User::factory()->kitchen('123456')->create();

        $this->postJson('/api/kitchen/clock', ['pin' => '123456'])
            ->assertJsonPath('action', 'clocked_in');
        $this->postJson('/api/kitchen/clock', ['pin' => '123456'])
            ->assertJsonPath('action', 'clocked_out');
        $this->postJson('/api/kitchen/clock', ['pin' => '123456'])
            ->assertJsonPath('action', 'clocked_in');
        $this->postJson('/api/kitchen/clock', ['pin' => '123456'])
            ->assertJsonPath('action', 'clocked_out');

        $this->assertDatabaseCount('time_entries', 2);
    }

    public function test_clocking_in_creates_no_sanctum_token(): void
    {
        User::factory()->kitchen('123456')->create();

        $response = $this->postJson('/api/kitchen/clock', ['pin' => '123456']);

        $response->assertOk();
        $this->assertArrayNotHasKey('token', $response->json());
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_an_unrecognized_pin_is_rejected_generically(): void
    {
        User::factory()->kitchen('123456')->create();

        $response = $this->postJson('/api/kitchen/clock', ['pin' => '999999']);

        $response->assertUnprocessable();
        $this->assertDatabaseCount('time_entries', 0);
    }

    public function test_a_malformed_pin_is_rejected_with_the_same_status_and_message_as_an_unrecognized_one(): void
    {
        User::factory()->kitchen('123456')->create();

        $unrecognized = $this->postJson('/api/kitchen/clock', ['pin' => '999999']);
        $malformed = $this->postJson('/api/kitchen/clock', ['pin' => 'not-a-pin']);

        $unrecognized->assertUnprocessable();
        $malformed->assertUnprocessable();
        $this->assertSame($unrecognized->getStatusCode(), $malformed->getStatusCode());
        $this->assertSame($unrecognized->json('message'), $malformed->json('message'));
    }

    public function test_a_pin_belonging_to_a_non_kitchen_user_is_rejected(): void
    {
        // Owner/Cashier/Server rows have no pin at all, but guard against a
        // future data slip (e.g. a stray non-null value) rather than trust
        // the role filter never gets dropped from the query.
        User::factory()->cashier()->create(['pin' => '555555']);

        $response = $this->postJson('/api/kitchen/clock', ['pin' => '555555']);

        $response->assertUnprocessable();
        $this->assertDatabaseCount('time_entries', 0);
    }

    public function test_clock_endpoint_requires_no_authentication(): void
    {
        User::factory()->kitchen('123456')->create();

        // No Authorization header attached anywhere in this request.
        $response = $this->postJson('/api/kitchen/clock', ['pin' => '123456']);

        $response->assertOk();
    }

    public function test_reopening_after_an_already_closed_entry_creates_a_fresh_row_instead_of_reusing_the_closed_one(): void
    {
        $cook = User::factory()->kitchen('123456')->create();
        TimeEntry::factory()->clockedOut()->create(['user_id' => $cook->id, 'role' => 'kitchen']);

        $response = $this->postJson('/api/kitchen/clock', ['pin' => '123456']);

        $response->assertJsonPath('action', 'clocked_in');
        $this->assertDatabaseCount('time_entries', 2);
    }
}
