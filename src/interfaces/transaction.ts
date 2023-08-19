import { Decimal } from "decimal.js";
import { TransactionOperation } from "../utils/consts";

export interface Transaction {
  accountId: string;
  amount: Decimal;
  operation: TransactionOperation;
}

export interface TransactionAggregationResult {
  _id: TransactionOperation;
  totalAmount: number;
}
