<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\TableShape;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Table;
use App\Models\TimeEntry;
use App\Models\User;
use Closure;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Seeder;

/**
 * Demo data seeder (C-27): populates a fresh database with enough realistic
 * data -- users, menu, inventory, tables, orders, and time entries -- for a
 * live demo or local dev to exercise every screen (Kitchen Display, Cashier
 * Checkout, Employee/Attendance views, Analytics Dashboard) without manual
 * setup. Run with `php artisan db:seed`.
 *
 * The five fixed demo users are looked up by email (login roles) or PIN
 * (Kitchen) via firstOrCreate-style lookups, so re-running against an
 * already-seeded database updates rather than duplicates them. Menu,
 * inventory, and tables are looked up by name/label the same way. Orders and
 * time entries are NOT re-seeded once any exist, so re-running is safe but
 * won't pile up duplicate transaction history -- for a full reset, use
 * `php artisan migrate:fresh --seed`.
 */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Fixed password shared by every login-role demo user (Owner, Cashier,
     * Server). Documented here and printed to console on every run.
     */
    private const PASSWORD = 'password';

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = $this->seedUsers();
        $menuItems = $this->seedMenu();
        $this->seedInventory($menuItems);
        $tables = $this->seedTables();
        $this->seedOrders($tables, $menuItems);
        $this->seedTimeEntries($users);

        $this->printCredentials($users);
    }

    /**
     * One Owner, one Cashier, one Server (password login), and two Kitchen
     * employees (PIN login) -- fixed, memorable credentials rather than
     * fake() values, since a human needs to actually log in with them
     * during a demo.
     *
     * @return array<string, User>
     */
    private function seedUsers(): array
    {
        $owner = $this->firstOrCreateLoginUser('owner@demo.pos', 'Demo Owner', fn () => User::factory()->owner());
        $cashier = $this->firstOrCreateLoginUser('cashier@demo.pos', 'Demo Cashier', fn () => User::factory()->cashier());
        $server = $this->firstOrCreateLoginUser('server@demo.pos', 'Demo Server', fn () => User::factory()->server());

        $kitchen1 = User::query()->where('pin', '111111')->first()
            ?? User::factory()->kitchen('111111')->create([
                'name' => 'Kitchen One',
                'email' => 'kitchen1@demo.pos',
                'active' => true,
            ]);

        $kitchen2 = User::query()->where('pin', '222222')->first()
            ?? User::factory()->kitchen('222222')->create([
                'name' => 'Kitchen Two',
                'email' => 'kitchen2@demo.pos',
                'active' => true,
            ]);

        return compact('owner', 'cashier', 'server', 'kitchen1', 'kitchen2');
    }

    /**
     * Look up a login-role demo user by email, creating it via the given
     * factory state with the fixed demo password if it doesn't exist yet.
     *
     * @param  Closure(): Factory<User>  $factoryState
     */
    private function firstOrCreateLoginUser(string $email, string $name, Closure $factoryState): User
    {
        return User::query()->where('email', $email)->first()
            ?? $factoryState()->create([
                'name' => $name,
                'email' => $email,
                'password' => self::PASSWORD,
                'active' => true,
            ]);
    }

    /**
     * At least three categories, each with several available menu items at
     * varying prices.
     *
     * @return array<string, MenuItem> keyed by menu item name
     */
    private function seedMenu(): array
    {
        $menu = [
            'Burgers' => [
                'Classic Cheeseburger' => '6.50',
                'Double Bacon Burger' => '8.75',
                'Veggie Burger' => '6.00',
            ],
            'Sides' => [
                'French Fries' => '3.00',
                'Onion Rings' => '3.50',
                'Coleslaw' => '2.50',
            ],
            'Drinks' => [
                'Iced Tea' => '2.00',
                'Bottled Water' => '1.50',
                'Soda' => '2.25',
            ],
            'Desserts' => [
                'Chocolate Cake' => '4.50',
                'Ice Cream' => '3.25',
            ],
        ];

        $menuItems = [];

        foreach ($menu as $categoryName => $items) {
            $category = Category::query()->firstOrCreate(['name' => $categoryName]);

            foreach ($items as $itemName => $price) {
                $menuItems[$itemName] = MenuItem::query()->firstOrCreate(
                    ['name' => $itemName],
                    ['price' => $price, 'category_id' => $category->id, 'available' => true],
                );
            }
        }

        return $menuItems;
    }

    /**
     * Inventory items linked to the menu items that consume them, with
     * realistic quantity_required values -- and stock/threshold set so at
     * least one item shows a restock shortfall (stock < threshold) and at
     * least one other sits comfortably above its threshold, per C-25's
     * restock view.
     *
     * @param  array<string, MenuItem>  $menuItems
     */
    private function seedInventory(array $menuItems): void
    {
        $inventory = [
            // Below threshold -- a visible restock shortfall in the demo.
            'Beef Patty' => ['stock' => 15, 'threshold' => 30],
            'Burger Buns' => ['stock' => 18, 'threshold' => 25],
            // Comfortably above threshold.
            'Cheese Slices' => ['stock' => 40, 'threshold' => 15],
            'Lettuce' => ['stock' => 25, 'threshold' => 10],
            'Iced Tea Mix' => ['stock' => 50, 'threshold' => 10],
            'Ice Cream Scoops' => ['stock' => 60, 'threshold' => 20],
        ];

        $inventoryItems = [];

        foreach ($inventory as $name => $levels) {
            $inventoryItems[$name] = InventoryItem::query()->firstOrCreate(['name' => $name], $levels);
        }

        $requirements = [
            'Classic Cheeseburger' => ['Beef Patty' => 1, 'Burger Buns' => 1, 'Cheese Slices' => 1],
            'Double Bacon Burger' => ['Beef Patty' => 2, 'Burger Buns' => 1, 'Cheese Slices' => 2],
            'Veggie Burger' => ['Burger Buns' => 1, 'Lettuce' => 1],
            'Iced Tea' => ['Iced Tea Mix' => 1],
            'Ice Cream' => ['Ice Cream Scoops' => 1],
        ];

        foreach ($requirements as $menuItemName => $required) {
            $menuItem = $menuItems[$menuItemName];

            foreach ($required as $inventoryItemName => $quantityRequired) {
                $menuItem->inventoryItems()->syncWithoutDetaching([
                    $inventoryItems[$inventoryItemName]->id => ['quantity_required' => $quantityRequired],
                ]);
            }
        }
    }

    /**
     * A handful of floor-plan tables with a mix of shapes and capacities.
     *
     * @return array<int, Table>
     */
    private function seedTables(): array
    {
        $tables = [
            ['label' => 'Table 1', 'shape' => TableShape::Round, 'capacity' => 2],
            ['label' => 'Table 2', 'shape' => TableShape::Square, 'capacity' => 4],
            ['label' => 'Table 3', 'shape' => TableShape::Rectangular, 'capacity' => 6],
            ['label' => 'Table 4', 'shape' => TableShape::Round, 'capacity' => 4],
            ['label' => 'Table 5', 'shape' => TableShape::Square, 'capacity' => 2],
            ['label' => 'Table 6', 'shape' => TableShape::Rectangular, 'capacity' => 8],
        ];

        return array_map(
            fn (array $table, int $index) => Table::query()->firstOrCreate(
                ['label' => $table['label']],
                [
                    'shape' => $table['shape'],
                    'capacity' => $table['capacity'],
                    'x' => ($index % 3) * 220,
                    'y' => intdiv($index, 3) * 220,
                    'width' => 120,
                    'height' => 120,
                ],
            ),
            $tables,
            array_keys($tables),
        );
    }

    /**
     * A realistic spread of orders across the last 30 days: several Paid
     * orders with paid_at timestamps spread across different days (so the
     * sales trend chart shows real day-to-day variation) plus a few
     * Pending/Ready/Cancelled orders dated today, so the Kitchen Display
     * and Cashier Checkout screens have something to show too.
     *
     * Skipped entirely if orders already exist -- this seeder isn't meant
     * to keep piling up transaction history on repeated runs.
     *
     * @param  array<int, Table>  $tables
     * @param  array<string, MenuItem>  $menuItems
     */
    private function seedOrders(array $tables, array $menuItems): void
    {
        if (Order::query()->exists()) {
            return;
        }

        $menuItemList = array_values($menuItems);
        $paymentMethods = PaymentMethod::cases();

        // Paid orders scattered across the last 30 days, 0-3 per day, so
        // some days are busy, some quiet, and none is "today only".
        for ($daysAgo = 29; $daysAgo >= 1; $daysAgo--) {
            for ($i = 0, $count = random_int(0, 3); $i < $count; $i++) {
                $this->createPaidOrder($tables, $menuItemList, $daysAgo, $paymentMethods);
            }
        }

        // Guarantee a healthy amount of sales data even if the random walk
        // above landed sparse.
        for ($i = 0; $i < 6; $i++) {
            $this->createPaidOrder($tables, $menuItemList, random_int(1, 29), $paymentMethods);
        }

        // A few orders still moving through today's workflow.
        $this->createOrderWithItems($tables[0], OrderStatus::Pending, $menuItemList);
        $this->createOrderWithItems($tables[1], OrderStatus::Pending, $menuItemList);
        $this->createOrderWithItems($tables[2], OrderStatus::Ready, $menuItemList);

        // A cancelled order -- must not carry paid_at and must not
        // contribute revenue (C-24's Paid-only filtering).
        $this->createOrderWithItems($tables[3], OrderStatus::Cancelled, $menuItemList);
    }

    /**
     * @param  array<int, Table>  $tables
     * @param  array<int, MenuItem>  $menuItemList
     * @param  array<int, PaymentMethod>  $paymentMethods
     */
    private function createPaidOrder(array $tables, array $menuItemList, int $daysAgo, array $paymentMethods): void
    {
        $paidAt = now()->subDays($daysAgo)->setTime(random_int(11, 20), random_int(0, 59));
        $table = $tables[array_rand($tables)];

        $order = Order::factory()->create([
            'table_id' => $table->id,
            'status' => OrderStatus::Paid,
            'payment_method' => $paymentMethods[array_rand($paymentMethods)],
            'paid_at' => $paidAt,
        ]);

        $this->attachRandomItems($order, $menuItemList);
    }

    /**
     * @param  array<int, MenuItem>  $menuItemList
     */
    private function createOrderWithItems(Table $table, OrderStatus $status, array $menuItemList): void
    {
        $order = Order::factory()->create([
            'table_id' => $table->id,
            'status' => $status,
        ]);

        $this->attachRandomItems($order, $menuItemList);
    }

    /**
     * @param  array<int, MenuItem>  $menuItemList
     */
    private function attachRandomItems(Order $order, array $menuItemList): void
    {
        $lineCount = random_int(1, 3);
        $chosen = (array) array_rand($menuItemList, min($lineCount, count($menuItemList)));

        foreach ($chosen as $index) {
            OrderItem::factory()->create([
                'order_id' => $order->id,
                'menu_item_id' => $menuItemList[$index]->id,
                'quantity' => random_int(1, 3),
            ]);
        }
    }

    /**
     * A handful of time entries for the seeded Server, Cashier, and both
     * Kitchen users -- closed shifts with realistic clock_in/clock_out
     * pairs, one still-open entry, and one auto_closed entry -- so the
     * Attendance view has real data. Skipped if time entries already exist,
     * for the same re-run-safety reason as seedOrders().
     *
     * @param  array<string, User>  $users
     */
    private function seedTimeEntries(array $users): void
    {
        if (TimeEntry::query()->exists()) {
            return;
        }

        $shiftWorkers = [
            ['user' => $users['cashier'], 'role' => UserRole::Cashier],
            ['user' => $users['server'], 'role' => UserRole::Server],
            ['user' => $users['kitchen1'], 'role' => UserRole::Kitchen],
            ['user' => $users['kitchen2'], 'role' => UserRole::Kitchen],
        ];

        foreach ($shiftWorkers as $worker) {
            TimeEntry::factory()->create([
                'user_id' => $worker['user']->id,
                'role' => $worker['role'],
                'clock_in' => now()->subDays(2)->setTime(8, 0),
                'clock_out' => now()->subDays(2)->setTime(16, 0),
            ]);

            TimeEntry::factory()->create([
                'user_id' => $worker['user']->id,
                'role' => $worker['role'],
                'clock_in' => now()->subDay()->setTime(9, 0),
                'clock_out' => now()->subDay()->setTime(17, 0),
            ]);
        }

        // Still clocked in.
        TimeEntry::factory()->create([
            'user_id' => $users['server']->id,
            'role' => UserRole::Server,
            'clock_in' => now()->subHours(2),
            'clock_out' => null,
        ]);

        // Forgot to clock out -- closed by C-13's auto-close job.
        TimeEntry::factory()->create([
            'user_id' => $users['kitchen1']->id,
            'role' => UserRole::Kitchen,
            'clock_in' => now()->subDays(3)->setTime(8, 0),
            'clock_out' => now()->subDays(3)->setTime(23, 59),
            'auto_closed' => true,
        ]);
    }

    /**
     * Print every seeded login credential to the console, so a human
     * running `php artisan db:seed` sees them immediately without reading
     * this file.
     *
     * @param  array<string, User>  $users
     */
    private function printCredentials(array $users): void
    {
        $this->command?->info('');
        $this->command?->info('===== Demo credentials (C-27) =====');
        $this->command?->info("Owner    | email: {$users['owner']->email} | password: ".self::PASSWORD);
        $this->command?->info("Cashier  | email: {$users['cashier']->email} | password: ".self::PASSWORD);
        $this->command?->info("Server   | email: {$users['server']->email} | password: ".self::PASSWORD);
        $this->command?->info("Kitchen (\"{$users['kitchen1']->name}\") | PIN: {$users['kitchen1']->pin}");
        $this->command?->info("Kitchen (\"{$users['kitchen2']->name}\") | PIN: {$users['kitchen2']->pin}");
        $this->command?->info('====================================');
    }
}
