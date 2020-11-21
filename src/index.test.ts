import { Credentials } from 'aws-sdk';
import deepEqual from 'deep-equal';
import faker from 'faker';

import paginate from './';

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

const mockDynamoDBQuery = jest.fn().mockImplementation(queryParams => {
  let rangeKeySequence: string[] | undefined = undefined;

  if (
    deepEqual(queryParams, {
      ExpressionAttributeNames: { '#hashKey': hashKeyName },
      ExpressionAttributeValues: { ':hashKey': hashKeyValue },
      KeyConditionExpression: '#hashKey = :hashKey',
      IndexName: indexName,
      TableName: tableName,
      ScanIndexForward: true,
    })
  ) {
    rangeKeySequence = [
      '2020-11-19T00:00:00.000Z',
      '2020-11-19T01:00:00.000Z',
      '2020-11-19T02:00:00.000Z',
      '2020-11-19T03:00:00.000Z',
      '2020-11-19T04:00:00.000Z',
      '2020-11-19T05:00:00.000Z',
      '2020-11-19T06:00:00.000Z',
      '2020-11-19T07:00:00.000Z',
      '2020-11-19T08:00:00.000Z',
      '2020-11-19T09:00:00.000Z',
      '2020-11-19T10:00:00.000Z',
    ];
  }

  if (
    deepEqual(queryParams, {
      ExpressionAttributeNames: { '#hashKey': hashKeyName },
      ExpressionAttributeValues: { ':hashKey': hashKeyValue },
      KeyConditionExpression: '#hashKey = :hashKey',
      IndexName: indexName,
      TableName: tableName,
      ScanIndexForward: false,
    })
  ) {
    rangeKeySequence = [
      '2020-11-19T10:00:00.000Z',
      '2020-11-19T09:00:00.000Z',
      '2020-11-19T08:00:00.000Z',
      '2020-11-19T07:00:00.000Z',
      '2020-11-19T06:00:00.000Z',
      '2020-11-19T05:00:00.000Z',
      '2020-11-19T04:00:00.000Z',
      '2020-11-19T03:00:00.000Z',
      '2020-11-19T02:00:00.000Z',
      '2020-11-19T01:00:00.000Z',
      '2020-11-19T00:00:00.000Z',
    ];
  }

  if (!rangeKeySequence) {
    throw new Error(
      `rangeKeySequence is not defined when queryParams is: \n ${JSON.stringify(
        queryParams,
        null,
        2
      )}`
    );
  }

  const Items = rangeKeySequence.map(rangeKeyValue => ({
    hashKeyName: hashKeyValue,
    rangeKeyName: rangeKeyValue,
  }));

  return {
    promise: () => {
      return Promise.resolve({ Items });
    },
  };
});

if (!testAgainstRealTable) {
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
}

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
 * Wrap paginate and return only range key values.
 */
const testPaginate = async (
  params: Partial<Parameters<typeof paginate>[0]>
) => {
  const { edges, pageInfo } = await paginate({
    ...defaultQueryParams,
    ...params,
  });
  return { edges: edges.map((item: any) => item[rangeKeyName]), pageInfo };
};

describe('ascendent sorting', () => {
  const sort = 'ASC' as const;

  describe('forward pagination', () => {
    it('return no items because after-cursor is after last item', () => {
      return expect(
        testPaginate({ after: '2030-11-19T00:00:00.000Z', sort })
      ).resolves.toEqual({
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });
    });

    it('return items after after-cursor', () => {
      return expect(
        testPaginate({
          sort,
          after: '2020-11-19T06:00:00.000Z',
        })
      ).resolves.toEqual({
        edges: [
          '2020-11-19T07:00:00.000Z',
          '2020-11-19T08:00:00.000Z',
          '2020-11-19T09:00:00.000Z',
          '2020-11-19T10:00:00.000Z',
        ],
        pageInfo: {
          hasPreviousPage: true,
          hasNextPage: false,
          startCursor: '2020-11-19T07:00:00.000Z',
          endCursor: '2020-11-19T10:00:00.000Z',
        },
      });
    });

    it('return first 3 items after after-cursor', () => {
      return expect(
        testPaginate({
          sort,
          after: '2020-11-19T06:00:00.000Z',
          first: 3,
        })
      ).resolves.toEqual({
        edges: [
          '2020-11-19T07:00:00.000Z',
          '2020-11-19T08:00:00.000Z',
          '2020-11-19T09:00:00.000Z',
        ],
        pageInfo: {
          hasPreviousPage: true,
          hasNextPage: true,
          startCursor: '2020-11-19T07:00:00.000Z',
          endCursor: '2020-11-19T09:00:00.000Z',
        },
      });
    });
  });

  describe('backward pagination', () => {
    it('return no items because before-cursor is before first item', () => {
      return expect(
        testPaginate({ before: '2010-11-19T00:00:00.000Z', sort })
      ).resolves.toEqual({
        edges: [],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
        },
      });
    });

    it('return items before before-cursor', () => {
      return expect(
        testPaginate({
          sort,
          before: '2020-11-19T06:00:00.000Z',
        })
      ).resolves.toEqual({
        edges: [
          '2020-11-19T00:00:00.000Z',
          '2020-11-19T01:00:00.000Z',
          '2020-11-19T02:00:00.000Z',
          '2020-11-19T03:00:00.000Z',
          '2020-11-19T04:00:00.000Z',
          '2020-11-19T05:00:00.000Z',
        ],
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: true,
          startCursor: '2020-11-19T00:00:00.000Z',
          endCursor: '2020-11-19T05:00:00.000Z',
        },
      });
    });

    it('return last 3 items before before-cursor', () => {
      return expect(
        testPaginate({
          sort,
          before: '2020-11-19T06:00:00.000Z',
          last: 3,
        })
      ).resolves.toEqual({
        edges: [
          '2020-11-19T03:00:00.000Z',
          '2020-11-19T04:00:00.000Z',
          '2020-11-19T05:00:00.000Z',
        ],
        pageInfo: {
          hasPreviousPage: true,
          hasNextPage: true,
          startCursor: '2020-11-19T03:00:00.000Z',
          endCursor: '2020-11-19T05:00:00.000Z',
        },
      });
    });
  });
});

