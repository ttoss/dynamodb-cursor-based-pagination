# Examples

## Install Dependencies

```
yarn
```

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

to execute the script `populateTable.ts` to create items whose range key values goes from `cursor-34` to `cursor-10` .

## Use Cases

### Descendent Sorting

#### Case 1 - `first: 3`

- Command:

```
 yarn run paginate --first=3
```

- Query Parameters

```
{
  "ExpressionAttributeNames": {
    "#hashKey": HASH_KEY_NAME
  },
  "ExpressionAttributeValues": {
    ":hashKey": HASH_KEY_VALUE
  },
  "KeyConditionExpression": "#hashKey = :hashKey",
  "IndexName": INDEX_NAME,
  "TableName": TABLE_NAME,
  "ScanIndexForward": false,
  "Limit": 3
}
```

- Response

```
{
  "edges": [
    {
      "cursor": "cursor-34",
      "node": {
        "id": "cursor-34",
        [RANGE_KEY_NAME]: "cursor-34",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    },
    {
      "cursor": "cursor-33",
      "node": {
        "id": "cursor-33",
        [RANGE_KEY_NAME]: "cursor-33",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    },
    {
      "cursor": "cursor-32",
      "node": {
        "id": "cursor-32",
        [RANGE_KEY_NAME]: "cursor-32",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    }
  ],
  "pageInfo": {
    "hasPreviousPage": false,
    "hasNextPage": true,
    "startCursor": "cursor-34",
    "endCursor": "cursor-32"
  },
  "count": 3,
  "scannedCount": 3,
  "lastEvaluatedKey": "cursor-32"
}
```

#### Case 2 - `first: 2` and `after: cursor-30`

- Command:

```
 yarn run paginate --first=2 --after=cursor-30
```

- Query Parameters

```
{
  "ExpressionAttributeNames": {
    "#hashKey": HASH_KEY_NAME,
    "#cursor": RANGE_KEY_NAME
  },
  "ExpressionAttributeValues": {
    ":hashKey": HASH_KEY_VALUE,
    ":cursor": "cursor-30"
  },
  "KeyConditionExpression": "#hashKey = :hashKey AND #cursor < :cursor",
  "IndexName": INDEX_NAME,
  "TableName": TABLE_NAME,
  "ScanIndexForward": false,
  "Limit": 2
}
```

- Response

```
{
  "edges": [
    {
      "cursor": "cursor-29",
      "node": {
        "id": "cursor-29",
        [RANGE_KEY_NAME]: "cursor-29",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    },
    {
      "cursor": "cursor-28",
      "node": {
        "id": "cursor-28",
        [RANGE_KEY_NAME]: "cursor-28",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    }
  ],
  "pageInfo": {
    "hasPreviousPage": true,
    "hasNextPage": true,
    "startCursor": "cursor-29",
    "endCursor": "cursor-28"
  },
  "count": 2,
  "scannedCount": 2,
  "lastEvaluatedKey": "cursor-28"
}
```

#### Case 3 - `last: 3` and `before: cursor-15`

- Command

```
yarn run paginate --last=3 --before=cursor-15
```

- Query Parameters

```
{
  "ExpressionAttributeNames": {
    "#hashKey": HASH_KEY_NAME,
    "#cursor": RANGE_KEY_NAME
  },
  "ExpressionAttributeValues": {
    ":hashKey": HASH_KEY_VALUE,
    ":cursor": "cursor-15"
  },
  "KeyConditionExpression": "#hashKey = :hashKey AND #cursor > :cursor",
  "IndexName": INDEX_NAME,
  "TableName": TABLE_NAME,
  "ScanIndexForward": true,
  "Limit": 3
}
```

- Response

```
{
  "edges": [
    {
      "cursor": "cursor-18",
      "node": {
        "id": "cursor-18",
        [RANGE_KEY_NAME]: "cursor-18",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    },
    {
      "cursor": "cursor-17",
      "node": {
        "id": "cursor-17",
        [RANGE_KEY_NAME]: "cursor-17",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    },
    {
      "cursor": "cursor-16",
      "node": {
        "id": "cursor-16",
        [RANGE_KEY_NAME]: "cursor-16",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    }
  ],
  "pageInfo": {
    "hasPreviousPage": true,
    "hasNextPage": true,
    "startCursor": "cursor-18",
    "endCursor": "cursor-16"
  },
  "count": 3,
  "scannedCount": 3,
  "lastEvaluatedKey": "cursor-18"
}
```

