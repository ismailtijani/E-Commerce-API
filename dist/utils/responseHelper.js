"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseHelper = void 0;
const interfaces_1 = require("./interfaces");
class responseHelper {
    static successResponse(res, message, DATA) {
        res.status(interfaces_1.statusCodes.SUCCESS).json({
            STATUS: "SUCCESS",
            MESSAGE: message,
            DATA,
        });
    }
    static createdResponse(res, message, DATA) {
        res.status(interfaces_1.statusCodes.CREATED).json({
            STATUS: "SUCCESS",
            MESSAGE: message,
            DATA,
        });
    }
}
exports.responseHelper = responseHelper;
