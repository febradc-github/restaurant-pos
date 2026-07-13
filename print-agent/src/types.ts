/** A single line item on a receipt. */
export interface ReceiptLineItem {
  name: string;
  qty: number;
  price: number;
}

/**
 * Body shape accepted by `POST /print`.
 *
 * `timestamp` is optional and defaults to "now" (server time) if omitted.
 * `openDrawer` is optional and defaults to `true` -- most restaurant checkout
 * flows want the cash drawer to pop on every completed sale. Set it to
 * `false` to print a receipt without kicking the drawer (e.g. a reprint).
 */
export interface ReceiptRequest {
  restaurantName: string;
  timestamp?: string;
  items: ReceiptLineItem[];
  total: number;
  openDrawer?: boolean;
}
