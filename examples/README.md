# Examples

## Install Dependencies

```
yarn
```

## Populate DBB Table

```
yarn run populate-table
```

See `test/README.md` for more details.

## Use Cases

Check the tests case to see more examples.

### Descending Sorting

#### Case 1 - `first: 3`

- Command:

```
 yarn run paginate --first=3
```

- Query Parameters

```json
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

```json
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

```json
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

```json
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

```json
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

```json
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

#### Case 4 - `last: 4`, `before: 5` AND `beginsWith: cursor-1`

- Command

```
yarn run paginate --last=7 --before=5 --beginsWith=cursor-1
```

- Query Parameters

```json
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
  "Limit": 7
}
```

- Response

```json
{
  "edges": [
    {
      "cursor": "9",
      "node": {
        "id": "cursor-19",
        [RANGE_KEY_NAME]: "cursor-19",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    },
    {
      "cursor": "8",
      "node": {
        "id": "cursor-18",
        [RANGE_KEY_NAME]: "cursor-18",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    },
    {
      "cursor": "7",
      "node": {
        "id": "cursor-17",
        [RANGE_KEY_NAME]: "cursor-17",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    },
    {
      "cursor": "6",
      "node": {
        "id": "cursor-16",
        [RANGE_KEY_NAME]: "cursor-16",
        [HASH_KEY_NAME]: HASH_KEY_VALUE
      }
    }
  ],
  "pageInfo": {
    "hasPreviousPage": false,
    "hasNextPage": true,
    "startCursor": "9",
    "endCursor": "6"
  },
  "count": 7,
  "scannedCount": 7,
  "lastEvaluatedKey": "cursor-22"
}
```

### Ascending Sorting

#### Case 1 - `first: 3` and `sort: ASC`

- Command

```
yarn run paginate --first=3 --sort=ASC
```

- Query Parameters

```json
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

```json
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

```json
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

```json
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
yarn run paginate --last=3 --before=cursor-15 --sort=ASC
```

- Query Parameters

```json
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

```json
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
