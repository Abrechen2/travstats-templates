# flight/

Reserved for v2 templates that read flights. No TravStats release reads this
folder yet — see [CONTRIBUTING.md](../CONTRIBUTING.md#5-hotels-cruises-trains--format-v2).

**The airline templates live in [`templates/`](../templates/) in the v1 format**,
and stay there until the app ships the v2 loader. Every installed instance syncs
`templates/index.json` and the files it lists; nothing here is copied from them,
so there is exactly one live copy of each airline.

## Airlines that v1 cannot read

Measured on 2026-10-01 against real confirmations (kept private; nothing from
them is in this repository). Each needs something the v1 format or the app's v1
engine does not have, so no v1 template was published for it:

| Confirmation | What v1 lacks |
|---|---|
| Emirates booking confirmation (German, `emirates.email`) | Its dates carry a two-digit year ("05. Nov. 27"). The v1 `parseIso` transform only understands four-digit years, so the date would reach TravStats unconverted. Today the app's generic reader gets that date right (but not the route or the time), so a template would make the date worse. |
| Amadeus "Electronic Ticket Receipt" (Egyptair and many other carriers, `eticket@amadeus.com`) | Airports are printed as city names only ("PARIS CHARLES DE GAULLE"), and dates without a year ("12Jun(Sat)"). v1 has no airport-name lookup and no way to borrow the year from the issue date. |
| Tour-operator invoices with a flight table (several airlines per document, PDF) | Two-digit years ("08.07.27"), one table mixing several carriers, and the table sits in a PDF attachment that the flight parser does not receive today. |

There is a second reason a v1 file for a **new** airline would not help yet:
the app decides which template a mail gets from a detection list compiled into
the app (`backend/src/services/parsers/templates/detector.ts`), not from a
template's `from` and `subject` fields. A template for an airline that list does
not name is downloaded but never used. v1 updates therefore only reach the
airlines already in that list.

All three cases are planned for the v2 format and engine (TravStats parser-system
design, packages 2 and 3).
