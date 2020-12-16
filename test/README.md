# Tests

Tests are made with a real table.

## Populate DBB Table

A script was created to populate DBB table with some data to be queried in our examples. To create this package, a table with a single key, named `id`, with a composite GSI was created. The values of the region, table name, hash and range key of the GSI must be placed in a `.env` file.

```sh
HASH_KEY_NAME=... // name of the GSI hash key
HASH_KEY_VALUE=... // hash key value to be queried
RANGE_KEY_NAME=.. // name of the range key
TABLE_NAME=... // DBB table name
REGION=... // DBB region
INDEX_NAME=... // name of the GSI
```

With these `.env` values and valid AWS credentials in your environment, execute:

```
yarn run populate-table
```

to execute the script `populateTable.ts` to create items whose range key values goes from `cursor-10` to `cursor-34` .
