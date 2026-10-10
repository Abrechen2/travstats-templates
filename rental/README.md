# rental/

v2 templates that read rental-car documents. Every file is listed in the root
[`index.json`](../index.json).

| File | `kind` | Reads | Markets |
|---|---|---|---|
| `sixt-confirmation.json` | confirmation | Sixt booking confirmations, both layouts (2024–2025 "Abholung: X" then the date; 2026 the date then "Abholung in X") | DE |
| `sixt-invoice.json` | invoice | Sixt's final invoice PDF (`RENTAL_INV`), labels in the station's language | DE, FR, NL, BE |

## Where they come from

Until TravStats plan 2026-10-09 P4b these readers were TypeScript code in the
app; the app's test suite compares each with its file on every fixture. What
stays in the app is provider-agnostic: airport-parking and "on request"
refusals and the cancellation reader.

## Values a rental template may set

`kind` (constant: `confirmation` or `invoice`) and `provider` (constant), then:

- confirmation: `confirmationNumber`, `pickupStation`, `pickupLocal`,
  `returnStation`, `returnLocal` (`YYYY-MM-DDTHH:MM`, the station's clock — all
  five required), `vehicleClass`, `vehicleExample`, `acrissCode`,
  `paymentTiming` (`prepaid` / `pay_at_counter`), `price`, `currency`,
  `mileagePolicy` (`unlimited` / `capped`), `placeCountry` (ISO alpha-2), an
  `inclusions` repeat (`code`: comma-separated codes the app knows, e.g.
  `roadside`, `cdw,tp`) and an `airportWords` repeat (`word`).
- invoice: `confirmationNumber`, `agreementNumber`, `invoiceNumber`,
  `actualPickupLocal`, `actualReturnLocal`, `finalAmount`, `finalCurrency`,
  a `vehicles` repeat (`odometerOut`, `odometerIn`, `driven`, `model`) and a
  `fees` repeat (`label`, `amount` — the single extra charges the invoice lists,
  in the invoice's currency; the app shows each for review and never adds them
  to the final amount, which already contains them). The app
  keeps a vehicle row only when km in − km out = driven, sums the driven km,
  and gives an odometer pair only for a single car.

The app hands an invoice template the mail with its PDF texts, a confirmation
template the mail alone.
