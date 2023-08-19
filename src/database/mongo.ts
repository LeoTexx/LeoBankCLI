import { ClientSession, Db, MongoClient, MongoClientOptions } from "mongodb";
import { Decimal } from "decimal.js";
import { Database, Session, TransactionAggregationResult } from "../interfaces";
import {
  TransactionOperation,
  DATABASE_NAME,
  TRANSACTION_COLLECTION,
} from "../utils";

export class MongoDatabase implements Database {
  private db: Db | undefined;

  constructor(
    private client?: MongoClient,
    private connectionFactory?: () => Promise<MongoClient>,
    private connectionString?: string
  ) {}

  private async connectDB(): Promise<Db> {
    if (this.db) return this.db;

    if (this.client) {
      this.db = this.client.db(DATABASE_NAME);
    } else if (this.connectionFactory) {
      this.client = await this.connectionFactory();
      this.db = this.client.db(DATABASE_NAME);
    } else if (this.connectionString) {
      const options: MongoClientOptions = {
        maxPoolSize: 10,
        minPoolSize: 2,
      };
      this.client = new MongoClient(this.connectionString, options);
      await this.client.connect();
      this.db = this.client.db(DATABASE_NAME);
    } else {
      throw new Error(
        "No valid MongoClient, connectionString, or connectionFactory provided"
      );
    }

    return this.db;
  }

  async insert(
    accountId: string,
    amount: Decimal,
    operation: TransactionOperation,
    session: Session
  ): Promise<void> {
    const db = await this.connectDB();

    if (!session || !(session instanceof MongoSession)) {
      throw new Error("Valid MongoSession required for database operations.");
    }

    await db.collection(TRANSACTION_COLLECTION).insertOne(
      {
        accountId,
        amount: amount.toNumber(),
        operation,
      },
      { session: session.clientSession }
    );
  }

  async getAggregateBalance(
    accountId: string,
    session: Session
  ): Promise<Decimal> {
    if (!session || !(session instanceof MongoSession)) {
      throw new Error("Valid MongoSession required for database operations.");
    }

    const transactionSums = await this.fetchTransactionSums(accountId, session);
    return this.calculateBalance(transactionSums);
  }

  private async fetchTransactionSums(
    accountId: string,
    session?: Session
  ): Promise<TransactionAggregationResult[]> {
    const db = await this.connectDB();
    let mongoSession;

    if (session instanceof MongoSession) {
      mongoSession = session.clientSession;
    }

    const result = await db
      .collection(TRANSACTION_COLLECTION)
      .aggregate(
        [
          { $match: { accountId } },
          {
            $group: {
              _id: "$operation",
              totalAmount: { $sum: "$amount" },
            },
          },
        ],
        { session: mongoSession }
      )
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

export class MongoSession implements Session {
  private session: ClientSession;

  constructor(client: MongoClient) {
    this.session = client.startSession();
  }

  start(): void {
    this.session.startTransaction();
  }

  async commit(): Promise<void> {
    await this.session.commitTransaction();
  }

  async abort(): Promise<void> {
    await this.session.abortTransaction();
  }

  end(): void {
    this.session.endSession();
  }

  public get clientSession(): ClientSession {
    return this.session;
  }
}
