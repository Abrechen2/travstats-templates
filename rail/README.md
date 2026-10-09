# rail/

v2 templates that read train journeys. Every file is listed in the root
[`index.json`](../index.json); the order there is the order the app tries them.

| File | `documentKind` | Reads |
|---|---|---|
| `db-confirmation.json` | booking | Deutsche Bahn booking mails of the 2020s (`von X, dd.mm.yyyy hh:mm Uhr` / `nach Y, …` per ride) |
| `db-online-ticket.json` | booking | DB "Online-Ticket" PDFs: the row-wise table (2010–2023) and the column-wise extraction since spring 2024 |
| `db-postal-order.json` | booking | DB postal orders 2010–2015 (`dd.mm.yyyy: X hh:mm - Y hh:mm`, one line per direction) |
| `db-connection-info.json` | booking | DB "Verbindungsauskunft" of 2008 (one row per train) |
| `db-order-facts.json` | orderFacts | the reference and total of a DB order mail whose itinerary is in the attached ticket |
| `db-reservation-ticket.json` | reservation | a DB seat reservation printed as the Online-Ticket table |
| `db-reservation-mail.json` | reservation | a reservation-only DB confirmation mail |

All markets: DE. The draft `db.json` these replace is gone.

## Where they come from

Until TravStats plan 2026-10-09 P4b these readers were TypeScript code in the
app. The files read the same documents the same way, and the app's test suite
compares every reader with its file on every rail fixture. Change a reader
here, not in the app.

## Values a rail template may set

- `documentKind` (constant, required): `booking` — rides that become journeys;
  `reservation` — seats for rides the user already has (a document a
  reservation template recognises is never read as a booking, so its matcher
  must refuse tickets: see `noneOf`); `orderFacts` — no legs, only the order.
- `bookingReference`, `travelClass` (`first` / `second` — use the
  `travelClass` transform), `tariff`, `price` (number), `currency` (ISO code,
  kept only beside a price), `operator`, and optionally `source` (the reader
  name a booking carries; default the file's id without `rail:`).
- a `legs` repeat: `depStationName`, `arrStationName`, `departureLocal`,
  `arrivalLocal` (`YYYY-MM-DDTHH:MM` on the station's clock), `trainCategory`,
  `trainNumber` (only when the document prints one — never invent it),
  `coach`, `seat`, `direction` (`outbound` / `return`). A leg without both
  stations and a departure is dropped.

## Constructs these files rely on

- `columns` + `pairs` + strict `zip`: the 2024 Online-Ticket table comes out of
  the PDF column by column — every station, then every date, then every time.
  The columns are paired by position only while they are equally long; an
  "ab" stop and the next "an" stop make a leg; a product line is given to a leg
  only when there is exactly one per leg.
- a split repeat with nested repeats and `emit`: one block per ticket section,
  whose date dates the `dd.mm.` cells (`dayMonthNear`) and whose heading gives
  the direction.
- `lastBefore`: the "Hinfahrt" / "Rückfahrt" heading in force for a ride.
- `laterClock`: an arrival printed as a clock only falls on the next day when it
  reads earlier than the departure.
