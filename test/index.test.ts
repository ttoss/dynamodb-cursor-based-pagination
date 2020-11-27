import { Credentials } from 'aws-sdk';
import deepEqual from 'deep-equal';
import faker from 'faker';

import { paginate } from '../src';

require('dotenv').config();

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_SESSION_TOKEN,
  HASH_KEY_NAME,
  HASH_KEY_VALUE,
  RANGE_KEY_NAME,
  TABLE_NAME,
  REGION,
  INDEX_NAME,
} = process.env;

const testAgainstRealTable =
  !!AWS_ACCESS_KEY_ID &&
  !!AWS_SECRET_ACCESS_KEY &&
  !!AWS_SESSION_TOKEN &&
  !!HASH_KEY_NAME &&
  !!HASH_KEY_VALUE &&
  !!RANGE_KEY_NAME &&
  !!TABLE_NAME &&
  !!REGION;

const hashKeyName = HASH_KEY_NAME || faker.random.word();
const hashKeyValue = HASH_KEY_VALUE || faker.random.word();
const rangeKeyName = RANGE_KEY_NAME || faker.random.word();
const indexName = INDEX_NAME || faker.random.word();
const tableName = TABLE_NAME || faker.random.word();
const region = REGION || 'us-east-1';

/**
 * Created as the result of a real table query.
 */
