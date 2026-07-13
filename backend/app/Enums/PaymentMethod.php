<?php

namespace App\Enums;

/**
 * How a Cashier recorded a payment as received during checkout (C-7).
 *
 * Per ADR-005, v1 confirms payment manually rather than integrating a live
 * gateway -- the restaurant accepts cash in person, QR Ph (a customer-scanned
 * QR code), or GCash (a Philippine e-wallet transfer).
 */
enum PaymentMethod: string
{
    case Cash = 'cash';
    case QrPh = 'qr_ph';
    case Gcash = 'gcash';
}
