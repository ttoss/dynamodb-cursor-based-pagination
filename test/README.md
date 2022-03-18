# Requisites

- DynamoDB Local with any credentials ([see this link](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html)) to emulate a local server.
- Jest to make unit testing to work with DynamoDB ([see this link](https://jestjs.io/docs/dynamodb)).



## Usage

After setup, run:

```
yarn test
```

This will create a database named `DynamoDBCursorBasedPagination`, populate with data whose range keys values goes from `cursor-1000` to `cursor-1099` and 23 tests are made to verify consistency.

### Warning

Everytime the test is made, you have to delete manually the file that emulates the server on DynamoDB folder. The reason behind this is that Jest will try to create the database again and this will give an error. In the future, a script will be avaliable to made this step automatically.