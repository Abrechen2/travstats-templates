# Contributing a template

Thank you for helping TravStats read more booking confirmations. A template is
public the moment it is merged, and it runs on other people's mail, so the
rules below are strict on purpose.

## 1. Test cases are invented

**Never put text from a real confirmation into this repository** — not
anonymised, not shortened. Names, booking references, ticket numbers, e-mail
addresses, phone numbers and street addresses survive "anonymising" far more
often than anyone expects, and git history keeps them forever.

Write the test input yourself, in the *shape* of the real mail: the same
labels, the same order, the same date and time format, with values you made
up (`ABC123`, `Max Mustermann`, `LH 1234`).

## 2. A template must say what it does NOT read

Add at least one test case that must **not** produce a result — a mail from the
same sender that is not a booking (a newsletter, a check-in reminder), or a
booking with the flight number missing. A template that reads too much is worse
than one that reads too little: TravStats would rather show nothing than a
wrong flight.

## 3. Bump the version

Every change to a template bumps its `version` and the matching entry in the
index: the root `index.json` for a v2 file, `templates/index.json` (and its
top-level `version`) for a v1 file. Instances only fetch what changed.

## 4. Changing a v1 airline template (older releases)

New airlines are v2 files in `flight/` (section 5). The v1 format remains for
the TravStats releases that read only `templates/`.

1. Fork this repository.
2. Add `templates/XX.json` (`XX` = the airline's IATA code), following the
   format in [README.md](README.md#template-format-v1-airlines).
3. Add the entry to `templates/index.json` and bump the top-level `version`.
4. Open a pull request. Say which mail the template is for (sender, subject,
   language) — in words, not as an attachment.

Know before you start: the app picks a v1 template through a detection list
compiled into TravStats, not through the template's `from` and `subject`
fields (see [README.md](README.md#which-mail-gets-which-template)). Improving
one of the airlines already listed works through this repository alone. A
template for a new airline also needs a detection rule in the app, so open an
issue there as well. A v2 file needs no such rule — its `match` block is the
detection — so prefer one. [`flight/README.md`](flight/README.md) lists the
airlines that already have v2 files.

## 5. Format v2 (every domain)

One envelope for every domain; the app validates it with
`backend/src/services/parsers/templates/v2/envelope.ts`, so "valid" means the
same here and in the app.

```json
{
  "id": "lodging:examplechain",
  "domain": "lodging",
  "version": "2026.10.9",
  "issuer": { "name": "Example Hotels", "kind": "hotel-chain", "keys": { "senderDomains": ["example.com"] } },
  "markets": ["DE"],
  "match": { "markers": ["example hotels"], "anchors": ["reservierung nr."], "notBookingIf": ["wurde storniert"] },
  "extraction": { "fields": { }, "repeats": { }, "required": ["hotelName", "checkIn", "checkOut"] },
  "testCases": [
    { "name": "a confirmation", "input": { "subject": "…", "text": "…" }, "expect": "match", "expected": { "checkIn": "2026-10-01" } },
    { "name": "a newsletter", "input": "…", "expect": "decline" }
  ]
}
```

- **`match`**: every marker AND at least one anchor must appear (case-insensitive)
  in sender, subject and body. `notBookingIf` regexes mark the issuer's own
  cancellations and receipts — a hit answers "not a booking".
- **`extraction.fields`**: one value per name. A rule has exactly one of
  `patterns` (regexes tried in order; the value is group `v`, else group 1;
  default flags `im`), `value` (a constant) or `stacked` (a label on a line of
  its own; the value is the next line with content, unless it is one of the
  extraction's `labels`). Options: `format` (`"{1}T{2}"`, `"{day}.{month}.{year}T{time}"`
  — assemble a value from several groups), `yearFrom` (a sibling field supplies
  the year of a year-less date), `transform` (one name or a list, applied in
  order).
- **`extraction.repeats`**: an array of items per name, `matchAll` (one item per
  match) or `split` (one item per block). Split options: `prependHeader`,
  `wholeTextUnlessSplit`, `within` (`startAfter`, `endBefore`, `lenient`), and
  `required` — fields every item must carry.
- **Transforms**: `trim`, `text`, `upper`, `lower`, `titleCase`,
  `capsTitleCase`, `digits`, `firstDigits`, `integer`, `money`, `currency`,
  `date`, `englishDate`, `germanDate`, `numericDate`, `slashDayFirstDate`,
  `time`, `dateTime`, `dayOffset`, `flightNumber`, `iata`, `airportName`,
  `dropFirstWord`, `stripTrailingSeparator`, `removeSpaces`. Every transform
  answers null for input it cannot read; it never guesses.
- **Test cases** are the gate: a template is activated only when every case
  passes — at least one `match` (with `expected` values, compared partially)
  and at least one `decline`.
- **`index.json`** at the repository root names every v2 file with its id,
  domain, version and path. Bump the file's `version` and its index entry
  together.

What a domain's values mean is listed in each folder's README
([`flight/`](flight/README.md), [`lodging/`](lodging/README.md)).

To check a template locally, run the app's snapshot sync against your clone,
from a TravStats checkout's `backend/`:

```bash
npx tsx scripts/sync-template-snapshot.ts --from <your clone of this repository>
```

It validates every file the index names and runs its test cases; on any
failure it lists them and writes nothing. On success it refreshes that
checkout's bundled snapshot — discard the change there if you only wanted the
check.
