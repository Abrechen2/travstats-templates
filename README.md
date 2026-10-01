# TravStats Templates

Parser templates for [TravStats](https://github.com/Abrechen2/TravStats): the
rules that turn a booking confirmation into a flight, a stay, a cruise or a
train journey without a language model.

This repository was called `travstats-airline-templates` until 2026-10-01.
GitHub redirects the old name, and every existing path stays where it is, so
instances that already sync from here keep receiving updates.

## Structure

```
templates/          airline templates, format v1 — what TravStats instances sync today
  index.json        registry of all v1 templates with versions
  LH.json, EW.json, FR.json, LX.json, OS.json, SN.json, U2.json, W6.json, LH-old.json
flight/             reserved for the v2 template format (one envelope for every domain)
lodging/            reserved for v2
cruise/             reserved for v2
rail/               reserved for v2
CONTRIBUTING.md     how to add or change a template
```

The four domain folders hold only a README for now. No TravStats release reads them
yet; they fill once the app ships the v2 loader, which validates every
template against its own test cases before it is used. Until then, airline
templates go into `templates/` in the v1 format below.

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
| `from` | Sender domain(s) to match (e.g. `@lufthansa.com`) |
| `subject` | Subject line keywords to match |
| `selectors` | CSS selectors for HTML emails (cheerio) |
| `textPatterns` | Regex patterns for plain-text emails (fallback) |
| `transforms` | Value transforms: `trim`, `uppercase`, `lowercase`, `removeSpaces`, `stripNonAlpha`, `extractIata`, `extractFlightNumber`, `parseIso` |
| `testCases` | Test cases for validation |

### textPatterns

Each key maps to an array of regex strings tried in order. The **first capture group** is used as the value. If two capture groups are present, they are joined as `{group1}T{group2}` (for date+time combinations).

### transforms — parseIso

Converts human-readable dates to ISO 8601:
- `"18 Sep 2025T07:25"` → `"2025-09-18T07:25"`
- `"13. Dezember 2024 16:05"` → `"2024-12-13T16:05"`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: test cases are **invented**,
never copied from a real confirmation, and every change bumps `version`.
