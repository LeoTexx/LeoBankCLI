# Leo's Bank CLI Application

Effortlessly manage your banking transactions with Leo's Bank Command-Line Interface (CLI) application.

## Table of Contents

- [Leo's Bank CLI Application](#leos-bank-cli-application)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Architectural Decisions](#architectural-decisions)
    - [Modular and Extensible Design](#modular-and-extensible-design)
    - [Embracing MongoDB Transactions](#embracing-mongodb-transactions)
    - [Why We Use The Handlers Layer](#why-we-use-the-handlers-layer)
    - [Stress Testing](#stress-testing)
  - [Setup and Usage](#setup-and-usage)
  - [Scripts](#scripts)
    - [Command Flag: --no-logs](#command-flag---no-logs)

## Features

Experience core functionalities tailored to your banking needs:

- **Credit**: Boost the balance of any account.
- **Debit**: Safely deduct funds from an account.
- **Balance Inquiry**: Retrieve real-time account balances.

## Architectural Decisions

### Modular and Extensible Design

- **Future-ready**: Our design prioritizes adaptability and scalability.
- **Interface-Driven**: Core components, like the `MongoDatabase` class, adhere to specific interfaces, ensuring a standardized approach.
- **Expandability**: Our structure allows for easy integration of additional databases by simply adhering to our `Database` interface.

### Embracing MongoDB Transactions

Our application's backbone, MongoDB transactions, ensures:

- **Atomicity**: All operations either fully execute or none do, preserving data consistency.
- **Concurrency Control**: Smooth handling of multiple simultaneous requests.
- **Isolation**: Active transactions remain concealed from other operations until completion.

### Why We Use The Handlers Layer

The handlers layer, exemplified by our `TransactionHandler`, ensures:

- **Decoupling Logic**: Separate business logic from user interactions, ensuring independence between them.
- **Consistency & Reusability**: Centralized handling promotes uniform execution across the application and easy code reuse.
- **Enhanced Maintainability**: Complex operations are isolated, making system tweaks simpler and safer.
- **Scalability**: As the system evolves, the handlers layer can integrate additional operations like caching or logging without extensive refactoring.
- **Flexibility**: Introducing new interfaces or changing underlying structures becomes straightforward with handlers acting as a consistent intermediary layer.

### Stress Testing

Verify system resilience:

- Use the [stress test utility](./src/tests/stress.test.ts) to simulate typical account operations.
- Customize test intensity with parameters like `TIMES` and `MAX_CONCURRENT_OPERATIONS`.

To run, use `npm run test:stress`.

## Setup and Usage

Get started with Leo's Bank CLI:

1. **Environment Configuration**: Rely on `dotenv` to set up. Ensure your `.env` file is populated, particularly the `MONGO_URL`.
2. **MongoDB Integration**: Use the provided docker-compose configuration. Start with `npm run setup-db`.
3. **Commands**:
   - **Credit**: `npm run credit <accountId> <amount>`
   - **Debit**: `npm run debit <accountId> <amount>`
   - **Balance Inquiry**: `npm run balance <accountId>`

## Scripts

Streamline your experience with these scripts:

- `setup-db`: Initializes a MongoDB instance via Docker.
- `build`: Translates TypeScript to JavaScript.
- `credit`: Add funds to an account.
- `debit`: Reduce an account's balance.
- `balance`: Check an account's current balance.
- `test:stress`: Analyze performance under intensive operations.

### Command Flag: --no-logs

For users who prefer to run the scripts without the usual logging, we've introduced an optional flag --no-logs. This flag will suppress the default log outputs and provide a cleaner command line experience.

To utilize this, append `-- --no-logs` at the end of your script command. For example:

`npm run credit <accountId> <amount> -- --no-logs`

This will run the credit command without displaying the typical logs.
