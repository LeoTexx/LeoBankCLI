export class Logger {
  private logsEnabled: boolean;

  constructor(logsEnabled: boolean = true) {
    this.logsEnabled = logsEnabled;
  }

  setLogging(enabled: boolean): void {
    this.logsEnabled = enabled;
  }

  log(message: string, shouldLog?: boolean): void {
    if (this.logsEnabled || shouldLog) {
      console.log(message);
    }
  }

  error(message: string, error?: any): void {
    console.error(error ? `${message}: ${error}` : message);
  }
}
