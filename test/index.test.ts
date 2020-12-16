import { Credentials } from 'aws-sdk';
import faker from 'faker';

import { paginate } from '../src';

import { NUMBER_OF_ITEMS } from './config';

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
const indexName = INDEX_NAME;
const tableName = TABLE_NAME || faker.random.word();
const region = REGION || 'us-east-1';

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
  test('default args', async () => {
    const response = await testPaginate({});
    expect(response.edges.length).toEqual(NUMBER_OF_ITEMS);
    expect(response.pageInfo).toEqual({
      hasPreviousPage: false,
      hasNextPage: false,
      startCursor: 'cursor-34',
      endCursor: 'cursor-10',
    });
  });

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

describe('projection expression', () => {
  const first = 1;
  test('return only hashKey', async () => {
    const response = await paginate({
      ...defaultQueryParams,
      first,
      projectionExpression: hashKeyName,
    });
    expect(Object.keys(response.edges[0].node)).toEqual([hashKeyName]);
  });

  test('return only hashKey and rangeKey', async () => {
    const response = await paginate({
      ...defaultQueryParams,
      first,
      projectionExpression: [hashKeyName, rangeKeyName].join(','),
    });
    expect(Object.keys(response.edges[0].node).sort()).toEqual(
      [hashKeyName, rangeKeyName].sort()
    );
  });
});

describe('filters', () => {
  test('return only items whose cursor > 20', async () => {
    const { pageInfo } = await paginate({
      ...defaultQueryParams,
      filterExpression: '#index > :index',
      filterAttributeNames: {
        '#index': 'index',
      },
      filterAttributeValues: {
        ':index': 20,
      },
    });
    expect(pageInfo).toEqual(
      expect.objectContaining({
        startCursor: 'cursor-34',
        endCursor: 'cursor-21',
      })
    );
  });

  test('return only even cursors', async () => {
    const { edges } = await paginate({
      ...defaultQueryParams,
      filterExpression: '#parity = :parity',
      filterAttributeNames: {
        '#parity': 'parity',
      },
      filterAttributeValues: {
        ':parity': 'EVEN',
      },
    });
    const parityValues = Array.from(
      new Set<{ parity: string }>(edges.map(({ node }) => node.parity))
    );
    expect(parityValues).toEqual(['EVEN']);
  });
});
