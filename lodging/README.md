# lodging/

v2 templates that read hotel, campground and portal confirmations. Every file is
listed in the root [`index.json`](../index.json); the order there is the order
the app tries them.

| File | Reads | Markets |
|---|---|---|
| `koa.json` | KOA campground reservation confirmations (English) | US, CA |
| `hilton.json` | Hilton-family hotel confirmations (English; the year comes from the subject) | global |
| `travelclick.json` | Hotels booking through the TravelClick engine (English) | global |
| `check24.json` | CHECK24 hotel bookings (German, stacked labels) | DE |
| `accor.json` | ALL Accor bookings for every Accor brand (German layout) | global |
| `hrs.json` | HRS portal confirmations 2009–2016 (German) | DE |
| `nh.json` | NH Hotels' own confirmations 2014–2016 (German, day-first slash dates) | DE |
| `armani.json` | Armani Hotels' own confirmations (English) | global |
| `bookingcom-legacy.json` | Booking.com's one-line layout, 2008–2018 (German) | DE |

`markets` orders templates, it never filters them: a template for the German
layout of a global chain still reads that layout anywhere.

## Where they come from

Until TravStats plan 2026-10-09 P4a these nine readers were compiled into the
app. They were converted to the v2 envelope rule for rule, and the app's test
suite proves, on every test input of every file, that the file reads exactly
what the compiled reader read. From the release that ships P4a, the app reads
these senders **only** through these files: a copy bundled with the release,
replaced by a newer version from this repository once it validates and passes
its own test cases. Change a reader here, not in the app.

Every file carries invented test cases: at least one confirmation it must read
(with the values it must extract) and at least one mail it must decline (a
newsletter, a reply, a cancellation, a mail without stay dates).

## Values a lodging template may set

`hotelName`, `checkIn`, `checkOut` (`YYYY-MM-DD`), `roomCategory`, `address`,
`city`, `postcode`, `country`, `totalPrice`, `pricePerNight` (numbers),
`currency` (ISO code), `guests` (integer), `confirmationNumber`, and the
constants `type` (`hotel`, `campsite`, `guesthouse`, `apartment`, `hostel`) and
`chainName`. A value of the wrong type makes the app decline the template's
reading rather than guess; any other name (a helper such as `subjectYear`) is
ignored by the app.

## Not here, on purpose

Booking.com's current (stacked) confirmations are read by TypeScript code in the
app (`bookingComTemplate.ts`): address segmentation, two layouts and currency
grammar that a declarative template cannot express. It stays in the app as a
generic reader.
