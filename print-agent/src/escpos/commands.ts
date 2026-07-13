/**
 * Raw ESC/POS command bytes used to build receipts.
 *
 * ESC/POS is the de-facto command language for thermal receipt printers
 * (Epson TM-T88 series and most compatible printers). Every constant here
 * is a `Buffer` of the exact bytes to send to the printer -- there is no
 * text encoding beyond plain ASCII/latin1, which is what these printers
 * expect on their raw TCP port (conventionally 9100).
 */

const ESC = 0x1b;
const GS = 0x1d;

/** ESC @ -- reset the printer to its default state. Always send this first. */
export const INIT = Buffer.from([ESC, 0x40]);

/** Line feed. */
export const LF = Buffer.from([0x0a]);

/** ESC E 1 / ESC E 0 -- turn emphasized (bold) print on/off. */
export const BOLD_ON = Buffer.from([ESC, 0x45, 0x01]);
export const BOLD_OFF = Buffer.from([ESC, 0x45, 0x00]);

/** ESC a n -- text justification: 0 = left, 1 = center, 2 = right. */
export const ALIGN_LEFT = Buffer.from([ESC, 0x61, 0x00]);
export const ALIGN_CENTER = Buffer.from([ESC, 0x61, 0x01]);

/** GS V 0 -- full paper cut. */
export const CUT = Buffer.from([GS, 0x56, 0x00]);

/**
 * ESC p m t1 t2 -- generate a pulse on the cash-drawer connector to kick
 * the drawer open. This is the standard sequence documented for
 * Epson-compatible printers: m=0 selects drawer pin 2, t1=25 and t2=250
 * set the on/off pulse timing (each unit is ~2ms), giving a pulse long
 * enough to reliably trip a solenoid drawer.
 */
export const DRAWER_KICK = Buffer.from([ESC, 0x70, 0x00, 0x19, 0xfa]);