const mockDynamoDBQuery = jest.fn().mockImplementation(queryParams => {
  const getRangeKeySequenceByQueryParams = ({
    matcher: { cursor, keyConditionExpression, scanIndexForward, limit },
    response,
  }: {
    matcher: {
      cursor?: string;
      keyConditionExpression: string;
      scanIndexForward: boolean;
      limit?: number;
    };
    response: any;
  }) => {
    const queryParamsToCompare: any = {
      ExpressionAttributeNames: { '#hashKey': hashKeyName },
      ExpressionAttributeValues: { ':hashKey': hashKeyValue },
      KeyConditionExpression: keyConditionExpression,
      IndexName: indexName,
      TableName: tableName,
      ScanIndexForward: scanIndexForward,
      Limit: limit || undefined,
    };

    if (cursor) {
      queryParamsToCompare.ExpressionAttributeNames['#cursor'] = rangeKeyName;
      queryParamsToCompare.ExpressionAttributeValues[':cursor'] = cursor;
    }

    return deepEqual(queryParams, queryParamsToCompare) ? response : undefined;
  };

  const response = [
    {
      matcher: {
        cursor: 'cursor-35',
        scanIndexForward: true,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor > :cursor',
      },
      response: {
        Items: [],
        Count: 0,
        ScannedCount: 0,
      },
    },
    {
      matcher: {
        limit: 3,
        scanIndexForward: true,
        keyConditionExpression: '#hashKey = :hashKey',
      },
      response: {
        Items: [
          {
            id: 'cursor-10',
            [rangeKeyName]: 'cursor-10',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-11',
            [rangeKeyName]: 'cursor-11',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-12',
            [rangeKeyName]: 'cursor-12',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 3,
        ScannedCount: 3,
        LastEvaluatedKey: {
          id: 'cursor-12',
          [rangeKeyName]: 'cursor-12',
          [hashKeyName]: hashKeyValue,
        },
      },
    },
    {
      matcher: {
        cursor: 'cursor-30',
        scanIndexForward: true,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor > :cursor',
      },
      response: {
        Items: [
          {
            id: 'cursor-31',
            [rangeKeyName]: 'cursor-31',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-32',
            [rangeKeyName]: 'cursor-32',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-33',
            [rangeKeyName]: 'cursor-33',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-34',
            [rangeKeyName]: 'cursor-34',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 4,
        ScannedCount: 4,
      },
    },
    {
      matcher: {
        cursor: 'cursor-20',
        limit: 3,
        scanIndexForward: true,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor > :cursor',
      },
      response: {
        Items: [
          {
            id: 'cursor-21',
            [rangeKeyName]: 'cursor-21',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-22',
            [rangeKeyName]: 'cursor-22',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-23',
            [rangeKeyName]: 'cursor-23',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 3,
        ScannedCount: 3,
        LastEvaluatedKey: {
          id: 'cursor-23',
          [rangeKeyName]: 'cursor-23',
          [hashKeyName]: hashKeyValue,
        },
      },
    },
    {
      matcher: {
        cursor: 'cursor-32',
        limit: 10,
        scanIndexForward: true,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor > :cursor',
      },
      response: {
        Items: [
          {
            id: 'cursor-33',
            [rangeKeyName]: 'cursor-33',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-34',
            [rangeKeyName]: 'cursor-34',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 2,
        ScannedCount: 2,
      },
    },
    {
      matcher: {
        cursor: 'cursor-25',
        limit: 6,
        scanIndexForward: true,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor > :cursor',
      },
      response: {
        Items: [
          {
            id: 'cursor-26',
            [rangeKeyName]: 'cursor-26',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-27',
            [rangeKeyName]: 'cursor-27',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-28',
            [rangeKeyName]: 'cursor-28',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-29',
            [rangeKeyName]: 'cursor-29',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-30',
            [rangeKeyName]: 'cursor-30',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-31',
            [rangeKeyName]: 'cursor-31',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 6,
        ScannedCount: 6,
        LastEvaluatedKey: {
          id: 'cursor-31',
          [rangeKeyName]: 'cursor-31',
          [hashKeyName]: hashKeyValue,
        },
      },
    },
    {
      matcher: {
        cursor: 'cursor-09',
        scanIndexForward: false,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor < :cursor',
      },
      response: {
        Items: [],
        Count: 0,
        ScannedCount: 0,
      },
    },
    {
      matcher: {
        limit: 3,
        scanIndexForward: false,
        keyConditionExpression: '#hashKey = :hashKey',
      },
      response: {
        Items: [
          {
            id: 'cursor-34',
            [rangeKeyName]: 'cursor-34',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-33',
            [rangeKeyName]: 'cursor-33',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-32',
            [rangeKeyName]: 'cursor-32',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 3,
        ScannedCount: 3,
        LastEvaluatedKey: {
          id: 'cursor-32',
          [rangeKeyName]: 'cursor-32',
          [hashKeyName]: hashKeyValue,
        },
      },
    },
    {
      matcher: {
        cursor: 'cursor-16',
        scanIndexForward: false,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor < :cursor',
      },
      response: {
        Items: [
          {
            id: 'cursor-15',
            [rangeKeyName]: 'cursor-15',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-14',
            [rangeKeyName]: 'cursor-14',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-13',
            [rangeKeyName]: 'cursor-13',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-12',
            [rangeKeyName]: 'cursor-12',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-11',
            [rangeKeyName]: 'cursor-11',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-10',
            [rangeKeyName]: 'cursor-10',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 6,
        ScannedCount: 6,
      },
    },
    {
      matcher: {
        cursor: 'cursor-16',
        limit: 3,
        scanIndexForward: false,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor < :cursor',
      },
      response: {
        Items: [
          {
            id: 'cursor-15',
            [rangeKeyName]: 'cursor-15',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-14',
            [rangeKeyName]: 'cursor-14',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-13',
            [rangeKeyName]: 'cursor-13',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 3,
        ScannedCount: 3,
        LastEvaluatedKey: {
          id: 'cursor-13',
          [rangeKeyName]: 'cursor-13',
          [hashKeyName]: hashKeyValue,
        },
      },
    },
    {
      matcher: {
        cursor: 'cursor-12',
        limit: 10,
        scanIndexForward: false,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor < :cursor',
      },
      response: {
        Items: [
          {
            id: 'cursor-11',
            [rangeKeyName]: 'cursor-11',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-10',
            [rangeKeyName]: 'cursor-10',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 2,
        ScannedCount: 2,
      },
    },
    {
      matcher: {
        cursor: 'cursor-25',
        limit: 6,
        scanIndexForward: false,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor < :cursor',
      },
      response: {
        Items: [
          {
            id: 'cursor-24',
            [rangeKeyName]: 'cursor-24',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-23',
            [rangeKeyName]: 'cursor-23',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-22',
            [rangeKeyName]: 'cursor-22',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-21',
            [rangeKeyName]: 'cursor-21',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-20',
            [rangeKeyName]: 'cursor-20',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-19',
            [rangeKeyName]: 'cursor-19',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 6,
        ScannedCount: 6,
        LastEvaluatedKey: {
          id: 'cursor-19',
          [rangeKeyName]: 'cursor-19',
          [hashKeyName]: hashKeyValue,
        },
      },
    },
    {
      matcher: {
        cursor: 'cursor-09',
        scanIndexForward: false,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor < :cursor',
      },
      response: {
        Items: [],
        Count: 0,
        ScannedCount: 0,
      },
    },
    {
      matcher: {
        limit: 3,
        scanIndexForward: false,
        keyConditionExpression: '#hashKey = :hashKey',
      },
      response: {
        Items: [
          {
            id: 'cursor-34',
            [rangeKeyName]: 'cursor-34',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-33',
            [rangeKeyName]: 'cursor-33',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-32',
            [rangeKeyName]: 'cursor-32',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 3,
        ScannedCount: 3,
        LastEvaluatedKey: {
          id: 'cursor-32',
          [rangeKeyName]: 'cursor-32',
          [hashKeyName]: hashKeyValue,
        },
      },
    },
    {
      matcher: {
        cursor: 'cursor-15',
        scanIndexForward: false,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor < :cursor',
      },
      response: {
        Items: [
          {
            id: 'cursor-14',
            [rangeKeyName]: 'cursor-14',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-13',
            [rangeKeyName]: 'cursor-13',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-12',
            [rangeKeyName]: 'cursor-12',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-11',
            [rangeKeyName]: 'cursor-11',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-10',
            [rangeKeyName]: 'cursor-10',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 5,
        ScannedCount: 5,
      },
    },
    {
      matcher: {
        cursor: 'cursor-14',
        limit: 3,
        scanIndexForward: false,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor < :cursor',
      },
      response: {
        Items: [
          {
            id: 'cursor-13',
            [rangeKeyName]: 'cursor-13',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-12',
            [rangeKeyName]: 'cursor-12',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-11',
            [rangeKeyName]: 'cursor-11',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 3,
        ScannedCount: 3,
        LastEvaluatedKey: {
          id: 'cursor-11',
          [rangeKeyName]: 'cursor-11',
          [hashKeyName]: hashKeyValue,
        },
      },
    },
    {
      matcher: {
        cursor: 'cursor-25',
        limit: 6,
        scanIndexForward: false,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor < :cursor',
      },
      response: {
        Items: [
          {
            id: 'cursor-24',
            [rangeKeyName]: 'cursor-24',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-23',
            [rangeKeyName]: 'cursor-23',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-22',
            [rangeKeyName]: 'cursor-22',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-21',
            [rangeKeyName]: 'cursor-21',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-20',
            [rangeKeyName]: 'cursor-20',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-19',
            [rangeKeyName]: 'cursor-19',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 6,
        ScannedCount: 6,
        LastEvaluatedKey: {
          id: 'cursor-19',
          [rangeKeyName]: 'cursor-19',
          [hashKeyName]: hashKeyValue,
        },
      },
    },
    {
      matcher: {
        cursor: 'cursor-35',
        scanIndexForward: true,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor > :cursor',
      },
      response: {
        Items: [],
        Count: 0,
        ScannedCount: 0,
      },
    },
    {
      matcher: {
        limit: 3,
        scanIndexForward: true,
        keyConditionExpression: '#hashKey = :hashKey',
      },
      response: {
        Items: [
          {
            id: 'cursor-10',
            [rangeKeyName]: 'cursor-10',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-11',
            [rangeKeyName]: 'cursor-11',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-12',
            [rangeKeyName]: 'cursor-12',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 3,
        ScannedCount: 3,
        LastEvaluatedKey: {
          id: 'cursor-12',
          [rangeKeyName]: 'cursor-12',
          [hashKeyName]: hashKeyValue,
        },
      },
    },
    {
      matcher: {
        cursor: 'cursor-31',
        scanIndexForward: true,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor > :cursor',
      },
      response: {
        Items: [
          {
            id: 'cursor-32',
            [rangeKeyName]: 'cursor-32',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-33',
            [rangeKeyName]: 'cursor-33',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-34',
            [rangeKeyName]: 'cursor-34',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 3,
        ScannedCount: 3,
      },
    },
    {
      matcher: {
        cursor: 'cursor-30',
        limit: 3,
        scanIndexForward: true,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor > :cursor',
      },
      response: {
        Items: [
          {
            id: 'cursor-31',
            [rangeKeyName]: 'cursor-31',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-32',
            [rangeKeyName]: 'cursor-32',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-33',
            [rangeKeyName]: 'cursor-33',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 3,
        ScannedCount: 3,
        LastEvaluatedKey: {
          id: 'cursor-33',
          [rangeKeyName]: 'cursor-33',
          [hashKeyName]: hashKeyValue,
        },
      },
    },
    {
      matcher: {
        cursor: 'cursor-25',
        limit: 6,
        scanIndexForward: true,
        keyConditionExpression: '#hashKey = :hashKey AND #cursor > :cursor',
      },
      response: {
        Items: [
          {
            id: 'cursor-26',
            [rangeKeyName]: 'cursor-26',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-27',
            [rangeKeyName]: 'cursor-27',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-28',
            [rangeKeyName]: 'cursor-28',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-29',
            [rangeKeyName]: 'cursor-29',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-30',
            [rangeKeyName]: 'cursor-30',
            [hashKeyName]: hashKeyValue,
          },
          {
            id: 'cursor-31',
            [rangeKeyName]: 'cursor-31',
            [hashKeyName]: hashKeyValue,
          },
        ],
        Count: 6,
        ScannedCount: 6,
        LastEvaluatedKey: {
          id: 'cursor-31',
          [rangeKeyName]: 'cursor-31',
          [hashKeyName]: hashKeyValue,
        },
      },
    },
  ].reduce<any | undefined>((acc, input) => {
    return acc || getRangeKeySequenceByQueryParams(input);
  }, undefined);

  if (!response) {
    throw new Error(
      `response is not defined when queryParams is: \n ${JSON.stringify(
        queryParams,
        null,
        2
      )}`
    );
  }

  return {
    promise: () => {
      return Promise.resolve(response);
    },
  };
});

jest.mock('aws-sdk', () => {
  return {
    ...(jest.requireActual('aws-sdk') as any),
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        query: mockDynamoDBQuery,
      })),
    },
  };
});

const defaultQueryParams = {
  credentials: testAgainstRealTable
    ? new Credentials({
        accessKeyId: AWS_ACCESS_KEY_ID as string,
        secretAccessKey: AWS_SECRET_ACCESS_KEY as string,
        sessionToken: AWS_SESSION_TOKEN as string,
      })
    : undefined,
  region,
  hashKeyName,
  hashKeyValue,
  rangeKeyName,
  indexName,
  tableName,
};

/**
 * Wrap paginate and return only cursor (range key) values.
 */
const testPaginate = async (
  params: Partial<Parameters<typeof paginate>[0]>
) => {
  const { edges, pageInfo } = await paginate({
    ...defaultQueryParams,
    ...params,
  });
  return { edges: edges.map(({ cursor }) => cursor), pageInfo };
};

describe('errors', () => {
  it('throw error if first is negative', () => {
    return expect(testPaginate({ first: -1 })).rejects.toThrow();
  });

  it('throw error if last is negative', () => {
    return expect(testPaginate({ last: -1 })).rejects.toThrow();
  });
});

describe('pagination', () => {
  describe('ascending sorting', () => {
    const sort = 'ASC' as const;

    describe('forward pagination', () => {
      it('return no items because after-cursor is after last item', () => {
        return expect(
          testPaginate({ after: 'cursor-35', sort })
        ).resolves.toEqual({
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
          },
        });
      });

      it('return first 3 items (after-cursor undefined)', () => {
        return expect(
          testPaginate({
            sort,
            first: 3,
          })
        ).resolves.toEqual({
          edges: ['cursor-10', 'cursor-11', 'cursor-12'],
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: true,
            startCursor: 'cursor-10',
            endCursor: 'cursor-12',
          },
        });
      });

      it('return items after after-cursor', () => {
        return expect(
          testPaginate({
            sort,
            after: 'cursor-30',
          })
        ).resolves.toEqual({
          edges: ['cursor-31', 'cursor-32', 'cursor-33', 'cursor-34'],
          pageInfo: {
            hasPreviousPage: true,
            hasNextPage: false,
            startCursor: 'cursor-31',
            endCursor: 'cursor-34',
          },
        });
      });

      it('return first 3 items after after-cursor', () => {
        return expect(
          testPaginate({
            sort,
            after: 'cursor-20',
            first: 3,
          })
        ).resolves.toEqual({
          edges: ['cursor-21', 'cursor-22', 'cursor-23'],
          pageInfo: {
            hasPreviousPage: true,
            hasNextPage: true,
            startCursor: 'cursor-21',
            endCursor: 'cursor-23',
          },
        });
      });

      it('hasNextPage=false because first is greater than the remaining items', () => {
        return expect(
          testPaginate({
            sort,
            after: 'cursor-32',
            first: 10,
          })
        ).resolves.toEqual({
          edges: ['cursor-33', 'cursor-34'],
          pageInfo: {
            hasPreviousPage: true,
            hasNextPage: false,
            startCursor: 'cursor-33',
            endCursor: 'cursor-34',
          },
        });
      });

      it('when beginsWith=cursor-2, after=5 and first=6, return hasNextPage=false because items were filtered', () => {
        return expect(
          testPaginate({
            sort,
            beginsWith: 'cursor-2',
            after: '5',
            first: 6,
          })
        ).resolves.toEqual({
          edges: ['6', '7', '8', '9'],
          pageInfo: {
            hasPreviousPage: true,
            hasNextPage: false,
            startCursor: '6',
            endCursor: '9',
          },
        });
      });
    });

    describe('backward pagination', () => {
      it('return no items because before-cursor is before first item', () => {
        return expect(
          testPaginate({ before: 'cursor-09', sort })
        ).resolves.toEqual({
          edges: [],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
          },
        });
      });

      it('return last 3 items (before-cursor undefined)', () => {
        return expect(
          testPaginate({
            sort,
            last: 3,
          })
        ).resolves.toEqual({
          edges: ['cursor-32', 'cursor-33', 'cursor-34'],
          pageInfo: {
            hasPreviousPage: true,
            hasNextPage: false,
            startCursor: 'cursor-32',
            endCursor: 'cursor-34',
          },
        });
      });

      it('return items before before-cursor', () => {
        return expect(
          testPaginate({
            sort,
            before: 'cursor-16',
          })
        ).resolves.toEqual({
          edges: [
            'cursor-10',
            'cursor-11',
            'cursor-12',
            'cursor-13',
            'cursor-14',
            'cursor-15',
          ],
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: true,
            startCursor: 'cursor-10',
            endCursor: 'cursor-15',
          },
        });
      });

      it('return last 3 items before before-cursor', () => {
        return expect(
          testPaginate({
            sort,
            before: 'cursor-16',
            last: 3,
          })
        ).resolves.toEqual({
          edges: ['cursor-13', 'cursor-14', 'cursor-15'],
          pageInfo: {
            hasPreviousPage: true,
            hasNextPage: true,
            startCursor: 'cursor-13',
            endCursor: 'cursor-15',
          },
        });
      });

      it('hasPreviousPage=false because last is greater than the remaining items', () => {
        return expect(
          testPaginate({
            sort,
            before: 'cursor-12',
            last: 10,
          })
        ).resolves.toEqual({
          edges: ['cursor-10', 'cursor-11'],
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: true,
            startCursor: 'cursor-10',
            endCursor: 'cursor-11',
          },
        });
      });

      it('when beginsWith=cursor-2, before=5 and last=6, return hasPreviousPage=false because items were filtered', () => {
        return expect(
          testPaginate({
            sort,
            beginsWith: 'cursor-2',
            before: '5',
            last: 6,
          })
        ).resolves.toEqual({
          edges: ['0', '1', '2', '3', '4'],
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: true,
            startCursor: '0',
            endCursor: '4',
          },
        });
      });
    });
  });

  describe('descending sorting', () => {
    const sort = 'DESC' as const;

    describe('forward pagination', () => {
      it('return no items because after-cursor is after last item', () => {
        return expect(
          testPaginate({ after: 'cursor-09', sort })
        ).resolves.toEqual({
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
          },
        });
      });

      it('return first 3 items (after-cursor undefined)', () => {
        return expect(
          testPaginate({
            sort,
            first: 3,
          })
        ).resolves.toEqual({
          edges: ['cursor-34', 'cursor-33', 'cursor-32'],
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: true,
            startCursor: 'cursor-34',
            endCursor: 'cursor-32',
          },
        });
      });

      it('return items after after-cursor', () => {
        return expect(
          testPaginate({
            sort,
            after: 'cursor-15',
          })
        ).resolves.toEqual({
          edges: [
            'cursor-14',
            'cursor-13',
            'cursor-12',
            'cursor-11',
            'cursor-10',
          ],
          pageInfo: {
            hasPreviousPage: true,
            hasNextPage: false,
            startCursor: 'cursor-14',
            endCursor: 'cursor-10',
          },
        });
      });

      it('return first 3 items after after-cursor', () => {
        return expect(
          testPaginate({
            sort,
            after: 'cursor-14',
            first: 3,
          })
        ).resolves.toEqual({
          edges: ['cursor-13', 'cursor-12', 'cursor-11'],
          pageInfo: {
            hasPreviousPage: true,
            hasNextPage: true,
            startCursor: 'cursor-13',
            endCursor: 'cursor-11',
          },
        });
      });

      it('when beginsWith=cursor-2, after=5 and first=6, return hasNextPage=false because items were filtered', () => {
        return expect(
          testPaginate({
            sort,
            beginsWith: 'cursor-2',
            after: '5',
            first: 6,
          })
        ).resolves.toEqual({
          edges: ['4', '3', '2', '1', '0'],
          pageInfo: {
            hasPreviousPage: true,
            hasNextPage: false,
            startCursor: '4',
            endCursor: '0',
          },
        });
      });
    });

    describe('backward pagination', () => {
      it('return no items because before-cursor is before first item', () => {
        return expect(
          testPaginate({ before: 'cursor-35', sort })
        ).resolves.toEqual({
          edges: [],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
          },
        });
      });

      it('return last 3 items (before-cursor undefined)', () => {
        return expect(
          testPaginate({
            sort,
            last: 3,
          })
        ).resolves.toEqual({
          edges: ['cursor-12', 'cursor-11', 'cursor-10'],
          pageInfo: {
            hasPreviousPage: true,
            hasNextPage: false,
            startCursor: 'cursor-12',
            endCursor: 'cursor-10',
          },
        });
      });

      it('return items before before-cursor', () => {
        return expect(
          testPaginate({
            sort,
            before: 'cursor-31',
          })
        ).resolves.toEqual({
          edges: ['cursor-34', 'cursor-33', 'cursor-32'],
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: true,
            startCursor: 'cursor-34',
            endCursor: 'cursor-32',
          },
        });
      });

      it('return last 3 items before before-cursor', () => {
        return expect(
          testPaginate({
            sort,
            before: 'cursor-30',
            last: 3,
          })
        ).resolves.toEqual({
          edges: ['cursor-33', 'cursor-32', 'cursor-31'],
          pageInfo: {
            hasPreviousPage: true,
            hasNextPage: true,
            startCursor: 'cursor-33',
            endCursor: 'cursor-31',
          },
        });
      });

      it('when beginsWith=cursor-2, before=5 and last=6, return hasPreviousPage=false because items was filtered', () => {
        return expect(
          testPaginate({
            sort,
            beginsWith: 'cursor-2',
            before: '5',
            last: 6,
          })
        ).resolves.toEqual({
          edges: ['9', '8', '7', '6'],
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: true,
            startCursor: '9',
            endCursor: '6',
          },
        });
      });
    });
  });
});
