import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";
import Logger from "../utils/logger";

dotenv.config();

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

  private RedisServerConnection = async () => {
    this.client.on("error", (error) => {
      Logger.error("Redis Client Error");
    });
    await this.client.connect();
    this.client.on("connection", () => (this.isClientReady = true));
  };

  public async set<T>(key: string, value: T, expT?: number) {
    if (this.isClientReady) {
      await this.client.setEx(key, expT ? expT : this.ttl, JSON.stringify(value));
      return true;
    }
    return false;
  }

  public async get<T>(key: string) {
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
