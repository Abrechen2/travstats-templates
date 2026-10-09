# flight/

v2 templates that read airline confirmations. Every file is listed in the root
[`index.json`](../index.json); the order there is the order the app tries them.

| File | Reads |
|---|---|
| `LH-old.json` | Lufthansa "Buchungsdetails" mails (one block per leg, "Uhr +1" arrivals) |
| `LH.json` | Lufthansa confirmations, including the 2025 "Buchungsübersicht" layout |
| `4U.json` | Germanwings confirmations 2007–2015 (city names → airport codes) |
| `EK.json` | Emirates confirmations, 2018+ layout (two-digit years) |
| `EK-old.json` | Emirates confirmations, 2014/2015 layout |
| `AB.json` | Air Berlin PDF invoices (the year of a leg borrowed from the header) |

The id's slug (`flight:LH-old`) is what the app records as `parserTemplate` —
the same key the v1 template of that name had.

## How a flight template is shaped

One `legs` repeat in `split` mode, one item per flight leg:

- `prependHeader: true` — the text before the first leg (booking code, ticket
  number, the year a leg line leaves out) is readable from every leg;
- `wholeTextUnlessSplit: true` — a one-leg mail without the separator is read
  whole;
- `required: ["flightNumber"]` inside the repeat — one leg without its number
  and the template declines the whole mail, rather than answer one leg of two;
- `match.notBookingIf` — the airline's own cancellations and receipts; a hit
  answers "not a booking" and the app reads nothing from the mail.

Leg value names: `flightNumber`, `pnr`, `departureTime`, `arrivalTime`
(`YYYY-MM-DDTHH:MM`, usually `format: "{1}T{2}"` plus the `dateTime`
transform), `departureCode`, `arrivalCode`, `seat`, `seatClass`, `price`,
`currency`, `taxes`, `fees`, `baggage`, `frequentFlyer`, `ticketNumber`,
`bookingClassLetter`, `terminal`, `gate`, and `arrivalDayOffset` (the "+1"
after a red-eye's arrival, `dayOffset` transform). A value the app cannot use —
a departure that is not a local date-time — makes it decline the reading.

## Relation to `templates/` (v1)

The six files here replace the app's compiled-in copies of LH and LH-old and of
four airlines that were never in this repository (4U, EK, EK-old, AB). From the
app release that ships plan 2026-10-09 P4a, a v1 template whose name a v2 file
carries is never consulted. `templates/` stays untouched for older releases. Its
HTML-selector templates (EW, FR, LX, OS, SN, U2, W6) carry no test cases and
have no v2 file yet: one needs invented test cases that prove it reads a real
layout, which nobody could write for selectors guessed without a sample mail.

## Still out of reach

| Confirmation | What is missing |
|---|---|
| Amadeus "Electronic Ticket Receipt" (Egyptair and many other carriers) | Dates without a year ("12Jun(Sat)") that must borrow the issue date's year, and airport names outside the app's lookup table. |
| Tour-operator invoices with a flight table (several carriers per document) | The `package` domain (later packages of plan 2026-10-09). |
