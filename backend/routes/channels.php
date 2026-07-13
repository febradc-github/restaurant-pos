<?php

use Illuminate\Support\Facades\Broadcast;

// Kitchen Display channel (C-6). Public -- Kitchen is a no-login device (the
// same access pattern as /api/tables, /api/menu-items, and /api/orders), so
// new/updated orders are broadcast on a plain public channel, not a private
// one. Registering it here isn't strictly required for a public channel
// (only private/presence channels invoke an authorization callback), but
// it documents the channel's existence in the one place channels are meant
// to be declared.
Broadcast::channel('kitchen', function () {
    return true;
});
