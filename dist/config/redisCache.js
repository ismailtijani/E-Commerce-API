"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
require("dotenv/config");
const logger_1 = __importDefault(require("../utils/logger"));
class RedisCache {
    constructor(ttl) {
        this.ttl = ttl;
        this.redisClientOptions = process.env.NODE_ENV === "development"
            ? {}
            : {
                username: process.env.REDDIS_USERNAME,
                password: process.env.REDIS_PASSWORD,
                socket: {
                    host: process.env.REDIS_HOST,
                    port: parseInt(process.env.REDIS_PORT),
                },
            };
        this.RedisServerConnection = () => {
            this.client.connect();
            this.client.on("connect", () => {
                logger_1.default.info("Redis connection successful");
                this.isClientReady = true;
                // Clear Redis data on starting the server
                this.flush();
            });
            this.client.on("error", (error) => {
                return logger_1.default.error(`Redis Client Error: ${error.message}`);
            });
        };
        this.client = (0, redis_1.createClient)(this.redisClientOptions);
        this.isClientReady = false;
        //Connect to Redis Server
        this.RedisServerConnection();
    }
    set(key, value, expT) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isClientReady) {
                yield this.client.setEx(key, expT ? expT : this.ttl, JSON.stringify(value));
                return true;
            }
            return false;
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isClientReady) {
                const data = yield this.client.get(key);
                if (data)
                    return JSON.parse(data);
            }
            return false;
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isClientReady) {
                yield this.client.del(key);
                return true;
            }
            return false;
        });
    }
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isClientReady) {
                yield this.client.flushAll();
                return true;
            }
            return false;
        });
    }
}
exports.default = new RedisCache(3600);
