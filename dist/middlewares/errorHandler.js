"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const appError_1 = __importDefault(require("../utils/errors/appError"));
const interfaces_1 = require("../utils/interfaces");
const badRequest_1 = __importDefault(require("../utils/errors/badRequest"));
const unauthenticated_1 = __importDefault(require("../utils/errors/unauthenticated"));
const serverError_1 = __importDefault(require("../utils/errors/serverError"));
const notFound_1 = __importDefault(require("../utils/errors/notFound"));
class ErrorHandler {
    constructor() {
        this.handleTrustedError = (error, res) => {
            if (error instanceof badRequest_1.default) {
                return res.status(error.statusCode).json({
                    STATUS: "FAILURE",
                    MESSAGE: error.message,
                });
            }
            else if (error instanceof unauthenticated_1.default) {
                return res.status(error.statusCode).json({
                    STATUS: "FAILURE",
                    MESSAGE: error.message,
                });
            }
            else if (error instanceof serverError_1.default) {
                return res.status(error.statusCode).json({
                    STATUS: "FAILURE",
                    MESSAGE: error.message,
                });
            }
            else if (error instanceof notFound_1.default) {
                return res.status(error.statusCode).json({
                    STATUS: "FAILURE",
                    MESSAGE: error.message,
                });
            }
        };
    }
    isTrustedError(error) {
        if (error instanceof appError_1.default) {
            return true;
        }
        return false;
    }
    handleError(error, res) {
        if (this.isTrustedError(error) && res) {
            this.handleTrustedError(error, res);
        }
        else {
            this.handleCriticalError(error, res);
        }
    }
    handleCriticalError(error, res) {
        if (res) {
            res.status(interfaces_1.statusCodes.INTERNAL_SERVER_ERROR).json({
                STATUS: "FAILURE",
                MESSAGE: "Internal Server Error",
            });
        }
        logger_1.default.error(error);
        logger_1.default.warn("Application encountered a critical error. Exiting.....");
        process.exit(1);
    }
}
exports.ErrorHandler = ErrorHandler;
exports.default = new ErrorHandler();
