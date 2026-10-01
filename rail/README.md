# rail/

Templates that read train journeys. **No TravStats release reads this folder,
and nothing in it is final.**

| File | Status | Reads |
|---|---|---|
| `db.json` | **DRAFT** | Deutsche Bahn booking confirmations of the 2020s layout ("… wie folgt gebucht:", then `von <station>, dd.mm.yyyy hh:mm Uhr` / `nach <station>, …` per ride) |

`db.json` is the first template written in the v2 envelope (TravStats
parser-system design, §5.1): `id`, `domain`, `version`, `issuer`, `match`,
`extraction`, `testCases`. Its purpose is to give that envelope a rail
`extraction` block to argue about before the schema is frozen. Its two test
cases are invented: one booking with two rides that must be read leg by leg,
and one delay notice that names an order and a ride but books nothing, which
must be declined.

The draft does not add coverage. TravStats already reads this layout with
TypeScript code (`backend/src/services/rail/parser/dbConfirmation.ts`), and
that reader returns exactly the values the positive test case expects (checked
2026-10-01). The template is a pilot of the format, not a replacement.

## What the app lacks to read `db.json`

Rail as a domain already exists in the app: it is registered
(`shared/domains.ts`), `parseDocument` routes rail documents to
`parseRailBookingText`, and PDF and calendar attachments reach the rail
readers. What is missing is everything between a template file and that reader
chain:

1. **The envelope type.** No `TemplateEnvelope` or `DomainExtractionSpec` type
   exists yet; the rail member of that union (`RailExtractionSpec`: booking-level
   field rules plus a repeating `legs` block) has to be defined.
2. **A declarative rail engine.** Nothing evaluates a template against rail
   text. It needs: field rules like the lodging engine's (`patterns`, `flags`,
   `transform`); a repeating block (`repeat` regex with named groups, one leg per
   match, `minimum`); fields built from one group or several (`groups`).
3. **Transforms the draft names that no engine has:** `numericDateTime`
   ("14.03.2030" + "08:05" → `2030-03-14T08:05`), `railClass` ("1"/"2" →
   `first`/`second`), `stationName` (the cleanup `cleanStationName` does today).
   `money`, `currency` and `text` exist in the lodging engine and need sharing.
   An arrival printed with a clock earlier than its departure and no date would
   also need the next-day rule `arrivalAfter` applies today.
4. **A loader for v2 files.** The app's registry
   (`services/parsers/templates/registry.ts`) fetches only `templates/index.json`
   and v1 airline files from a hard-coded URL. It needs the v2 index, a rail
   (and lodging, cruise) entry type, caching by template id, and the version
   comparison of the `YYYY.MM.DD` format.
5. **Activation behind the template's own tests** (design principle 3): the
   shared validator that runs `testCases` — including `expectDecline` — before a
   template is used, and keeps the previous version when they fail.
6. **A hook in the rail reader chain.** `readRailTemplates`
   (`services/rail/parser/railBookingParser.ts`) calls the built-in readers
   directly. It needs to consult registry rail templates, with a defined order
   against the built-in readers, and `RailParseSource` needs a value that names
   the template id, so a wrong reading can be traced to its template.
7. **Measurement.** The corpus tool (`backend/scripts/parser-corpus.ts`) has no
   `rail` domain yet, so a rail template cannot be measured against the private
   corpus the way flight, lodging and cruise templates are.
