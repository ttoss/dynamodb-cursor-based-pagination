# How to Generate DynamoDB Response?

1. Create a file `./dynamodbResponse.json` and initializes it with `[]`.
1. Copy this code inside `src/index.ts > queryDynamoDB`.

```ts
(() => {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.resolve(process.cwd(), 'test', 'dynamodbResponse.json');
  const data = JSON.parse(fs.readFileSync(filePath).toString());
  const newData = [
    ...data,
    {
      matcher: {
        cursor: expressionAttributeValues[':cursor'],
        limit,
        scanIndexForward,
        keyConditionExpression,
      },
      response,
    },
  ];
  const newDataString = JSON.stringify(newData, null, 2);
  fs.writeFileSync(filePath, newDataString);
})();
```

3. Remove DynamoDB mocking from `./index.test.ts`.
1. Run `yarn test`.
1. Replace `hashKeyName`, `hashKeyValue` and `rangeKeyName` of the file `./dynamodbResponse.json`.
1. Copy data inside `test/index.test.ts` > `mockDynamoDBQuery`.
1. Remove the script and add mock again.
