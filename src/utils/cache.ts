import Redis from "ioredis"
import logger from "./logger";

let cache: Redis | null = null;

export default class Cache {
  private host: string
  private port: number

  constructor() {
    if (!process.env.redisHost) {
      throw new Error("Redis host not set");
    }
    if (!process.env.redisPort) {
      throw new Error("Redis port not set");
    }
    this.host = process.env.redisHost;
    this.port = parseInt(process.env.redisPort);
  }

  async initialize(): Promise<void> {
    cache = new Redis(this.port, this.host);
    logger.info("Cache initialized");
  }
}