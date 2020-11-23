# How to Generate DynamoDB Response?

1. Create a file `./dynamodbResponse.json` and initializes it with `[]`.
2. Copy this code inside `src/index.ts > queryDynamoDB`.

```tx
(() => {
    const filePath = path.resolve(
      process.cwd(),
      'test',
      'dynamodbResponse.json'
    );
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

3. Replace `hashKeyName`, `hashKeyValue` and `rangeKeyName`.
4. Copy data inside `test/index.test.ts` > `mockDynamoDBQuery`.
