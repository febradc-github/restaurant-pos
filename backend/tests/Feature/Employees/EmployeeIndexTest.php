<?php

namespace Tests\Feature\Employees;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * GET /api/employees (C-21): Owner-only listing of every employee, with
 * role and active status.
 */
class EmployeeIndexTest extends TestCase
{
    use RefreshDatabase;

    private function ownerToken(): string
    {
        $owner = User::factory()->owner()->create();

        return $owner->createToken('test-token')->plainTextToken;
    }

    public function test_requires_authentication(): void
    {
        $response = $this->getJson('/api/employees');

        $response->assertUnauthorized();
    }

    public function test_non_owner_roles_are_forbidden(): void
    {
        $cashier = User::factory()->cashier()->create();
        $token = $cashier->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/employees');

        $response->assertForbidden();
    }

    public function test_lists_every_employee_with_role_and_active_status(): void
    {
        $token = $this->ownerToken();
        $cashier = User::factory()->cashier()->create(['name' => 'Cara Cashier', 'active' => true]);
        $inactiveServer = User::factory()->server()->create(['name' => 'Sam Server', 'active' => false]);
        $cook = User::factory()->kitchen('112233')->create(['name' => 'Kim Kitchen']);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/employees');

        $response->assertOk();
        $payload = collect($response->json());

        $cashierRow = $payload->firstWhere('id', $cashier->id);
        $this->assertSame('cashier', $cashierRow['role']);
        $this->assertTrue($cashierRow['active']);

        $serverRow = $payload->firstWhere('id', $inactiveServer->id);
        $this->assertSame('server', $serverRow['role']);
        $this->assertFalse($serverRow['active']);

        $cookRow = $payload->firstWhere('id', $cook->id);
        $this->assertSame('kitchen', $cookRow['role']);
        $this->assertTrue($cookRow['has_pin']);
        $this->assertArrayNotHasKey('pin', $cookRow);
    }

    public function test_does_not_expose_raw_password_or_pin(): void
    {
        $token = $this->ownerToken();
        User::factory()->kitchen('998877')->create();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/employees');

        $response->assertOk();
        foreach ($response->json() as $row) {
            $this->assertArrayNotHasKey('password', $row);
            $this->assertArrayNotHasKey('pin', $row);
        }
    }
}
