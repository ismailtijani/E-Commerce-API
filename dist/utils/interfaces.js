"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCodes = void 0;
var statusCodes;
(function (statusCodes) {
    statusCodes[statusCodes["SUCCESS"] = 200] = "SUCCESS";
    statusCodes[statusCodes["CREATED"] = 201] = "CREATED";
    statusCodes[statusCodes["NO_CONTENT"] = 204] = "NO_CONTENT";
    statusCodes[statusCodes["MODIFIED"] = 304] = "MODIFIED";
    statusCodes[statusCodes["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    statusCodes[statusCodes["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    statusCodes[statusCodes["FORBIDDEN"] = 403] = "FORBIDDEN";
    statusCodes[statusCodes["NOT_FOUND"] = 404] = "NOT_FOUND";
    statusCodes[statusCodes["CONFLICT"] = 409] = "CONFLICT";
    statusCodes[statusCodes["UNPROCESSABLE"] = 422] = "UNPROCESSABLE";
    statusCodes[statusCodes["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    statusCodes[statusCodes["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
})(statusCodes || (exports.statusCodes = statusCodes = {}));
