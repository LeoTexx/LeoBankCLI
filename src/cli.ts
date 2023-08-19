import { program } from "commander";
import { Decimal } from "decimal.js";
import { MongoClient, MongoError } from "mongodb";
import { Account } from "./models/Account";
import { MongoDatabase } from "./database/mongo";

const client = new MongoClient("mongodb://admin:admin@localhost:27017");

async function initializeDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully.");
  } catch (error: any) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // exit with a non-zero code to indicate an error
  }

  return new MongoDatabase(client);
}

program
  .command("credit <accountId> <amount>")
  .action(async (accountId, amount) => {
    const dbInstance = await initializeDatabase();
    console.log(`Attempting to credit account with ID ${accountId}...`);
    const account = new Account(accountId, dbInstance);
    await account.credit(new Decimal(amount));
    console.log(`Account ${accountId} credited with amount: ${amount}.`);

    await closeDatabaseConnection();
  });

program
  .command("debit <accountId> <amount>")
  .action(async (accountId, amount) => {
    const dbInstance = await initializeDatabase();
    console.log(`Attempting to debit account with ID ${accountId}...`);
    const account = new Account(accountId, dbInstance);
    try {
      await account.debit(new Decimal(amount));
      console.log(`Account ${accountId} debited with amount: ${amount}.`);
    } catch (error: any) {
      console.error(`Error while debiting: ${error.message}`);
    }

    await closeDatabaseConnection();
  });

program.command("balance <accountId>").action(async (accountId) => {
  const dbInstance = await initializeDatabase();
  console.log(`Fetching balance for account with ID ${accountId}...`);
  const account = new Account(accountId, dbInstance);
  const balance = await account.getBalance();
  console.log(`Balance for account ${accountId}: ${balance.toString()}.`);

  await closeDatabaseConnection();
});

async function closeDatabaseConnection() {
  console.log("Closing the MongoDB client connection...");
  try {
    await client.close();
    console.log("Connection closed successfully.");
  } catch (error: any) {
    console.error("Error closing the MongoDB connection:", error.message);
  }
}

program.parse(process.argv);
