import { DynamoDB, Credentials } from 'aws-sdk';
import debug from 'debug';

type Sort = 'ASC' | 'DESC';

const logQueryParams = debug('queryParams');

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

  logQueryParams(JSON.stringify(queryParams, null, 2));

  const {
    Items,
    LastEvaluatedKey,
    ConsumedCapacity,
    Count,
    ScannedCount,
  } = await documentClient.query(queryParams).promise();

  return {
    items: Items as T[],
    lastEvaluatedKey: LastEvaluatedKey?.[rangeKeyName] as string | undefined,
    consumedCapacity: ConsumedCapacity,
    count: Count,
    scannedCount: ScannedCount,
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

    if (after || first) {
      if (first && first < 0) {
        throw new Error('FirstMustNotBeNegative');
      }

      if (after) {
        params.expressionAttributeNames['#cursor'] = rangeKeyName;
        params.expressionAttributeValues[':cursor'] = after;
        const operator = sort === 'ASC' ? '>' : '<';
        params.keyConditionExpression = `#hashKey = :hashKey AND #cursor ${operator} :cursor`;
      }
      params.scanIndexForward = sort === 'ASC';
      params.limit = first;
    } else if (before || last) {
      if (last && last < 0) {
        throw new Error('LastMustNotBeNegative');
      }

      if (before) {
        params.expressionAttributeNames['#cursor'] = rangeKeyName;
        params.expressionAttributeValues[':cursor'] = before;
        const operator = sort === 'DESC' ? '>' : '<';
        params.keyConditionExpression = `#hashKey = :hashKey AND #cursor ${operator} :cursor`;
      }
      params.scanIndexForward = sort === 'DESC';
      params.limit = last;
    }

    return params;
  })();

  const {
    items,
    lastEvaluatedKey,
    consumedCapacity,
    count,
    scannedCount,
  } = await queryDynamoDB<T>({
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

  const edges = items
    .map(node => ({ cursor: (node as any)[rangeKeyName], node }))
    .sort(
      (a, b) =>
        (sort === 'ASC' ? 1 : -1) *
        String(a.cursor).localeCompare(String(b.cursor))
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
      defaultPageInfo.startCursor = edges[0].cursor;
      defaultPageInfo.endCursor = edges[edges.length - 1].cursor;
    }

    if (after) {
      defaultPageInfo.hasPreviousPage = true;
    }

    if (lastEvaluatedKey && (after || first)) {
      defaultPageInfo.hasNextPage = true;
    }

    if (before) {
      defaultPageInfo.hasNextPage = true;
    }

    if (lastEvaluatedKey && (before || last)) {
      defaultPageInfo.hasPreviousPage = true;
    }

    return defaultPageInfo;
  })();

  return {
    edges,
    pageInfo,
    consumedCapacity,
    count,
    scannedCount,
    lastEvaluatedKey,
  };
};

export default paginate;
