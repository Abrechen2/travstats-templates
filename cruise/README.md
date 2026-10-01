# cruise/

Reserved for v2 templates that read cruises. No TravStats release reads this
folder yet — see [CONTRIBUTING.md](../CONTRIBUTING.md#5-hotels-cruises-trains--format-v2).

There is nothing to export into it today. The cruise confirmations TravStats
reads without a language model — AIDA and TUI Cruises ("Mein Schiff") — are
read by TypeScript code in the app (`cruiseBookingParser.ts` and
`cruise/tuiCruisesTemplate.ts`), not by template data. Per the parser-system
design (§5.4) that code stays in the app and is registered under a template id
there, so a parse result names its reader either way.

A cruise itinerary (one stop per day) needs a repeating block in the template
format; that is planned, and the first declarative cruise template will land
here once the v2 engine supports it.
