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

Every change to a template bumps its `version`, and the matching entry and the
top-level `version` in `templates/index.json`. Instances only fetch what
changed.

## 4. Adding an airline (format v1, today)

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
issue there as well. [`flight/README.md`](flight/README.md) lists layouts that
v1 cannot read at all (two-digit years, city names instead of airport codes).

## 5. Hotels, cruises, trains — format v2

The `flight/`, `lodging/`, `cruise/` and `rail/` folders are for the v2 format,
one envelope for every domain with its test cases built in. No TravStats release
reads them yet. What is there now is a preview: `lodging/` holds the app's
built-in hotel templates, exported by `scripts/export-lodging.ts` (refresh them
with the script, never by hand), and `rail/db.json` is a draft of the envelope
itself. Until one does, please open an issue on
[TravStats](https://github.com/Abrechen2/TravStats/issues) describing the
confirmation you would like read, rather than a pull request here.

When v2 lands, this file will gain the schema, an example per domain, a
command to validate a template locally, and a section on writing a template
with an AI assistant. Pull requests will then be checked automatically before
anyone reviews them.
