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
  in sender, subject and body. Regex conditions take a string (flags `im`) or
  `{ "pattern", "flags", "in" }` (`in`: `from`, `subject` or `text`):
  `allOf` (all must find something), `anyOf` (at least one — counts like an
  anchor), `noneOf` (any hit declines: a ticket where you read reservations)
  and `notBookingIf` (the issuer's own cancellations and receipts — a hit
  answers "not a booking"). Markers may be empty; anchors and `anyOf` may not
  both be. At most 10 regexes per list.
- **`extraction.fields`**: one value per name (at most 60). A rule has exactly
  one of `patterns` (at most 10 regexes tried in order; the value is group
  `v`, else group 1; default flags `im`), `value` (a constant) or `stacked` (a
  label on a line of its own; the value is the next line with content, unless
  it is one of the extraction's `labels`). Options: `format` (`"{1}T{2}"` —
  assemble a value from several groups), `yearFrom` (a sibling field supplies
  the year of a year-less date), `scan` (try every match of a pattern, not only
  the first, until one survives), `in` (read only the `subject`, `from` or
  `text`).
- **Value steps**, on every field, item field, column and computed value, in
  this order: `replace` (`[pattern, replacement, flags?]` on the raw text),
  `transform` (one name or a list), `map` (`[pattern, value]`: the first
  pattern that finds something in the value gives the constant — a string,
  number or boolean; none → null).
- **`extraction.repeats`** (at most 20 per scope): an array of items per name,
  read in order, so a repeat may use the ones above it. Modes:
  - `matchAll` — one item per match of `pattern`. Item fields take exactly one
    of `group`, `format` (`"{dep} {time}"`), `value` or `lastBefore` (the last
    match of another regex before the item: the "Rückfahrt" heading in force),
    and may add `find` (a regex searched in that text: a train number between
    two lines).
  - `split` — one item per block starting at each `splitPattern` match. Options:
    `prependHeader`, `wholeTextUnlessSplit`, `skipPreamble` (the text before
    the first block is no item), nested `repeats` (one level: each block reads
    its own) and `emit` (the repeat's items ARE the named nested repeats'
    items).
  - `columns` — a table extracted column by column: each column's `pattern`
    is matched throughout the scope, item i is the i-th match of every column;
    unequal columns read NOTHING.
  - `pairs` — walks an earlier repeat's items: one matching `open` opens a
    pair (a later one replaces it), the next matching `close` closes it.
  - `lines` — one item printed over consecutive LINES (an itinerary day above
    its port): `rowLines` holds 2–4 patterns, each matched against exactly one
    line (lines over 500 characters are never matched); an item is a run of
    lines matching them in order, blank lines between stepped over with
    `skipBlankLines`. Item fields read the rows' NAMED groups, unique across
    the row. A row that breaks off is no item.
  Every mode: `within` (`startAfter`, `endBefore`, `lenient`), `required`,
  `minimum`, `zip` (`{ "with": "<earlier repeat>", "strict": true }` merges
  the i-th item; `strict` only when both have as many), `compute` (a value
  from `{name}` of the item and `{parent.name}` of the enclosing block or
  document; a blank placeholder makes it null) and `skipItemsWithout`.
- **`extraction.preprocess`**: `stripCarriageReturns`, `stripZeroWidth`,
  `stripLinks`, `collapseSpaces`, `stripLeadingPipe`, `trimLines`,
  `dropBlankLines` — applied before extraction, never before matching.
- **Transforms**: `trim`, `text`, `upper`, `lower`, `titleCase`,
  `capsTitleCase`, `digits`, `firstDigits`, `integer`, `money`, `amount`,
  `currency`, `leadingCurrency`, `leadingAmount` ("CHF 292,83", "US$628,70" —
  a line that is only a currency and an amount; a non-ISO code is no price),
  `date`, `dateOrMonthDay` (a full date, or `--MM-DD` for a day printed
  without a year; the domain consumer dates it or leaves it undated),
  `englishDate`, `germanDate`, `numericDate`, `slashDayFirstDate`,
  `dayMonthNear` ("02.05. 2016-05-02" — a day-month dated by a reference),
  `time`, `dateTime`, `laterClock` ("2026-12-20T22:30 00:05" → next day),
  `dayOffset`, `flightNumber`, `iata`, `airportName`, `travelClass`,
  `addressStreet`, `addressPostcode`, `addressCity`, `addressCountry`,
  `dropFirstWord`, `stripTrailingSeparator`, `removeSpaces`. Every transform
  answers null for input it cannot read; it never guesses.
- **`output`**: options for the domain's consumer (only `lodging` takes one —
  see [`lodging/README.md`](lodging/README.md#output-lodging)).
- **Bounds**: every regex runs under the app's time budget; a template that is
  slow on a document reads nothing from it.
- **Test cases** are the gate: a template is activated only when every case
  passes — at least one `match` (with `expected` values, compared partially)
  and at least one `decline`.
- **`index.json`** at the repository root names every v2 file with its id,
  domain, version and path. Bump the file's `version` and its index entry
  together.

What a domain's values mean is listed in each folder's README
([`flight/`](flight/README.md), [`lodging/`](lodging/README.md),
[`cruise/`](cruise/README.md), [`rail/`](rail/README.md),
[`rental/`](rental/README.md), [`package/`](package/README.md)).

To check the repository locally — exactly what CI runs — point the validator
at a TravStats checkout (its `backend/` with `npm ci` done):

```bash
TRAVSTATS_BACKEND=../TravStats/backend node scripts/validate.mjs
```

It runs the app's `scripts/validate-template-repo.ts` against this clone:
every file the index names must exist, validate, agree with its index line and
pass all of its own test cases, and every `.json` in a domain folder must be in
the index. Nothing is written. To refresh a TravStats checkout's bundled copy
afterwards, run there `npx tsx scripts/sync-template-snapshot.ts --from <this clone>`.
