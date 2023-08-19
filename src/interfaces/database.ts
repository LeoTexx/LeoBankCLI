import { Decimal } from "decimal.js";

export interface Database {
  insert(accountId: string, amount: Decimal, operation: string): Promise<void>;
  getAggregateBalance(accountId: string): Promise<Decimal>;
}
