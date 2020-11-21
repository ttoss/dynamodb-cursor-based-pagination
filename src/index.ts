import { DynamoDB, Credentials } from 'aws-sdk';

type Sort = 'ASC' | 'DESC';

export const queryDynamoDB = async <T>({
  credentials,
  region,
  tableName,
  indexName,
  scanIndexForward,
  rangeKeyName,
  expressionAttributeNames,
  expressionAttributeValues,
  keyConditionExpression,
  limit,
}: {
  credentials?: Credentials;
  region: string;
  tableName: string;
  indexName?: string;
  scanIndexForward?: boolean;
  rangeKeyName: string;
  expressionAttributeNames: any;
  expressionAttributeValues: any;
  keyConditionExpression: string;
  limit?: number;
}) => {
  const documentClient = new DynamoDB.DocumentClient({ credentials, region });

  const queryParams: DynamoDB.DocumentClient.QueryInput = {
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    KeyConditionExpression: keyConditionExpression,
    IndexName: indexName,
    TableName: tableName,
    ScanIndexForward: scanIndexForward,
    Limit: limit,
  };

  const { Items, LastEvaluatedKey } = await documentClient
    .query(queryParams)
    .promise();

  return {
    items: Items as T[],
    lastEvaluatedKey: LastEvaluatedKey?.[rangeKeyName] as string | undefined,
  };
};

/**
 * @see {@link https://relay.dev/graphql/connections.htm#}
 */
const paginate = async <T = any>({
  credentials,
  region,
  tableName,
  hashKeyName,
  hashKeyValue,
  rangeKeyName,
  indexName,
  sort = 'DESC',
  after,
  first,
  before,
  last,
}: {
  credentials?: Credentials;
  region: string;
  tableName: string;
  hashKeyName: string;
  hashKeyValue: string;
  rangeKeyName: string;
  indexName?: string;
  sort?: Sort;
  after?: string;
  before?: string;
  first?: number;
  last?: number;
}) => {
  const {
    expressionAttributeNames,
    expressionAttributeValues,
    keyConditionExpression,
    scanIndexForward,
    limit,
  } = (() => {
    const params = {
      expressionAttributeNames: { '#hashKey': hashKeyName } as any,
      expressionAttributeValues: { ':hashKey': hashKeyValue } as any,
      keyConditionExpression: '#hashKey = :hashKey',
      scanIndexForward: true,
      limit: undefined as number | undefined,
    };

    if (after) {
      params.scanIndexForward = sort === 'ASC';
      params.expressionAttributeNames['#cursor'] = rangeKeyName;
      params.expressionAttributeValues[':cursor'] = after;
      const operator = sort === 'ASC' ? '>' : '<';
      params.keyConditionExpression = `#hashKey = :hashKey AND #cursor ${operator} :cursor`;
      params.limit = first;
    } else if (before) {
      params.scanIndexForward = sort === 'DESC';
      params.expressionAttributeNames['#cursor'] = rangeKeyName;
      params.expressionAttributeValues[':cursor'] = before;
      const operator = sort === 'DESC' ? '>' : '<';
      params.keyConditionExpression = `#hashKey = :hashKey AND #cursor ${operator} :cursor`;
      params.limit = last;
    }

    return params;
  })();

  const { items, lastEvaluatedKey } = await queryDynamoDB<T>({
    credentials,
    region,
    tableName,
    indexName,
    scanIndexForward,
    rangeKeyName,
    expressionAttributeNames,
    expressionAttributeValues,
    keyConditionExpression,
    limit,
  });

  // const edges = items;

  const edges = items.sort(
    (a: any, b: any) =>
      (sort === 'ASC' ? 1 : -1) *
      String(a[rangeKeyName]).localeCompare(String(b[rangeKeyName]))
  );

  const pageInfo: {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    startCursor?: string;
    endCursor?: string;
  } = (() => {
    const defaultPageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      startCursor: undefined,
      endCursor: undefined,
    };

    if (edges.length > 0) {
      defaultPageInfo.startCursor = (edges[0] as any)[rangeKeyName];
      defaultPageInfo.endCursor = (edges[edges.length - 1] as any)[
        rangeKeyName
      ];
    }

    if (after) {
      defaultPageInfo.hasPreviousPage = true;

      if (lastEvaluatedKey) {
        defaultPageInfo.hasNextPage = true;
      }
    }

    if (before) {
      defaultPageInfo.hasNextPage = true;

      if (lastEvaluatedKey) {
        defaultPageInfo.hasPreviousPage = true;
      }
    }

    return defaultPageInfo;
  })();

  return { edges, pageInfo };
};

export default paginate;
