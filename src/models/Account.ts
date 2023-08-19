import { Decimal } from "decimal.js";
import { Database } from "../interfaces";
import { TransactionOperation } from "../utils";

export class Account {
  private accountId: string;
  private db: Database;

  constructor(accountId: string, db: Database) {
    this.accountId = accountId;
    this.db = db;
  }

  async credit(amount: Decimal): Promise<void> {
    await this.db.insert(this.accountId, amount, TransactionOperation.CREDIT);
  }

  async debit(amount: Decimal): Promise<void> {
    const currentBalance = await this.getBalance();

    if (currentBalance.minus(amount).isNegative()) {
      throw new Error("Insufficient funds!");
    }

    await this.db.insert(this.accountId, amount, TransactionOperation.DEBIT);
  }

  async getBalance(): Promise<Decimal> {
    return await this.db.getAggregateBalance(this.accountId);
  }
}
