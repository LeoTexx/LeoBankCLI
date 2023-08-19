import { program } from "commander";
import { Decimal } from "decimal.js";
import figlet from "figlet";
import { MongoClient, ClientSession } from "mongodb";
import { config } from "dotenv";
import { Account } from "./models/Account";
import { MongoDatabase, MongoSession } from "./database/mongo";
import { Logger } from "./utils/logger";

config();

const client = new MongoClient(
  process.env.MONGO_URL || "mongodb://localhost:27017"
);
const logger = new Logger();

let session: ClientSession;

program
  .version("1.0.0")
  .description("A CLI to perform banking transactions")
  .option("--no-logs", "Disable logs")
  .option("--test", "Test option");

program
  .command("credit <accountId> <amount>")
  .action(async (accountId, amount) => {
    const dbInstance = await initializeDatabase();
    const session = new MongoSession(client);
    logger.log(`Attempting to credit account with ID ${accountId}...`);
    const account = new Account(accountId, dbInstance);
    await account.credit(new Decimal(amount), session);
    logger.log(`Account ${accountId} credited with amount: ${amount}.`, true);

    await closeDatabaseConnection();
  });

program
  .command("debit <accountId> <amount>")
  .action(async (accountId, amount) => {
    const dbInstance = await initializeDatabase();
    const session = new MongoSession(client);
    logger.log(`Attempting to debit account with ID ${accountId}...`);
    const account = new Account(accountId, dbInstance);
    try {
      await account.debit(new Decimal(amount), session);
      logger.log(`Account ${accountId} debited with amount: ${amount}.`, true);
    } catch (error: any) {
      logger.error(`Error while debiting: ${error.message}`);
      throw error;
    }

    await closeDatabaseConnection();
  });

program.command("balance <accountId>").action(async (accountId) => {
  const dbInstance = await initializeDatabase();
  const session = new MongoSession(client);
  logger.log(`Fetching balance for account with ID ${accountId}...`);
  const account = new Account(accountId, dbInstance);
  const balance = await account.getBalance(session);
  logger.log(`Balance for account ${accountId}: ${balance.toString()}.`, true);

  await closeDatabaseConnection();
});

program.parse(process.argv);

if (!program.opts().logs) {
  logger.setLogging(false);
}

logger.log(figlet.textSync("Leo's Bank"));
//Helper functions

async function initializeDatabase() {
  try {
    await client.connect();
    session = client.startSession();
    logger.log("Connected to MongoDB successfully.");
  } catch (error: any) {
    logger.error("Error connecting to MongoDB: " + error.message);
    process.exit(1);
  }

  return new MongoDatabase(client);
}

async function closeDatabaseConnection() {
  logger.log("Closing the MongoDB client connection...");
  session.endSession();
  try {
    await client.close();
    logger.log("Connection closed successfully.");
  } catch (error: any) {
    logger.error("Error closing the MongoDB connection: " + error.message);
  }
}
