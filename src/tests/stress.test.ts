import { exec } from "child_process";
import crypto from "crypto";
import { Logger } from "../utils/logger";

const TIMES = 500;
const MAX_CONCURRENT_OPERATIONS = 50;

class AccountManager {
  accountId: string;
  credits: number = 0;
  debits: number = 0;
  operations: Promise<void>[] = [];
  logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.accountId = this.generateAccountId();
  }

  private generateAccountId(): string {
    const randomData = crypto.randomBytes(8).toString("hex");
    return (
      "test" + crypto.createHash("sha256").update(randomData).digest("hex")
    );
  }

  private execShellCommand(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (stdout) this.logger.log(stdout);
        if (stderr) this.logger.error(stderr);
        if (error) reject(error);
        else resolve(stdout);
      });
    });
  }

  async run() {
    try {
      for (let i = 0; i < TIMES; i++) {
        const randomOperation = Math.random() < 0.5 ? "credit" : "debit";
        const amount = Math.floor(Math.random() * 100).toString();

        const operationPromise = this.executeOperation(randomOperation, amount);
        this.operations.push(operationPromise);

        // Limit concurrent operations to avoid overwhelming the system
        if (this.operations.length >= MAX_CONCURRENT_OPERATIONS) {
          await Promise.all(this.operations);
          this.operations = [];
        }
      }

      await Promise.all(this.operations);

      const balance = await this.fetchBalance();
      this.printResults(balance);
    } catch (error: any) {
      this.logger.error("Error during stress test:", error);
    }
  }

  async executeOperation(operation: string, amount: string): Promise<void> {
    const cmd = `npm run ${operation} ${this.accountId} ${amount} -- --no-logs`;

    try {
      const output = await this.execShellCommand(cmd);
      this.logger.log(output);

      if (operation === "credit") this.credits += Number(amount);
      else this.debits += Number(amount);
    } catch (error: any) {
      this.logger.error(
        `Failed to ${operation} ${amount} due to: ${error.message || error}`
      );
    }
  }

  async fetchBalance(): Promise<number> {
    const balanceResponse = await this.execShellCommand(
      `npm run balance ${this.accountId} -- --no-logs`
    );

    const balanceMatch = balanceResponse.match(
      /Balance for account [\s\S]*?: (\d+)\./
    );
    return balanceMatch ? parseFloat(balanceMatch[1]) : NaN;
  }

  printResults(balance: number) {
    this.logger.log(`Credits: ${this.credits}`);
    this.logger.log(`Debits: ${this.debits}`);
    this.logger.log(`Expected final balance: ${this.credits - this.debits}`);
    this.logger.log(`Actual final balance: ${balance}`);
  }
}

async function main() {
  const logger = new Logger();
  logger.setLogging(true);
  const accountManager = new AccountManager(logger);
  await accountManager.run();
}

main();
