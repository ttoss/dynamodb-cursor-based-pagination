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

### Examples

#### Case 1 - `first: 3`

- Command:

```sh
yarn run paginate --first=3
```

- Query Parameters

```json
{
  "ExpressionAttributeNames": { "#paginateHashKey": "hashKey" },
  "ExpressionAttributeValues": { ":paginateHashKey": "hashKeyValue" },
  "KeyConditionExpression": "#paginateHashKey = :paginateHashKey",
  "TableName": "DynamoDBCursorBasedPagination",
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
        "index": 34,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-34",
        "parity": "EVEN"
      }
    },
    {
      "cursor": "cursor-33",
      "node": {
        "index": 33,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-33",
        "parity": "ODD"
      }
    },
    {
      "cursor": "cursor-32",
      "node": {
        "index": 32,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-32",
        "parity": "EVEN"
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

```sh
yarn run paginate --first=2 --after=cursor-30
```

- Query Parameters

```json
{
  "ExpressionAttributeNames": {
    "#paginateHashKey": "hashKey",
    "#paginateCursor": "rangeKey"
  },
  "ExpressionAttributeValues": {
    ":paginateHashKey": "hashKeyValue",
    ":paginateCursor": "cursor-30"
  },
  "KeyConditionExpression": "#paginateHashKey = :paginateHashKey AND #paginateCursor < :paginateCursor",
  "TableName": "DynamoDBCursorBasedPagination",
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
        "index": 29,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-29",
        "parity": "ODD"
      }
    },
    {
      "cursor": "cursor-28",
      "node": {
        "index": 28,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-28",
        "parity": "EVEN"
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

```sh
yarn run paginate --last=3 --before=cursor-15
```

- Query Parameters

```json
{
  "ExpressionAttributeNames": {
    "#paginateHashKey": "hashKey",
    "#paginateCursor": "rangeKey"
  },
  "ExpressionAttributeValues": {
    ":paginateHashKey": "hashKeyValue",
    ":paginateCursor": "cursor-15"
  },
  "KeyConditionExpression": "#paginateHashKey = :paginateHashKey AND #paginateCursor > :paginateCursor",
  "TableName": "DynamoDBCursorBasedPagination",
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
        "index": 18,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-18",
        "parity": "EVEN"
      }
    },
    {
      "cursor": "cursor-17",
      "node": {
        "index": 17,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-17",
        "parity": "ODD"
      }
    },
    {
      "cursor": "cursor-16",
      "node": {
        "index": 16,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-16",
        "parity": "EVEN"
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

```sh
yarn run paginate --last=7 --before=5 --beginsWith=cursor-1
```

- Query Parameters

```json
{
  "ExpressionAttributeNames": {
    "#paginateHashKey": "hashKey",
    "#paginateCursor": "rangeKey"
  },
  "ExpressionAttributeValues": {
    ":paginateHashKey": "hashKeyValue",
    ":paginateCursor": "cursor-15"
  },
  "KeyConditionExpression": "#paginateHashKey = :paginateHashKey AND #paginateCursor > :paginateCursor",
  "TableName": "DynamoDBCursorBasedPagination",
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
        "index": 19,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-19",
        "parity": "ODD"
      }
    },
    {
      "cursor": "8",
      "node": {
        "index": 18,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-18",
        "parity": "EVEN"
      }
    },
    {
      "cursor": "7",
      "node": {
        "index": 17,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-17",
        "parity": "ODD"
      }
    },
    {
      "cursor": "6",
      "node": {
        "index": 16,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-16",
        "parity": "EVEN"
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

#### Case 5 - `first: 2`, `after: cursor-30` and `sort: ASC`

- Command

```sh
yarn run paginate --first=2 --after=cursor-30 --sort=ASC
```

- Query Parameters

```json
{
  "ExpressionAttributeNames": {
    "#paginateHashKey": "hashKey",
    "#paginateCursor": "rangeKey"
  },
  "ExpressionAttributeValues": {
    ":paginateHashKey": "hashKeyValue",
    ":paginateCursor": "cursor-30"
  },
  "KeyConditionExpression": "#paginateHashKey = :paginateHashKey AND #paginateCursor > :paginateCursor",
  "TableName": "DynamoDBCursorBasedPagination",
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
        "index": 31,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-31",
        "parity": "ODD"
      }
    },
    {
      "cursor": "cursor-32",
      "node": {
        "index": 32,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-32",
        "parity": "EVEN"
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

#### Case 6 - Filter

- Command

```sh
yarn run paginate --filterExpression='#parity = :parity' --filterAttributeNames.'#parity'=parity --filterAttributeValues.':parity'=EVEN --first=6
```

- Query Parameters

```json
{
  "ExpressionAttributeNames": {
    "#parity": "parity",
    "#paginateHashKey": "hashKey"
  },
  "ExpressionAttributeValues": {
    ":parity": "EVEN",
    ":paginateHashKey": "hashKeyValue"
  },
  "KeyConditionExpression": "#paginateHashKey = :paginateHashKey",
  "TableName": "DynamoDBCursorBasedPagination",
  "ScanIndexForward": false,
  "Limit": 6,
  "FilterExpression": "#parity = :parity"
}
```

- Response

```json
{
  "edges": [
    {
      "cursor": "cursor-34",
      "node": {
        "index": 34,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-34",
        "parity": "EVEN"
      }
    },
    {
      "cursor": "cursor-32",
      "node": {
        "index": 32,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-32",
        "parity": "EVEN"
      }
    },
    {
      "cursor": "cursor-30",
      "node": {
        "index": 30,
        "hashKey": "hashKeyValue",
        "rangeKey": "cursor-30",
        "parity": "EVEN"
      }
    }
  ],
  "pageInfo": {
    "hasPreviousPage": false,
    "hasNextPage": true,
    "startCursor": "cursor-34",
    "endCursor": "cursor-30"
  },
  "count": 3,
  "scannedCount": 6,
  "lastEvaluatedKey": "cursor-29"
}
```
