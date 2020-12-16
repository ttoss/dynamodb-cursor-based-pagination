import { DynamoDB } from 'aws-sdk';
import dotenv from 'dotenv';

import { NUMBER_OF_ITEMS } from './config';

dotenv.config();

const {
  HASH_KEY_NAME,
  HASH_KEY_VALUE,
  RANGE_KEY_NAME,
  TABLE_NAME,
  REGION,
} = process.env;

const documentClient = new DynamoDB.DocumentClient({ region: REGION });

const items = [...new Array(NUMBER_OF_ITEMS)].map((_, index) => {
  /**
   * +10 to create id with same string length.
   */
  const newIndex = index + 10;
  const rangeKeyValue = `cursor-${newIndex}`;
  return {
    [HASH_KEY_NAME]: HASH_KEY_VALUE,
    [RANGE_KEY_NAME]: rangeKeyValue,
    index: newIndex,
    parity: newIndex & 1 ? 'ODD' : 'EVEN',
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
