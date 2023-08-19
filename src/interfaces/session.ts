export interface Session {
  start(): void;
  commit(): Promise<void>;
  abort(): Promise<void>;
  end(): void;
}
