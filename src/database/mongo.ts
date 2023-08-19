import { Db, MongoClient, MongoClientOptions } from "mongodb";
import { Decimal } from "decimal.js";
import { Database, TransactionAggregationResult } from "../interfaces";
import { TransactionOperation } from "../utils";

export class MongoDatabase implements Database {
  private db: Db | undefined;

  constructor(
    private client?: MongoClient,
    private connectionFactory?: () => Promise<MongoClient>,
    private connectionString?: string
  ) {}

  private async connectDB(): Promise<Db> {
    if (!this.db) {
      if (this.client) {
        this.db = this.client.db("bookkeeping");
      } else if (this.connectionFactory) {
        this.client = await this.connectionFactory();
        this.db = this.client.db("bookkeeping");
      } else if (this.connectionString) {
        // Ensure connection pooling
        const options: MongoClientOptions = {
          maxPoolSize: 10,
          minPoolSize: 2,
        };
        this.client = new MongoClient(this.connectionString, options);
        await this.client.connect();
        this.db = this.client.db("bookkeeping");
      } else {
        throw new Error(
          "No valid MongoClient, connectionString, or connectionFactory provided"
        );
      }
    }
    return this.db;
  }

  async insert(
    accountId: string,
    amount: Decimal,
    operation: TransactionOperation
  ): Promise<void> {
    const db = await this.connectDB();
    await db.collection("transactions").insertOne({
      accountId,
      amount: amount.toNumber(),
      operation,
    });
  }

  async getAggregateBalance(accountId: string): Promise<Decimal> {
    const transactionSums = await this.fetchTransactionSums(accountId);
    return this.calculateBalance(transactionSums);
  }

  private async fetchTransactionSums(
    accountId: string
  ): Promise<TransactionAggregationResult[]> {
    const db = await this.connectDB();
    const result = await db
      .collection("transactions")
      .aggregate([
        { $match: { accountId } },
        {
          $group: {
            _id: "$operation",
            totalAmount: { $sum: "$amount" },
          },
        },
      ])
      .toArray();

    return result as TransactionAggregationResult[];
  }

  private calculateBalance(
    transactionSums: TransactionAggregationResult[]
  ): Decimal {
    let credits = new Decimal(0);
    let debits = new Decimal(0);
    transactionSums.forEach((item) => {
      if (item._id === TransactionOperation.CREDIT)
        credits = new Decimal(item.totalAmount);
      else debits = new Decimal(item.totalAmount);
    });

    return credits.minus(debits);
  }
}
