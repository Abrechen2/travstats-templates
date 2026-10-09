# lodging/

v2 templates that read hotel, campground and portal confirmations. Every file is
listed in the root [`index.json`](../index.json); the order there is the order
the app tries them.

| File | Reads | Markets |
|---|---|---|
| `bookingcom.json` (`lodging:booking.com`) | Booking.com confirmations of today, both layouts (inline and stacked labels), changed bookings included (German) | DE |
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

## Booking.com

`bookingcom.json` is first in the index, so it keeps the priority the compiled
reader had (P4b moved it here): the older one-line layout and the declarative
readers take only what it declines. Its id `lodging:booking.com` keeps the
`parserTemplate` value "booking.com". It shows the constructs P4a still lacked:
one pattern per label covers both layouts, the address line is split by the
`address*` transforms, the total uses `leadingAmount` / `leadingCurrency` with
`scan`, and its `output` block keeps the reader's confidence (95 / 80) and
reports a missing room. Nothing Booking.com-specific is left in the app.

## `output` (lodging)

- `report`: the fields whose absence `missing` names, in order (default `city`,
  `totalPrice`, `confirmationNumber`).
- `confidence`: `{ "complete": 0–100, "partial": 0–100 }` (default 75 / 65).

A lodging template may also set `nights` (the printed night count; it wins
over the date span).
