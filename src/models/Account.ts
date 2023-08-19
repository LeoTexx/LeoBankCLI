import { Decimal } from "decimal.js";
import { Database, Session } from "../interfaces";
import { TransactionOperation } from "../utils";

export class Account {
  private accountId: string;
  private db: Database;

  constructor(accountId: string, db: Database) {
    this.accountId = accountId;
    this.db = db;
  }

  /**
   * Credits the account with a specified amount.
   *
   * @param amount - The amount to credit.
   * @param session - The database session (optional).
   */
  async credit(amount: Decimal, session?: Session): Promise<void> {
    try {
      await this.db.insert(
        this.accountId,
        amount,
        TransactionOperation.CREDIT,
        session
      );
    } catch (error: any) {
      // Handle or re-throw the error as needed
      throw new Error(`Failed to credit account: ${error.message}`);
    }
  }

  /**
   * Debits the account with a specified amount.
   *
   * @param amount - The amount to debit.
   * @param session - The database session (optional).
   * @throws {Error} If the account has insufficient funds.
   */
  async debit(amount: Decimal, session?: Session): Promise<void> {
    const currentBalance = await this.getBalance(session);

    if (currentBalance.minus(amount).isNegative()) {
      throw new Error("Insufficient funds!");
    }

    try {
      await this.db.insert(
        this.accountId,
        amount,
        TransactionOperation.DEBIT,
        session
      );
    } catch (error: any) {
      throw new Error(`Failed to debit account: ${error.message}`);
    }
  }

  /**
   * Retrieves the current balance of the account.
   *
   * @param session - The database session (optional).
   * @returns The current balance as a Decimal.
   */
  async getBalance(session?: Session): Promise<Decimal> {
    try {
      return await this.db.getAggregateBalance(this.accountId, session);
    } catch (error: any) {
      // Handle or re-throw the error as needed
      throw new Error(`Failed to retrieve balance: ${error.message}`);
    }
  }
}
