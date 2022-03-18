import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb';
  
type Sort = 'ASC' | 'DESC';

export const paginate = async <T = any>({
  dynamoDBClient,
  tableName,
  hashKey,
  hashKeyValue,
  rangeKey,
  index,
  projectionExpression,
  filterExpression,
  filterAttributeNames,
  filterAttributeValues,
  beginsWith = '',
  sort = 'DESC',
  after,
  first,
  before,
  last,
}: {
  dynamoDBClient: DynamoDBClient;
  tableName: string;
  hashKey: string;
  hashKeyValue: string;
  rangeKey: string;
  beginsWith?: string;
  index?: string;
  projectionExpression?: string;
  filterExpression?: string;
  filterAttributeNames?: { [key: string]: string };
  filterAttributeValues?: { [key: string]: any };
  sort?: Sort;
  after?: string;
  before?: string;
  first?: number;
  last?: number;
}) => {
  const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);

  const {
    expressionAttributeNames,
    expressionAttributeValues,
    keyConditionExpression,
    scanIndexForward,
    limit,
  } = (() => {
    const paginateHashKeyName = '#paginateHashKey';
    const paginateHashKeyValue = ':paginateHashKey';
    const paginateCursorName = '#paginateCursor';
    const paginateCursorValue = ':paginateCursor';

    const params = {
      expressionAttributeNames: {
        ...filterAttributeNames,
        [paginateHashKeyName]: hashKey,
      } as any,
      expressionAttributeValues: {
        ...filterAttributeValues,
        [paginateHashKeyValue]: hashKeyValue,
      } as any,
      keyConditionExpression: `${paginateHashKeyName} = ${paginateHashKeyValue}`,
      scanIndexForward: true,
      limit: undefined as number | undefined,
    };

    const getKeyConditionExpression = (operator: string) =>
      `${paginateHashKeyName} = ${paginateHashKeyValue} AND ${paginateCursorName} ${operator} ${paginateCursorValue}`;

    if (after || first) {
      if (first && first < 0) {
        throw new Error('FirstMustNotBeNegative');
      }

      if (after) {
        params.expressionAttributeNames[paginateCursorName] = rangeKey;
        params.expressionAttributeValues[paginateCursorValue] =
          beginsWith + after;
        const operator = sort === 'ASC' ? '>' : '<';
        params.keyConditionExpression = getKeyConditionExpression(operator);
      }

      params.scanIndexForward = sort === 'ASC';
      params.limit = first;
    } else if (before || last) {
      if (last && last < 0) {
        throw new Error('LastMustNotBeNegative');
      }

      if (before) {
        params.expressionAttributeNames[paginateCursorName] = rangeKey;
        params.expressionAttributeValues[paginateCursorValue] =
          beginsWith + before;
        const operator = sort === 'DESC' ? '>' : '<';
        params.keyConditionExpression = getKeyConditionExpression(operator);
      }

      params.scanIndexForward = sort === 'DESC';
      params.limit = last;
    }

    return params;
  })();

  const queryDynamoDB = async <T>() => {
    const queryParams: QueryCommandInput = {
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      KeyConditionExpression: keyConditionExpression,
      IndexName: index,
      TableName: tableName,
      ScanIndexForward: scanIndexForward,
      Limit: limit,
      ProjectionExpression: projectionExpression,
      FilterExpression: filterExpression,
    };

    const response = await documentClient.send(new QueryCommand(queryParams));

    const {
      Items,
      LastEvaluatedKey,
      ConsumedCapacity,
      Count,
      ScannedCount,
    } = response;

    return {
      items: Items as T[],
      lastEvaluatedKey: LastEvaluatedKey?.[rangeKey] as string | undefined,
      consumedCapacity: ConsumedCapacity as number | undefined,
      count: Count,
      scannedCount: ScannedCount,
    };
  };

  const {
    items,
    lastEvaluatedKey,
    consumedCapacity,
    count,
    scannedCount,
  } = await queryDynamoDB<T>();

  /**
   * Used to remove beginsWith from cursor.
   */
  const replacerRegex = new RegExp(`^${beginsWith}`);

  const edges = items
    .filter(node => String((node as any)[rangeKey]).startsWith(beginsWith))
    .map(node => ({
      cursor: String((node as any)[rangeKey]).replace(replacerRegex, ''),
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