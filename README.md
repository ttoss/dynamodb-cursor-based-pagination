# DynamoDB Cursor-Based Pagination

## Introduction

### DynamoDB

From Amazon DynamoDB [page](https://aws.amazon.com/dynamodb):

> Amazon DynamoDB is a key-value and document database that delivers single-digit millisecond performance at any scale. It's a fully managed, multiregion, multimaster, durable database with built-in security, backup and restore, and in-memory caching for internet-scale applications. DynamoDB can handle more than 10 trillion requests per day and can support peaks of more than 20 million requests per second.

To achieve this hyper performance and scalability , it lacks common RDBMS and some NoSQL databases features. For that reason, DynamoDB provides only features that are scalable and its query is one of them.

[Querying on DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html) is not powerful compared to other databases. It must satisfy some requirements:

1. The table or the secondary index must have a [composite primary key](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey) (a partition/hash key and a sort/range key).
2. The partition key must be defined and the sort key is not required. If defined, it's used to [sort the items](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html#Query.KeyConditionExpressions).

For instance, you cannot query items whose hash key is different. Because of that you have to [design your table and indexes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html) to support all queries you need to perform.

### Cursor-Based Pagination

If you're familiarized with GraphQL, you may have seen from [its documentation](https://graphql.org/learn/pagination/) that cursor-based pagination is more powerful than others pagination designs. Also, if we do some search, we can find comparisons among pagination designs ([here](https://medium.com/swlh/how-to-implement-cursor-pagination-like-a-pro-513140b65f32)) and cursor-based pagination is the winner.

Considering the advantages of cursor-based pagination, this package proposes a design to allow us perform cursor-based pagination in a DBB table.

## Table Design

There aren't much requirements to achieve to be able to perform cursor-based pagination. In resume, we need:

1. A table or a secondary index with a [composite primary key](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey).
1. Items must be saved in such way that the range key ordination must represent the ordination of the pagination.

Why do we need the second requirement? First we need to understand what cursor is. Cursor is like an edge identifier, with cursor we must be able to retrieve and locate that edge on your backend. In a DBB table with composite primary key, the sort key is a good choice to be our cursor.

Let's check [some examples](examples/README.md) to understand better these requirements and the design.

## Installation

NPM:

```
npm install -S dynamodb-cursor-based-pagination
```

Yarn:

```
yarn add dynamodb-cursor-based-pagination
```

You also need install `aws-sdk` in your project because it is a peer dependency of this project.

## Test

```
yarn run test
```

## License

[MIT](./LICENSE)