describe('descendent sorting', () => {
  const sort = 'DESC' as const;

  describe('forward pagination', () => {
    it('return no items because after-cursor is after last item', () => {
      return expect(
        testPaginate({ after: '2010-11-19T00:00:00.000Z', sort })
      ).resolves.toEqual({
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });
    });

    it('return items after after-cursor', () => {
      return expect(
        testPaginate({
          sort,
          after: '2020-11-19T06:00:00.000Z',
        })
      ).resolves.toEqual({
        edges: [
          '2020-11-19T05:00:00.000Z',
          '2020-11-19T04:00:00.000Z',
          '2020-11-19T03:00:00.000Z',
          '2020-11-19T02:00:00.000Z',
          '2020-11-19T01:00:00.000Z',
          '2020-11-19T00:00:00.000Z',
        ],
        pageInfo: {
          hasPreviousPage: true,
          hasNextPage: false,
          startCursor: '2020-11-19T05:00:00.000Z',
          endCursor: '2020-11-19T00:00:00.000Z',
        },
      });
    });

    it('return first 3 items after after-cursor', () => {
      return expect(
        testPaginate({
          sort,
          after: '2020-11-19T06:00:00.000Z',
          first: 3,
        })
      ).resolves.toEqual({
        edges: [
          '2020-11-19T05:00:00.000Z',
          '2020-11-19T04:00:00.000Z',
          '2020-11-19T03:00:00.000Z',
        ],
        pageInfo: {
          hasPreviousPage: true,
          hasNextPage: true,
          startCursor: '2020-11-19T05:00:00.000Z',
          endCursor: '2020-11-19T03:00:00.000Z',
        },
      });
    });
  });

  describe('backward pagination', () => {
    it('return no items because before-cursor is before first item', () => {
      return expect(
        testPaginate({ before: '2030-11-19T00:00:00.000Z', sort })
      ).resolves.toEqual({
        edges: [],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
        },
      });
    });

    it('return items before before-cursor', () => {
      return expect(
        testPaginate({
          sort,
          before: '2020-11-19T06:00:00.000Z',
        })
      ).resolves.toEqual({
        edges: [
          '2020-11-19T10:00:00.000Z',
          '2020-11-19T09:00:00.000Z',
          '2020-11-19T08:00:00.000Z',
          '2020-11-19T07:00:00.000Z',
        ],
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: true,
          startCursor: '2020-11-19T10:00:00.000Z',
          endCursor: '2020-11-19T07:00:00.000Z',
        },
      });
    });

    it('return last 3 items before before-cursor', () => {
      return expect(
        testPaginate({
          sort,
          before: '2020-11-19T06:00:00.000Z',
          last: 3,
        })
      ).resolves.toEqual({
        edges: [
          '2020-11-19T09:00:00.000Z',
          '2020-11-19T08:00:00.000Z',
          '2020-11-19T07:00:00.000Z',
        ],
        pageInfo: {
          hasPreviousPage: true,
          hasNextPage: true,
          startCursor: '2020-11-19T09:00:00.000Z',
          endCursor: '2020-11-19T07:00:00.000Z',
        },
      });
    });
  });
});
