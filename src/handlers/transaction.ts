import { Decimal } from "decimal.js";
import { DatabaseHandler } from "./database";
import { Logger } from "../utils/logger";
import { Account } from "../models";

export class TransactionHandler {
  private dbHandler: DatabaseHandler;
  private logger: Logger;

  constructor(dbHandler: DatabaseHandler, logger: Logger) {
    this.dbHandler = dbHandler;
    this.logger = logger;
  }

  private async execute(
    type: "credit" | "debit",
    accountId: string,
    amount: Decimal
  ) {
    await this.dbHandler.connect();
    this.dbHandler.startSession();

    const actionLog = type === "credit" ? "crediting" : "debiting";

    this.logger.log(
      `Attempting to ${actionLog} account with ID ${accountId}...`
    );
    const account = new Account(accountId, await this.dbHandler.connect());

    try {
      if (type === "credit") {
        await account.credit(amount, this.dbHandler.getSession());
      } else {
        await account.debit(amount, this.dbHandler.getSession());
      }

      await this.dbHandler.commitSession();

      this.logger.log(
        `Account ${accountId} ${type}ed with amount: ${amount}.`,
        true
      );
    } catch (error: any) {
      await this.dbHandler.abortSession();
      this.logger.error(`Error while ${actionLog}: ${error.message}`);
      throw error;
    } finally {
      this.dbHandler.endSession();
      await this.dbHandler.close();
    }
  }

  public async credit(accountId: string, amount: Decimal) {
    return this.execute("credit", accountId, amount);
  }

  public async debit(accountId: string, amount: Decimal) {
    return this.execute("debit", accountId, amount);
  }

  public async getBalance(accountId: string): Promise<Decimal> {
    const dbInstance = await this.dbHandler.connect();
    const session = this.dbHandler.getSession();

    this.logger.log(`Fetching balance for account with ID ${accountId}...`);

    const account = new Account(accountId, dbInstance);
    let balance: Decimal;

    try {
      balance = await account.getBalance(session);
      this.logger.log(
        `Balance for account ${accountId}: ${balance.toString()}.`,
        true
      );
    } catch (error: any) {
      this.logger.error(`Error fetching balance: ${error.message}`);
      throw error;
    } finally {
      await this.dbHandler.close();
    }

    return balance;
  }
}
