import { Session } from "../../interfaces";
import { Logger } from "../../utils/logger";

export abstract class DatabaseHandler {
  protected logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  abstract connect(): Promise<any>;
  abstract getSession(): Session;
  abstract startSession(): void;
  abstract commitSession(): Promise<void>;
  abstract abortSession(): Promise<void>;
  abstract endSession(): void;
  abstract close(): Promise<void>;
}
