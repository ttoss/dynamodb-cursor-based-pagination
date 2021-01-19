import dotenv from 'dotenv';
import yargs from 'yargs';

import { paginate } from '../src';

dotenv.config();

const {
  HASH_KEY_NAME,
  HASH_KEY_VALUE,
  RANGE_KEY_NAME,
  TABLE_NAME,
  REGION,
  INDEX_NAME,
} = process.env;

paginate({
  ...yargs.argv,
  region: REGION,
  tableName: TABLE_NAME,
  hashKeyName: HASH_KEY_NAME,
  hashKeyValue: HASH_KEY_VALUE,
  rangeKeyName: RANGE_KEY_NAME,
  indexName: INDEX_NAME,
})
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
