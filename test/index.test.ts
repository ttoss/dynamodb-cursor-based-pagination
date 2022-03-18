import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, PutCommand} from '@aws-sdk/lib-dynamodb';
import DynamoDbLocal from 'dynamodb-local';

import { paginate } from './'


let child: any;

const port = 8000;

const n = 15;

const NUMBER_OF_ITENS_TO_POPULATE_TABLE = 100;

jest.setTimeout(30000);

let dynamoDBClient: DynamoDBClient

const tableName = 'DynamoDBCursorBasedPagination'
const hashKey = 'pk';
const hashKeyValue = 'DynamoDBCursorBasedPagination';
const rangeKey = 'sk';

beforeAll(async () => {
  child = await DynamoDbLocal.launch(port, null, [], false, true);


  /**
   * Preparando os clients
   */
   dynamoDBClient = new DynamoDBClient({
    endpoint: `http://127.0.0.1:${port}`,
    region: 'local-env',
    tls: false,
    credentials: {
      accessKeyId: 'fakeMyKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });

  const documentClient = DynamoDBDocument.from(dynamoDBClient,
    {
      marshallOptions: {
        convertEmptyValues: true,
        convertClassInstanceToMap: true,
      },
    }
  );


  const items = [...new Array(NUMBER_OF_ITENS_TO_POPULATE_TABLE)].map((_, index) => {
    const newIndex = index + 1000;
    const rangeKeyValue = `cursor-${newIndex}`;

    return {
      [hashKey]: hashKeyValue,
      [rangeKey]: rangeKeyValue,
      index: newIndex,
      parity: newIndex & 1 ? 'ODD' : 'EVEN',
    };

  });
  
  await Promise.all(items.map(item => {
    return documentClient.send(
      new PutCommand({
        TableName: tableName,
        Item: item
      })
    );
 }));

 documentClient.destroy()
});

afterAll(() => {
  DynamoDbLocal.stopChild(child);
  dynamoDBClient?.destroy()
});



/**
 * Wrap paginate and return only cursor (range key) values.
 */
const testPaginate = async (
  params: Partial<Parameters<typeof paginate>[0]>
) => {
  const { edges, pageInfo } = await paginate({
    dynamoDBClient,
    tableName,
  hashKey,
  hashKeyValue,
  rangeKey,

    ...params,
  });

  return { edges: edges.map(({ cursor }) => cursor), pageInfo };
};


it('throw error if first is negative', () => {
  return expect(testPaginate({ first: -1 })).rejects.toThrow();
});

it('throw error if last is negative', () => {
  return expect(testPaginate({ last: -1 })).rejects.toThrow();
});

it('default args', async () => {
  const response = await testPaginate({});
  expect(response.edges.length).toEqual(NUMBER_OF_ITENS_TO_POPULATE_TABLE);
  expect(response.pageInfo).toEqual({
    hasPreviousPage: false,
    hasNextPage: false,
    startCursor: `cursor-${1000 + NUMBER_OF_ITENS_TO_POPULATE_TABLE - 1}`,
    endCursor: `cursor-${1000}`,
  });
});

it('return no items because after-cursor is after last item', () => {
  return expect(
    testPaginate({ after: `cursor-${1000 + NUMBER_OF_ITENS_TO_POPULATE_TABLE}`, sort: 'ASC' })
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
      sort : 'ASC',
      first: 3,
    })
  ).resolves.toEqual({
    edges: ['cursor-1000', 'cursor-1001', 'cursor-1002'],
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: true,
      startCursor: 'cursor-1000',
      endCursor: 'cursor-1002',
    },
  });
});

it('return items after after-cursor', () => {
  return expect(
    testPaginate({
      sort: 'ASC',
      after: 'cursor-1095',
    })
  ).resolves.toEqual({
    edges: ['cursor-1096', 'cursor-1097', 'cursor-1098', 'cursor-1099'],
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: false,
      startCursor: 'cursor-1096',
      endCursor: 'cursor-1099',
    },
  });
});

it('return first 3 items after after-cursor', () => {
  return expect(
    testPaginate({
      sort: 'ASC',
      after: 'cursor-1020',
      first: 3,
    })
  ).resolves.toEqual({
    edges: ['cursor-1021', 'cursor-1022', 'cursor-1023'],
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: 'cursor-1021',
      endCursor: 'cursor-1023',
    },
  });
});


it('hasNextPage=false because first is greater than the remaining items', () => {
  return expect(
    testPaginate({
      sort: 'ASC',
      after: 'cursor-1097',
      first: 10,
    })
  ).resolves.toEqual({
    edges: ['cursor-1098', 'cursor-1099'],
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: false,
      startCursor: 'cursor-1098',
      endCursor: 'cursor-1099',
    },
  });
});

