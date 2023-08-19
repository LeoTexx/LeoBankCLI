import { exec } from "child_process";
import crypto from "crypto";

const TIMES = 5;

function generateAccountId(): string {
  const randomData = crypto.randomBytes(8).toString("hex");
  return "test" + crypto.createHash("sha256").update(randomData).digest("hex");
}

function execShellCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.error(stderr);
      }
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

const accountId = generateAccountId();
let credits: number = 0;
let debits: number = 0;

async function main() {
  try {
    await Promise.all([
      (async function () {
        for (let i = 0; i < TIMES; i++) {
          const amount = Math.floor(Math.random() * 100).toString();
          credits += Number(amount);
          await execShellCommand(`npm run credit ${accountId} ${amount}`);
        }
      })(),
      (async function () {
        for (let i = 0; i < TIMES; i++) {
          const amount = Math.floor(Math.random() * 50).toString();
          try {
            await execShellCommand(`npm run debit ${accountId} ${amount}`);
            debits += Number(amount);
          } catch (error: any) {
            /* 
           If the debit operation throws an error (e.g., due to insufficient funds), 
           we catch it here and continue without adding to the debits total. 
           */
            console.error(
              `Failed to debit ${amount} due to: ${error.message || error}`
            );
          }
        }
      })(),
    ]);

    const balanceResponse = await execShellCommand(
      `npm run balance ${accountId}`
    );
    console.log("Raw balance response:", balanceResponse);

    const balanceMatch = balanceResponse.match(
      /Balance for account [\s\S]*?: (\d+)\./
    );
    const balance: number = balanceMatch ? parseFloat(balanceMatch[1]) : NaN;

    console.log("Account ID:", accountId);
    console.log("Credits:", credits);
    console.log("Debits:", debits);
    console.log("Expected final balance:", credits - debits);
    console.log("Actual final balance:", balance);
  } catch (error) {
    console.error("Error during stress test:", error);
  }
}

main();
