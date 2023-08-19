import { Decimal } from "decimal.js";
import { Session } from "./";

export interface Database {
  insert(
    accountId: string,
    amount: Decimal,
    operation: string,
    session?: Session
  ): Promise<void>;
  getAggregateBalance(accountId: string, session?: Session): Promise<Decimal>;
}
