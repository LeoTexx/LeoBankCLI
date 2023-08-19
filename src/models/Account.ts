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
  async credit(amount: Decimal, session?: Session): Promise<void> {
    await this.db.insert(
      this.accountId,
      amount,
      TransactionOperation.CREDIT,
      session
    );
  }

  async debit(amount: Decimal, session?: Session): Promise<void> {
    const currentBalance = await this.getBalance(session);

    if (currentBalance.minus(amount).isNegative()) {
      throw new Error("Insufficient funds!");
    }

    await this.db.insert(
      this.accountId,
      amount,
      TransactionOperation.DEBIT,
      session
    );
  }

  async getBalance(session?: Session): Promise<Decimal> {
    return await this.db.getAggregateBalance(this.accountId, session);
  }
}
