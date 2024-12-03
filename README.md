Running the API
---
To begin the application, simply navigate to the root directory and run:

```
docker compose up --build
```

The application does not require any prior configuration.

The API is exposed on port `3000`, and can thus be accessed by sending requests to `localhost:3000/receipts/process` or `localhost:3000/receipts/:id/points`.

Design Decisions
---
While generally the requirements were very explicit, there was one area where I had to make some executive decisions: date formatting. Most fields were provided in `api.yml` with a matching regex to define their expected shape, but `purchaseDate` was provided with only the format `date`.

All examples provided were in the format of `YYYY-MM-DD`, but as noted this is not explicitly stated as being required; for instance, is `YYYY/MM/DD` acceptable? `MM-DD-YYYY`? What about fully written out, like `December 1st, 1997` or `Aug 25 2000` or any of its variations? What about epoch time--is `0` an acceptable date?

Ultimately I decided that fully-written out dates felt out of scope, given the consistency of provided examples and sheer variability of written english dates, and that epoch time, while it could technically be construed as a "date", did not match the common sense meaning of `format: date`. However, in an attempt to cover my bases, the API supports the following forms: `YYYY-MM-DD`, `YYYY-DD-MM`, `MM-DD-YYYY`, and `DD-MM-YYYY`, using any of the following seperators: `-`, `/`, `.`, or ` `.

The application will try to determine which is field is which based on possibility (e.g., in `32-12-31`, the year must be `32`, day must be `31`, and month `12` by process of elimination). If a date is fully ambiguous, like `10/10/10`, it will default to the format of the provided examples, `YYYY-MM-DD`. And finally, impossible dates like `32.32.32`, dates with the year in the middle like `12-2020-25`, and dates with mixed seperators like `12-12/2020` are not accepted.