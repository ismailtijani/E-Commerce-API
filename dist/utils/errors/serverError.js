"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("./appError"));
const interfaces_1 = require("../interfaces");
class ServerError extends appError_1.default {
    constructor(message) {
        super(message);
        this.statusCode = interfaces_1.statusCodes.INTERNAL_SERVER_ERROR;
    }
}
exports.default = ServerError;
