# TravStats Templates

Parser templates for [TravStats](https://github.com/Abrechen2/TravStats): the
rules that turn a booking confirmation into a flight, a stay, a cruise or a
train journey without a language model.

This repository was called `travstats-airline-templates` until 2026-10-01.
GitHub redirects the old name, and every existing path stays where it is, so
instances that already sync from here keep receiving updates.

## Structure

```
index.json          registry of every v2 template: { version: 2, templates: [{ id, domain, version, path }] }
flight/             v2: LH-old, LH, 4U, EK, EK-old, AB
lodging/            v2: booking.com, koa, hilton, travelclick, check24, accor, hrs, nh, armani, bookingcom-legacy
cruise/             v2: tui-cruises-confirmation
rail/               v2: db-confirmation, db-online-ticket, db-postal-order, db-connection-info, db-order-facts, db-reservation-ticket, db-reservation-mail
rental/             v2: sixt-confirmation, sixt-invoice
package/            v2: berge-meer-invoice, berge-meer-documents
scripts/validate.mjs  CI check: every indexed file valid, every test case passing (runs the app's engine)
templates/          airline templates, format v1 — what older TravStats releases sync
  index.json        registry of all v1 templates with versions (unchanged by v2)
  LH.json, EW.json, FR.json, LX.json, OS.json, SN.json, U2.json, W6.json, LH-old.json
CONTRIBUTING.md     how to add or change a template
```

Since TravStats plan 2026-10-09 P4a/P4b the app has no issuer reader compiled
in: every airline, hotel chain, portal, cruise line, rail operator, rental
provider and tour operator it reads without a language model is a v2 file
here. Only generic readers stay in the app (boarding-pass barcodes, structured
mail data, calendar files, the language model, the template engine). A TravStats release bundles a copy of these
files; an instance replaces a bundled file with a newer version from this
repository once that version validates and passes its own test cases. Each
folder's README says what is in it and why. New templates are v2 — see
[CONTRIBUTING.md](CONTRIBUTING.md#5-format-v2-every-domain). The v1 format below
stays documented for the releases that still read only `templates/`.

## Template format (v1, airlines)

Each template is a JSON file with this structure:

```json
{
  "airline": "Airline Name",
  "iata": "XX",
  "version": "YYYY-MM",
  "from": ["@airline.com"],
  "subject": ["Booking Confirmation", "Buchungsbestätigung"],
  "selectors": {
    "flightNumber": ".css-selector",
    "pnr": ".css-selector",
    "departureCode": ".css-selector",
    "arrivalCode": ".css-selector",
    "departureTime": ".css-selector",
    "arrivalTime": ".css-selector"
  },
  "textPatterns": {
    "flightNumber": ["Flight(?:\\s*No\\.?)?:\\s*([A-Z]{2}\\s?\\d{1,4})"],
    "pnr": ["Booking\\s*Reference:\\s*([A-Z0-9]{5,8})"],
    "departureCode": ["From:[^(\\n]*\\(([A-Z]{3})\\)"],
    "arrivalCode": ["To:[^(\\n]*\\(([A-Z]{3})\\)"],
    "departureTime": ["Departure:\\s*(\\d{1,2}\\s+\\w+\\s+\\d{4})[\\s\\S]{0,80}?Time:\\s*(\\d{1,2}:\\d{2})"]
  },
  "transforms": {
    "flightNumber": "removeSpaces",
    "pnr": "uppercase",
    "departureCode": "uppercase",
    "arrivalCode": "uppercase",
    "departureTime": "parseIso",
    "arrivalTime": "parseIso"
  },
  "testCases": [
    {
      "input": "Flight: LH 100\nFrom: Munich (MUC)\nTo: London (LHR)",
      "expected": {
        "flightNumber": "LH100",
        "departureCode": "MUC",
        "arrivalCode": "LHR"
      }
    }
  ]
}
```

### Fields

| Field | Description |
|-------|-------------|
| `airline` | Full airline name |
| `iata` | Airline IATA code (unique key) |
| `version` | Version string `YYYY-MM` — bump when changing patterns |
| `from` | Sender domain(s) to match (e.g. `@lufthansa.com`) — documentation only, see below |
| `subject` | Subject line keywords to match — documentation only, see below |
| `selectors` | CSS selectors for HTML emails (cheerio) |
| `textPatterns` | Regex patterns for plain-text emails (fallback) |
| `transforms` | Value transforms: `trim`, `uppercase`, `lowercase`, `removeSpaces`, `stripNonAlpha`, `extractIata`, `extractFlightNumber`, `parseIso` |
| `testCases` | Test cases for validation |

### Which mail gets which template

Current TravStats releases do **not** read `from` and `subject` to pick a
template. They use a detection list compiled into the app
(`backend/src/services/parsers/templates/detector.ts`) that maps sender domains,
subject lines and fingerprints to an IATA key, and then take the template with
that key. Two consequences:

- A changed template for an airline already in that list reaches every
  instance with the next daily sync.
- A template for an airline that list does **not** name is downloaded but
  never used. A new airline needs a detection rule in the app as well — open an
  issue on [TravStats](https://github.com/Abrechen2/TravStats/issues).

### textPatterns

Each key maps to an array of regex strings tried in order. The **first capture group** is used as the value. If two capture groups are present, they are joined as `{group1}T{group2}` (for date+time combinations).

### transforms — parseIso

Converts human-readable dates to ISO 8601:
- `"18 Sep 2025T07:25"` → `"2025-09-18T07:25"`
- `"13. Dezember 2024 16:05"` → `"2024-12-13T16:05"`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: test cases are **invented**,
never copied from a real confirmation, and every change bumps `version`.
