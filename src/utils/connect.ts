import { ClientSession, MongoClient } from "mongodb";
import { Logger } from "./logger";
import { MongoDatabase } from "../database/mongo";

interface Params {
  client: MongoClient;
  session: ClientSession;
  logger: Logger;
}

export async function initializeDatabase({ client, session, logger }: Params) {
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
