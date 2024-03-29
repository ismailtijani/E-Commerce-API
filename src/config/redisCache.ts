import { createClient, RedisClientType } from "redis";
import "dotenv/config";
import Logger from "../utils/logger";

class RedisCache {
  private client: RedisClientType;
  private isClientReady: boolean;
  private redisClientOptions = //Figure out how to add the type correctly
    process.env.NODE_ENV === "development"
      ? {}
      : {
        username: process.env.REDDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT as string),
        },
      };

  constructor(private ttl: number) {
    this.client = createClient(this.redisClientOptions);
    this.isClientReady = false;
    //Connect to Redis Server
    this.RedisServerConnection();
  }

  private RedisServerConnection = () => {
    this.client.connect();
    this.client.on("connect", () => {
      Logger.info("Redis connection successful");
      this.isClientReady = true;
      // Clear Redis data on starting the server
      this.flush();
    });
    this.client.on("error", (error) => {
      return Logger.error(`Redis Client Error: ${error.message}`);
    });
  };

  public async set<T>(key: string, value: T, expT?: number) {
    if (this.isClientReady) {
      await this.client.setEx(key, expT ? expT : this.ttl, JSON.stringify(value));
      return true;
    }
    return false;
  }

  public async get(key: string) {
    if (this.isClientReady) {
      const data = await this.client.get(key);
      if (data) return JSON.parse(data);
    }
    return false;
  }

  public async del(key: string) {
    if (this.isClientReady) {
      await this.client.del(key);
      return true;
    }
    return false;
  }

  public async flush() {
    if (this.isClientReady) {
      await this.client.flushAll();
      return true;
    }

    return false;
  }
}

export default new RedisCache(3600);
