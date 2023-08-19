import { program } from "commander";
import { Decimal } from "decimal.js";
import figlet from "figlet";
import { config } from "dotenv";
import { Logger } from "./utils/logger";
import { MongoDatabaseHandler, TransactionHandler } from "./handlers";

config();

const logger = new Logger();
const dbHandler = new MongoDatabaseHandler(
  process.env.MONGO_URL || "mongodb://localhost:27017",
  logger
);
const transactionHandler = new TransactionHandler(dbHandler, logger);

program
  .version("1.0.0")
  .description("A CLI to perform banking transactions")
  .option("--no-logs", "Disable logs");

program
  .command("credit <accountId> <amount>")
  .action(async (accountId, amount) => {
    await transactionHandler.credit(accountId, new Decimal(amount));
  });

program
  .command("debit <accountId> <amount>")
  .action(async (accountId, amount) => {
    await transactionHandler.debit(accountId, new Decimal(amount));
  });

program.command("balance <accountId>").action(async (accountId) => {
  await transactionHandler.getBalance(accountId);
});

program.parse(process.argv);

if (!program.opts().logs) {
  logger.setLogging(false);
}

logger.log(figlet.textSync("Leo's Bank"));
