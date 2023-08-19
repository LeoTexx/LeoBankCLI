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

Our system's design is modular, allowing components to be easily plugged in or out:

- **Future-ready**: Anticipating growth, we've structured our application for adaptability and scalability.
- **Interface-Driven**: Core components, such as the `MongoDatabase` class, adhere to specific interfaces, guaranteeing consistent interaction and behavior across our system.
- **Expandability**: With the system's expandable architecture, adding support for new databases is seamless, given adherence to our `Database` interface.

### Embracing MongoDB Transactions

MongoDB transactions form the backbone of our application's robustness:

- **Atomicity**: Guaranteeing that all operations either fully complete or none at all, MongoDB transactions ensure data consistency.
- **Concurrency Control**: Efficiently manage multiple simultaneous requests, ensuring smooth user experience.
- **Isolation**: Until a transaction is fully completed, its actions are isolated from other operations, preventing any premature data leaks or inconsistencies.
- **Durability**: Once a transaction is completed, its effects are made permanent, ensuring that data remains consistent even after system restarts or failures.

### Why We Use The Handlers Layer

This layer, epitomized by the `TransactionHandler`, offers several benefits:

- **Decoupling Logic**: By segregating business logic from user interactions, we've established a clean separation of concerns.
- **Consistency & Reusability**: Centralizing certain functionalities allows for uniform execution and code reusability across the application.
- **Enhanced Maintainability**: Encapsulating complex operations in handlers allows for easier system tweaks and updates.
- **Scalability**: With the handler layer, introducing advanced functionalities like caching or more comprehensive logging is simplified.
- **Flexibility**: Handlers act as a buffer, allowing underlying structures or interfaces to be modified without affecting other system parts.

### Stress Testing

To ensure our system's resilience:

- Utilize the [stress test utility](./src/tests/stress.test.ts) to emulate a variety of account operations.
- Tailor the test's rigor with adjustable parameters such as `TIMES` and `MAX_CONCURRENT_OPERATIONS`.

To execute, input `npm run test:stress`.

## Setup and Usage

Kick-off your journey with Leo's Bank CLI:

1. **Environment Configuration**: We use `dotenv` for environment setup. Populate your `.env` file, paying special attention to the `MONGO_URL`.
2. **MongoDB Integration**: Rely on our pre-configured docker-compose setup. Launch with `npm run setup-db`.
3. **Commands**:
   - **Credit**: `npm run credit <accountId> <amount>`
   - **Debit**: `npm run debit <accountId> <amount>`
   - **Balance Inquiry**: `npm run balance <accountId>`

## Scripts

Boost your CLI experience with our integrated scripts:

- `setup-db`: Fire up a MongoDB instance using Docker.
- `build`: Converts TypeScript code to JavaScript.
- `credit`: Increase an account's funds.
- `debit`: Diminish an account's balance.
- `balance`: Inquire about an account's existing funds.
- `test:stress`: Evaluate the system's stability under heavy loads.

### Command Flag: --no-logs

For a cleaner interface, we offer an optional flag: --no-logs. This suppresses default logging, delivering an uncluttered command line experience.

Invoke this by adding `-- --no-logs` post your script command, e.g.:

`npm run credit <accountId> <amount> -- --no-logs`

Doing so will execute the credit command minus the standard logs.
