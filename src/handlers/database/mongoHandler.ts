import { MongoClient, ClientSession } from "mongodb";
import { MongoDatabase, MongoSession } from "../../database/mongo";
import { DatabaseHandler } from "./";
import { Logger } from "../../utils/logger";

export class MongoDatabaseHandler extends DatabaseHandler {
  private client: MongoClient;
  private session!: ClientSession;

  constructor(mongoUrl: string, logger: Logger) {
    super(logger);
    this.client = new MongoClient(mongoUrl);
  }

  async connect(): Promise<MongoDatabase> {
    try {
      await this.client.connect();
      this.session = this.client.startSession();
      this.logger.log("Connected to MongoDB successfully.");
    } catch (error: any) {
      this.logger.error("Error connecting to MongoDB: " + error.message);
      process.exit(1);
    }
    return new MongoDatabase(this.client);
  }

  getSession(): MongoSession {
    return new MongoSession(this.client);
  }

  startSession(): void {
    this.session = this.client.startSession();
  }

  async commitSession(): Promise<void> {
    if (this.session) {
      await this.session.commitTransaction();
    }
  }

  async abortSession(): Promise<void> {
    if (this.session) {
      await this.session.abortTransaction();
    }
  }

  endSession(): void {
    if (this.session) {
      this.session.endSession();
    }
  }

  async close(): Promise<void> {
    this.logger.log("Closing the MongoDB client connection...");
    this.session.endSession();
    try {
      await this.client.close();
      this.logger.log("Connection closed successfully.");
    } catch (error: any) {
      this.logger.error(
        "Error closing the MongoDB connection: " + error.message
      );
    }
  }
}