it('when beginsWith=cursor-2, after=5 and first=6, return hasNextPage=false because items were filtered', () => {
  return expect(
    testPaginate({
      sort: 'ASC',
      beginsWith: 'cursor-100',
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

it('return no items because before-cursor is before first item', () => {
  return expect(
    testPaginate({ before: 'cursor-999', sort: 'DESC' })
  ).resolves.toEqual({
    edges: [],
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false,
    },
  });
});

it('return first 3 items (after-cursor undefined)', () => {
  return expect(
    testPaginate({
      sort: 'DESC',
      first: 3,
    })
  ).resolves.toEqual({
    edges: ['cursor-1099', 'cursor-1098', 'cursor-1097'],
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: true,
      startCursor: 'cursor-1099',
      endCursor: 'cursor-1097',
    },
  });
});

it('return items after after-cursor', () => {
  return expect(
    testPaginate({
      sort: 'DESC',
      after: 'cursor-1005',
    })
  ).resolves.toEqual({
    edges: [
      'cursor-1004',
      'cursor-1003',
      'cursor-1002',
      'cursor-1001',
      'cursor-1000',
    ],
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: false,
      startCursor: 'cursor-1004',
      endCursor: 'cursor-1000',
    },
  });
});

it('return first 3 items after after-cursor', () => {
  return expect(
    testPaginate({
      sort: 'DESC',
      after: 'cursor-1014',
      first: 3,
    })
  ).resolves.toEqual({
    edges: ['cursor-1013', 'cursor-1012', 'cursor-1011'],
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: 'cursor-1013',
      endCursor: 'cursor-1011',
    },
  });
});

it('when beginsWith=cursor-2, after=5 and first=6, return hasNextPage=false because items were filtered', () => {
  return expect(
    testPaginate({
      sort: 'DESC',
      beginsWith: 'cursor-100',
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

it('return no items because before-cursor is before first item', () => {
  return expect(
    testPaginate({ before: 'cursor-1100', sort: 'DESC' })
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
      sort: 'DESC',
      last: 3,
    })
  ).resolves.toEqual({
    edges: ['cursor-1002', 'cursor-1001', 'cursor-1000'],
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: false,
      startCursor: 'cursor-1002',
      endCursor: 'cursor-1000',
    },
  });
});

it('return items before before-cursor', () => {
  return expect(
    testPaginate({
      sort: 'DESC',
      before: 'cursor-1096',
    })
  ).resolves.toEqual({
    edges: ['cursor-1099', 'cursor-1098', 'cursor-1097'],
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: true,
      startCursor: 'cursor-1099',
      endCursor: 'cursor-1097',
    },
  });
});


it('return last 3 items before before-cursor', () => {
  return expect(
    testPaginate({
      sort: 'DESC',
      before: 'cursor-1030',
      last: 3,
    })
  ).resolves.toEqual({
    edges: ['cursor-1033', 'cursor-1032', 'cursor-1031'],
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: 'cursor-1033',
      endCursor: 'cursor-1031',
    },
  });
});

it('when beginsWith=cursor-2, before=5 and last=6, return hasPreviousPage=false because items was filtered', () => {
  return expect(
    testPaginate({
      sort: 'DESC',
      beginsWith: 'cursor-100',
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

it('return only hashKey', async () => {
  const response = await paginate({
    dynamoDBClient,
    tableName,
    hashKey,
    hashKeyValue,
    rangeKey,
    first: 1,
    projectionExpression: hashKey,
  });
  expect(Object.keys(response.edges[0].node)).toEqual([hashKey]);
});

it('return only hashKey and rangeKey', async () => {
  const response = await paginate({
    dynamoDBClient,
    tableName,
    hashKey,
    hashKeyValue,
    rangeKey,
    first: 1,
    projectionExpression: [hashKey, rangeKey].join(','),
  });
  expect(Object.keys(response.edges[0].node).sort()).toEqual(
    [hashKey, rangeKey].sort()
  );
});

it('return only items whose cursor > 1050', async () => {
  const { pageInfo } = await paginate({
    dynamoDBClient,
    tableName,
    hashKey,
    hashKeyValue,
    rangeKey,
    filterExpression: '#index > :index',
    filterAttributeNames: {
      '#index': 'index',
    },
    filterAttributeValues: {
      ':index': 1050,
    },
  });
  expect(pageInfo).toEqual(
    expect.objectContaining({
      startCursor: 'cursor-1099',
      endCursor: 'cursor-1051',
    })
  );
});

test('return only even cursors', async () => {
  const { edges } = await paginate({
    dynamoDBClient,
    tableName,
    hashKey,
    hashKeyValue,
    rangeKey,
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