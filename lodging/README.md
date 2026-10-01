# lodging/

Templates that read hotel and other stay confirmations. **No TravStats release
reads this folder yet** — the app uses its own built-in copy of each. The files
are here so the v2 loader has its first real content, and so the format can be
reviewed before it is frozen. See
[CONTRIBUTING.md](../CONTRIBUTING.md#5-hotels-cruises-trains--format-v2).

| File | Reads |
|---|---|
| `koa.json` | KOA campground reservation confirmations (English) |
| `hilton.json` | Hilton-family hotel confirmations (English) |
| `travelclick.json` | Hotels booking through TravelClick (English) |
| `check24.json` | CHECK24 hotel bookings (German) |
| `accor.json` | ALL Accor bookings for every Accor brand (German) |

## Where they come from

Each file is the `LodgingTemplate` data from
`backend/src/services/lodging/templates/builtins.ts` in
[TravStats](https://github.com/Abrechen2/TravStats), exported unchanged by
[`scripts/export-lodging.ts`](../scripts/export-lodging.ts). The top-level
`$source` field names the app commit each file was generated from. To refresh
them, run the script again from an app checkout; do not edit the files by hand
while the app's copy is the one in use, or the two will drift.

`accor.json` uses the `numericDate` and `titleCase` transforms, which exist only
on the app branch it was exported from (`fix/parser-correctness`), not yet in a
release. The other four use transforms every current release knows.

These templates carry no `testCases` yet — the app tests them against its own
private corpus. Synthetic test cases (at least one positive and one
must-decline each) are required before the v2 loader may activate any of them.

## Not here, on purpose

Booking.com confirmations are read by TypeScript code in the app
(`bookingComTemplate.ts`): address segmentation, two layouts and currency
grammar that a declarative template cannot express. It stays in the app and
will be registered under a template id there (design §5.4); there is nothing to
export.
