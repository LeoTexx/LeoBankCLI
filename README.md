# Leo's Bank CLI Application

Harness the power of Leo's Bank Command-Line Interface (CLI) application to effortlessly manage your banking transactions.

## Table of Contents

- [Leo's Bank CLI Application](#leos-bank-cli-application)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Architectural Decisions](#architectural-decisions)
    - [Modular and Extensible Design](#modular-and-extensible-design)
    - [Embracing MongoDB Transactions](#embracing-mongodb-transactions)
    - [Stress Testing](#stress-testing)
  - [Setup and Usage](#setup-and-usage)
  - [Scripts](#scripts)

## Features

Explore key functionalities tailored for your banking needs:

- **Credit**: Elevate the balance of a chosen account.
- **Debit**: Deduct funds from a selected account with assurance.
- **Balance Inquiry**: Fetch the real-time balance of any account.

## Architectural Decisions

### Modular and Extensible Design

- **Future-ready**: We've crafted the application considering adaptability and scalability.
- **Interface-Driven**: Vital components, including databases, are interface-based. The `MongoDatabase` class, for example, is derived from the `Database` interface.
- **Expandability**: Our modular design facilitates easy integration of other databases. Simply develop based on the `Database` interface.

### Embracing MongoDB Transactions

MongoDB transactions underpin our commitment to reliability:

- **Atomicity**: Ensure all operations fully execute or none at all, eliminating inconsistencies.
- **Concurrency Control**: Manage multiple simultaneous requests seamlessly to guarantee data consistency.
- **Isolation**: Transactions veil ongoing processes from other operations until completion.

### Stress Testing

Ensuring robustness under load:

- Utilize our [stress test utility](./src/tests/stress.test.ts) to:
  - Create a simulated account.
  - Perform random credit and debit tasks repeatedly.
  - Confirm the end balance against the expected result.
- Tailor the test intensity:

```javascript
const TIMES = 500;
const MAX_CONCURRENT_OPERATIONS = 50;
```

To initiate, run `npm run test:stress`.

## Setup and Usage

Jumpstart with Leo's Bank CLI:

1. **Environment Configuration**: Our platform relies on `dotenv`. Populate your `.env` file, emphasizing the `MONGO_URL` for MongoDB connectivity.
2. **MongoDB Integration**: Utilize the inclusive docker-compose configuration for MongoDB. Begin with `npm run setup-db`.
3. **Command Execution**:
   - **Credit**: `npm run credit <accountId> <amount>`
   - **Debit**: `npm run debit <accountId> <amount>`
   - **Balance Inquiry**: `npm run balance <accountId>`

## Scripts

Handy scripts to enhance your experience:

- `setup-db`: Launch a MongoDB instance via Docker.
- `build`: Convert TypeScript to JavaScript.
- `credit`: Increase account balance.
- `debit`: Deduct from an account.
- `balance`: View an account's funds.
- `test:stress`: Evaluate system performance under load.
