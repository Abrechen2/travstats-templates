# package/

v2 templates that read package tours — one document becomes a trip proposal:
the trip, its flights, stays, an optional cruise and the booking with its total.
Every file is listed in the root [`index.json`](../index.json).

| File | Reads | Markets |
|---|---|---|
| `berge-meer-invoice.json` | Berge & Meer invoices (booking number, issue date, travellers, total, flights) | DE, AT, CH |
| `berge-meer-documents.json` | Berge & Meer travel documents (flights and hotel nights with addresses) | DE, AT, CH |

Both were written in the TravStats repository (plan 2026-10-09 P3) and checked
against the owner's real documents — all eight invoices and three travel
documents read fully — before they moved here in P4b. Their test cases are
invented, shaped like the real layout.

## Values a package template may set

`bookingReference` and `issuedOn` (required), `tripName`, `startDate`,
`endDate`, `travellers`, `totalPrice` (with `currency`), `cruiseShip`,
`cruiseFrom`, `cruiseTo`, `cruiseCabin`, `cruiseStart`, `cruiseEnd`; a
`flights` repeat (`flightNumber`, `date`, `depIata` or `depCity`, `arrIata` or
`arrCity`, `depTime`, `arrTime`, `arrDayOffset`, `airline`) and a `stays`
repeat (`name`, `checkIn`, `checkOut`, `address`, `city`, `country`, `board`,
`room`). The app's contract (`services/trip/package/contract.ts`) is the
authority.
