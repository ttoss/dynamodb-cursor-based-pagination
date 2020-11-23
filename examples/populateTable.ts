import { DynamoDB } from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const {
  HASH_KEY_NAME,
  HASH_KEY_VALUE,
  RANGE_KEY_NAME,
  TABLE_NAME,
  REGION,
} = process.env;

const documentClient = new DynamoDB.DocumentClient({ region: REGION });

const items = [...new Array(25)].map((_, index) => {
  /**
   * +10 to create id with same string length.
   */
  const id = `cursor-${index + 10}`;
  return {
    id,
    [HASH_KEY_NAME]: HASH_KEY_VALUE,
    [RANGE_KEY_NAME]: id,
  };
});

(async () => {
  await documentClient
    .batchWrite({
      RequestItems: {
        [TABLE_NAME]: items.map(item => ({ PutRequest: { Item: item } })),
      },
    })
    .promise();
})();
