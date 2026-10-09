# cruise/

v2 templates that read cruise booking confirmations. Every file is listed in the
root [`index.json`](../index.json); the order there is the order the app tries
them.

| File | Reads | Markets |
|---|---|---|
| `tui-cruises-confirmation.json` | TUI Cruises ("Mein Schiff") confirmations and option confirmations (German PDF text), back-to-back bookings included | DE, AT, CH |

## Where it comes from

Until TravStats plan 2026-10-09 P4b the TUI Cruises reader was TypeScript code
in the app. The file reads the same document the same way, and the app's test
suite proves it on every cruise fixture: same voyages, same stops, same
`missing`. Change the reader here, not in the app.

AIDA confirmations are read by the app's language model only — there was never
a deterministic AIDA reader to move. A template for them is welcome.

## Values a cruise template may set

A `cruises` repeat, one item per voyage, each with a nested `stops` repeat:

- voyage: `shipName`, `cruiseLine`, `routeName`, `startDate`, `endDate`
  (`YYYY-MM-DD`), `departurePortName`, `arrivalPortName`, `cabinNumber`,
  `cabinType` (`inside` / `oceanview` / `balcony` / `suite`, or the category
  text the app maps: "Junior Suite Balkon" → suite), `deck` (integer),
  `bookingReference`, `price` (number), `currency` (ISO code);
- stop: `date`, `portName`, `isAtSea` (`true` for a sea day — map "Seetag").

Any voyage value may also be a document-level field; it then applies to every
voyage that does not state its own (a booking number printed once). What the
app derives itself: stops numbered from one, a sea day without a port name,
start/end and ports from the first and last stop, a currency only beside a
price, a voyage without stops dropped.
