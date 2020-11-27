import { DynamoDB, Credentials } from 'aws-sdk';
import debug from 'debug';

type Sort = 'ASC' | 'DESC';

const logQueryParams = debug('queryParams');
const logDynamoDBResponse = debug('dynamoDBResponse');

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

  const response = await documentClient.query(queryParams).promise();

  logDynamoDBResponse(JSON.stringify(response, null, 2));

  const {
    Items,
    LastEvaluatedKey,
    ConsumedCapacity,
    Count,
    ScannedCount,
  } = response;

  return {
    items: Items as T[],
    lastEvaluatedKey: LastEvaluatedKey?.[rangeKeyName] as string | undefined,
    consumedCapacity: ConsumedCapacity,
    count: Count,
    scannedCount: ScannedCount,
  };
};

export const paginate = async <T = any>({
  credentials,
  region,
  tableName,
  hashKeyName,
  hashKeyValue,
  rangeKeyName,
  indexName,
  beginsWith = '',
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
  beginsWith?: string;
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
        params.expressionAttributeValues[':cursor'] = beginsWith + after;
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
        params.expressionAttributeValues[':cursor'] = beginsWith + before;
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

  const replacerRegex = new RegExp(`^${beginsWith}`);

  const edges = items
    .filter(node => String((node as any)[rangeKeyName]).startsWith(beginsWith))
    .map(node => ({
      cursor: String((node as any)[rangeKeyName]).replace(replacerRegex, ''),
      node,
    }))
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
      startCursor: undefined as undefined | string,
      endCursor: undefined as undefined | string,
    };

    if (edges.length > 0) {
      defaultPageInfo.startCursor = edges[0].cursor;
      defaultPageInfo.endCursor = edges[edges.length - 1].cursor;
    }

    if (after) {
      defaultPageInfo.hasPreviousPage = true;
    }

    if (before) {
      defaultPageInfo.hasNextPage = true;
    }

    /**
     * If edges was filtered, means that more items was returned that the only
     * ones that starts with beginsWith, then there are next/previous page.
     */
    const edgesWasFiltered = edges.length !== items.length;

    if (lastEvaluatedKey && !edgesWasFiltered && (after || first)) {
      defaultPageInfo.hasNextPage = true;
    }

    if (lastEvaluatedKey && !edgesWasFiltered && (before || last)) {
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
