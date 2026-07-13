<?php

namespace Tests\Feature\Orders;

use App\Enums\OrderStatus;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Exercises the Cashier-facing checkout, payment confirmation, and
 * cancellation flow -- the backend half of C-7.
 */
class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return $user->createToken('test-token')->plainTextToken;
    }

    private function asCashier(): array
    {
        $cashier = User::factory()->cashier()->create();

        return ['Authorization' => 'Bearer '.$this->tokenFor($cashier)];
    }

    public function test_cashier_can_checkout_a_pending_order_with_a_valid_payment_method(): void
    {
        Http::fake(['127.0.0.1:*' => Http::response([], 200)]);

        $order = Order::factory()->create(['status' => OrderStatus::Pending]);

        $response = $this->withHeaders($this->asCashier())
            ->patchJson("/api/orders/{$order->id}/checkout", ['payment_method' => 'cash']);

        $response->assertOk()
            ->assertJsonPath('status', 'paid')
            ->assertJsonPath('payment_method', 'cash')
            ->assertJsonPath('print_status', 'printed');

        $this->assertNotNull($response->json('paid_at'));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'paid',
            'payment_method' => 'cash',
        ]);
        $this->assertNotNull($order->fresh()->paid_at);
    }

    public function test_cashier_can_checkout_a_ready_order(): void
    {
        Http::fake(['127.0.0.1:*' => Http::response([], 200)]);

        $order = Order::factory()->create(['status' => OrderStatus::Ready]);

        $response = $this->withHeaders($this->asCashier())
            ->patchJson("/api/orders/{$order->id}/checkout", ['payment_method' => 'gcash']);

        $response->assertOk()->assertJsonPath('status', 'paid');
    }

    public function test_checkout_rejects_an_invalid_payment_method(): void
    {
        $order = Order::factory()->create(['status' => OrderStatus::Pending]);

        $response = $this->withHeaders($this->asCashier())
            ->patchJson("/api/orders/{$order->id}/checkout", ['payment_method' => 'bitcoin']);

        $response->assertUnprocessable()->assertJsonValidationErrors(['payment_method']);
        $this->assertSame('pending', $order->fresh()->status->value);
    }

    public function test_checkout_requires_a_payment_method(): void
    {
        $order = Order::factory()->create(['status' => OrderStatus::Pending]);

        $response = $this->withHeaders($this->asCashier())
            ->patchJson("/api/orders/{$order->id}/checkout", []);

        $response->assertUnprocessable()->assertJsonValidationErrors(['payment_method']);
    }

    public function test_owner_is_rejected_from_checkout(): void
    {
        $owner = User::factory()->owner()->create();
        $order = Order::factory()->create(['status' => OrderStatus::Pending]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->patchJson("/api/orders/{$order->id}/checkout", ['payment_method' => 'cash']);

        $response->assertForbidden();
        $this->assertSame('pending', $order->fresh()->status->value);
    }

    public function test_unauthenticated_request_is_rejected_from_checkout(): void
    {
        $order = Order::factory()->create(['status' => OrderStatus::Pending]);

        $response = $this->patchJson("/api/orders/{$order->id}/checkout", ['payment_method' => 'cash']);

        $response->assertUnauthorized();
        $this->assertSame('pending', $order->fresh()->status->value);
    }

    public function test_checkout_calls_the_print_agent_with_a_correctly_shaped_receipt_body(): void
    {
        Http::fake(['127.0.0.1:*' => Http::response([], 200)]);

        $order = Order::factory()->create(['status' => OrderStatus::Pending]);
        $burger = MenuItem::factory()->create(['name' => 'Cheeseburger', 'price' => 10.00]);
        $fries = MenuItem::factory()->create(['name' => 'Fries', 'price' => 5.50]);
        $order->items()->create(['menu_item_id' => $burger->id, 'quantity' => 2]);
        $order->items()->create(['menu_item_id' => $fries->id, 'quantity' => 1]);

        $response = $this->withHeaders($this->asCashier())
            ->patchJson("/api/orders/{$order->id}/checkout", ['payment_method' => 'cash']);

        $response->assertOk();

        $port = config('services.print_agent.port');

        Http::assertSent(function (ClientRequest $request) use ($port) {
            return $request->url() === "http://127.0.0.1:{$port}/print"
                && $request->method() === 'POST'
                && $request['restaurantName'] === config('app.name')
                && $request['items'] === [
                    ['name' => 'Cheeseburger', 'qty' => 2, 'price' => 10.0],
                    ['name' => 'Fries', 'qty' => 1, 'price' => 5.5],
                ]
                && $request['total'] === 25.5
                && $request['openDrawer'] === true;
        });
    }

    public function test_checkout_does_not_open_the_drawer_for_a_non_cash_payment(): void
    {
        Http::fake(['127.0.0.1:*' => Http::response([], 200)]);

        $order = Order::factory()->create(['status' => OrderStatus::Pending]);

        $this->withHeaders($this->asCashier())
            ->patchJson("/api/orders/{$order->id}/checkout", ['payment_method' => 'qr_ph'])
            ->assertOk();

        Http::assertSent(fn (ClientRequest $request) => $request['openDrawer'] === false);
    }

    public function test_order_is_still_marked_paid_when_the_print_agent_call_fails(): void
    {
        Http::fake(['127.0.0.1:*' => Http::response(['error' => 'Printer unreachable'], 502)]);

        $order = Order::factory()->create(['status' => OrderStatus::Pending]);

        $response = $this->withHeaders($this->asCashier())
            ->patchJson("/api/orders/{$order->id}/checkout", ['payment_method' => 'cash']);

        $response->assertOk()
            ->assertJsonPath('status', 'paid')
            ->assertJsonPath('print_status', 'failed');

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
    }

    public function test_cannot_checkout_an_already_paid_order(): void
    {
        Http::fake(['127.0.0.1:*' => Http::response([], 200)]);

        $order = Order::factory()->create([
            'status' => OrderStatus::Paid,
            'payment_method' => 'cash',
            'paid_at' => now(),
        ]);

        $response = $this->withHeaders($this->asCashier())
            ->patchJson("/api/orders/{$order->id}/checkout", ['payment_method' => 'gcash']);

        $response->assertStatus(409);
        $this->assertSame('cash', $order->fresh()->payment_method->value);
    }

    public function test_cannot_checkout_an_already_cancelled_order(): void
    {
        $order = Order::factory()->create(['status' => OrderStatus::Cancelled]);

        $response = $this->withHeaders($this->asCashier())
            ->patchJson("/api/orders/{$order->id}/checkout", ['payment_method' => 'cash']);

        $response->assertStatus(409);
        $this->assertSame('cancelled', $order->fresh()->status->value);
    }

    public function test_cashier_can_cancel_a_pending_order(): void
    {
        $order = Order::factory()->create(['status' => OrderStatus::Pending]);

        $response = $this->withHeaders($this->asCashier())
            ->postJson("/api/orders/{$order->id}/cancel");

        $response->assertOk()->assertJsonPath('status', 'cancelled');
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'cancelled']);
    }

    public function test_owner_is_rejected_from_cancel(): void
    {
        $owner = User::factory()->owner()->create();
        $order = Order::factory()->create(['status' => OrderStatus::Pending]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson("/api/orders/{$order->id}/cancel");

        $response->assertForbidden();
        $this->assertSame('pending', $order->fresh()->status->value);
    }

    public function test_unauthenticated_request_is_rejected_from_cancel(): void
    {
        $order = Order::factory()->create(['status' => OrderStatus::Pending]);

        $response = $this->postJson("/api/orders/{$order->id}/cancel");

        $response->assertUnauthorized();
        $this->assertSame('pending', $order->fresh()->status->value);
    }

    public function test_cannot_cancel_an_already_paid_order(): void
    {
        $order = Order::factory()->create([
            'status' => OrderStatus::Paid,
            'payment_method' => 'cash',
            'paid_at' => now(),
        ]);

        $response = $this->withHeaders($this->asCashier())
            ->postJson("/api/orders/{$order->id}/cancel");

        $response->assertStatus(409);
        $this->assertSame('paid', $order->fresh()->status->value);
    }

    public function test_cancelled_order_does_not_appear_in_the_pending_orders_filter(): void
    {
        $pending = Order::factory()->create(['status' => OrderStatus::Pending]);
        $cancelled = Order::factory()->create(['status' => OrderStatus::Pending]);

        $this->withHeaders($this->asCashier())
            ->postJson("/api/orders/{$cancelled->id}/cancel")
            ->assertOk();

        $response = $this->getJson('/api/orders?status=pending');

        $response->assertOk();
        $ids = collect($response->json())->pluck('id');

        $this->assertTrue($ids->contains($pending->id));
        $this->assertFalse($ids->contains($cancelled->id));
    }
}
