<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Employee management (C-21). Owner-only: create, list, edit, and
 * deactivate/reactivate the Owner/Cashier/Server/Kitchen users who staff
 * the restaurant. Owner, Cashier, and Server are login roles (email +
 * password); Kitchen is identified by a unique 6-digit PIN instead (C-12).
 *
 * Deactivating a user never deletes the row -- it only flips `active` to
 * false, so their historical time_entries and orders stay exactly as they
 * were. AuthController::login and KitchenClockController::clock both check
 * `active` and reject a deactivated user the same way they reject wrong
 * credentials, so deactivation can't be inferred from the login response.
 */
class EmployeeController extends Controller
{
    /**
     * Roles authenticated by email + password, as opposed to Kitchen's PIN.
     */
    private const LOGIN_ROLES = [UserRole::Owner, UserRole::Cashier, UserRole::Server];

    /**
     * List every employee -- id, name, role, active status, and (for login
     * roles) email. The raw password and PIN are never exposed; Kitchen
     * rows instead report whether a PIN is set via `has_pin`.
     */
    public function index(): JsonResponse
    {
        $employees = User::all()->map(fn (User $user) => $this->present($user));

        return response()->json($employees->values());
    }

    /**
     * Create a new employee with the role-appropriate credential.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules($request, null));

        // The `email` and `password` columns are NOT NULL at the schema
        // level (pre-dating Kitchen, which authenticates by PIN alone --
        // see the `pin` migration). A Kitchen employee gets an internal,
        // never-exposed placeholder for both instead of a schema change.
        $user = User::create([
            'name' => $data['name'],
            'role' => $data['role'],
            'email' => $data['email'] ?? $this->placeholderEmail(),
            'password' => Hash::make($data['password'] ?? Str::random(40)),
            'pin' => $data['pin'] ?? null,
            'active' => true,
        ]);

        return response()->json($this->present($user), 201);
    }

    /**
     * Change an employee's role and/or reset their credential (a new
     * password for a login role, a new PIN for Kitchen).
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $rules = $this->rules($request, $user, sometimes: true);
        unset($rules['name']);

        $data = $request->validate($rules);

        if (array_key_exists('role', $data)) {
            $user->role = $data['role'];
        }

        if (array_key_exists('email', $data)) {
            $user->email = $data['email'];
        }

        if (array_key_exists('password', $data)) {
            $user->password = Hash::make($data['password']);
        }

        if (array_key_exists('pin', $data)) {
            $user->pin = $data['pin'];
        }

        $user->save();

        return response()->json($this->present($user));
    }

    /**
     * Deactivate an employee. Refused for the caller's own account (an
     * Owner can't lock themselves out) and for the last remaining active
     * Owner (someone has to be left who can undo it). Never touches the
     * user's historical time_entries or orders rows -- only `active`
     * changes.
     */
    public function deactivate(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            throw ValidationException::withMessages([
                'user' => 'You cannot deactivate your own account.',
            ]);
        }

        if ($user->role === UserRole::Owner) {
            $activeOwners = User::where('role', UserRole::Owner)->where('active', true)->count();

            if ($activeOwners <= 1) {
                throw ValidationException::withMessages([
                    'user' => 'Cannot deactivate the last remaining active Owner.',
                ]);
            }
        }

        $user->update(['active' => false]);

        return response()->json($this->present($user));
    }

    /**
     * Reactivate a previously deactivated employee. No restrictions.
     */
    public function reactivate(Request $request, User $user): JsonResponse
    {
        $user->update(['active' => true]);

        return response()->json($this->present($user));
    }

    /**
     * The public shape of an employee: never the raw password or PIN.
     *
     * @return array<string, mixed>
     */
    private function present(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => in_array($user->role, self::LOGIN_ROLES, true) ? $user->email : null,
            'role' => $user->role,
            'active' => $user->active,
            'has_pin' => $user->pin !== null,
        ];
    }

    /**
     * An internal, unique placeholder for the NOT NULL `email` column on a
     * Kitchen employee, who never logs in with one.
     */
    private function placeholderEmail(): string
    {
        return sprintf('kitchen-%s@internal.invalid', Str::uuid());
    }

    /**
     * Validation rules shared by store and update. On update, every field
     * is optional (`sometimes`) -- only the credential relevant to the
     * (possibly-just-changed) role is required to be well-formed if
     * present at all.
     *
     * @return array<string, array<mixed>>
     */
    private function rules(Request $request, ?User $user, bool $sometimes = false): array
    {
        $wrap = fn (array $rules) => $sometimes ? array_merge(['sometimes'], $rules) : $rules;

        // On update, a client resetting a credential without also
        // resending `role` is validated against the employee's current
        // role, not left unvalidated.
        $role = $request->input('role', $user?->role?->value);
        $isKitchen = $role === UserRole::Kitchen->value;

        $credentialRequired = $sometimes ? 'sometimes' : 'required';

        $rules = [
            'name' => $wrap(['required', 'string', 'max:255']),
            'role' => $wrap(['required', Rule::enum(UserRole::class)]),
        ];

        if ($isKitchen) {
            $rules['pin'] = [
                $credentialRequired,
                'digits:6',
                Rule::unique('users', 'pin')->ignore($request->route('user')),
            ];
        } else {
            $rules['email'] = [
                $credentialRequired,
                'email',
                Rule::unique('users', 'email')->ignore($request->route('user')),
            ];
            $rules['password'] = [$credentialRequired, 'string', 'min:8'];
        }

        return $rules;
    }
}