### Ascendent Sorting

#### Case 1 - `first: 3` and `sort: ASC`

- Command

```
yarn run paginate --first=3 --sort=ASC
```

- Query Parameters

```
{
  "ExpressionAttributeNames": {
    "#hashKey": HASH_KEY_NAME
  },
  "ExpressionAttributeValues": {
    ":hashKey": HASH_KEY_VALUE
  },
  "KeyConditionExpression": "#hashKey = :hashKey",
  "IndexName": INDEX_NAME,
  "TableName": TABLE_NAME,
  "ScanIndexForward": true,
  "Limit": 3
}
```

- Response

```
{
  "edges": [
    {
      "cursor": "cursor-10",
      "node": {
        "id": "cursor-10",
        [RANGE_KEY_NAME]: "cursor-10",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    },
    {
      "cursor": "cursor-11",
      "node": {
        "id": "cursor-11",
        [RANGE_KEY_NAME]: "cursor-11",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    },
    {
      "cursor": "cursor-12",
      "node": {
        "id": "cursor-12",
        [RANGE_KEY_NAME]: "cursor-12",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    }
  ],
  "pageInfo": {
    "hasPreviousPage": false,
    "hasNextPage": true,
    "startCursor": "cursor-10",
    "endCursor": "cursor-12"
  },
  "count": 3,
  "scannedCount": 3,
  "lastEvaluatedKey": "cursor-12"
}
```

#### Case 2 - `first: 2`, `after: cursor-30` and `sort: ASC`

- Command

```
yarn run paginate --first=2 --after=cursor-30 --sort=ASC
```

- Query Parameters

```
{
  "ExpressionAttributeNames": {
    "#hashKey": HASH_KEY_NAME,
    "#cursor": RANGE_KEY_NAME
  },
  "ExpressionAttributeValues": {
    ":hashKey": HASH_KEY_VALUE,
    ":cursor": "cursor-30"
  },
  "KeyConditionExpression": "#hashKey = :hashKey AND #cursor > :cursor",
  "IndexName": INDEX_NAME,
  "TableName": TABLE_NAME,
  "ScanIndexForward": true,
  "Limit": 2
}
```

- Response

```
{
  "edges": [
    {
      "cursor": "cursor-31",
      "node": {
        "id": "cursor-31",
        [RANGE_KEY_NAME]: "cursor-31",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    },
    {
      "cursor": "cursor-32",
      "node": {
        "id": "cursor-32",
        [RANGE_KEY_NAME]: "cursor-32",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    }
  ],
  "pageInfo": {
    "hasPreviousPage": true,
    "hasNextPage": true,
    "startCursor": "cursor-31",
    "endCursor": "cursor-32"
  },
  "count": 2,
  "scannedCount": 2,
  "lastEvaluatedKey": "cursor-32"
}
```

#### Case 3 - `last: 3`, `before: cursor-15` and `sort: ASC`

- Command

```
yarn run paginate --last=3 --before=cursor-15
```

- Query Parameters

```
{
  "ExpressionAttributeNames": {
    "#hashKey": HASH_KEY_NAME,
    "#cursor": RANGE_KEY_NAME
  },
  "ExpressionAttributeValues": {
    ":hashKey": HASH_KEY_VALUE,
    ":cursor": "cursor-15"
  },
  "KeyConditionExpression": "#hashKey = :hashKey AND #cursor < :cursor",
  "IndexName": INDEX_NAME,
  "TableName": TABLE_NAME,
  "ScanIndexForward": false,
  "Limit": 3
}
```

- Response

```
{
  "edges": [
    {
      "cursor": "cursor-12",
      "node": {
        "id": "cursor-12",
        [RANGE_KEY_NAME]: "cursor-12",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    },
    {
      "cursor": "cursor-13",
      "node": {
        "id": "cursor-13",
        [RANGE_KEY_NAME]: "cursor-13",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    },
    {
      "cursor": "cursor-14",
      "node": {
        "id": "cursor-14",
        [RANGE_KEY_NAME]: "cursor-14",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    }
  ],
  "pageInfo": {
    "hasPreviousPage": true,
    "hasNextPage": true,
    "startCursor": "cursor-12",
    "endCursor": "cursor-14"
  },
  "count": 3,
  "scannedCount": 3,
  "lastEvaluatedKey": "cursor-12"
}
```
