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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = __importDefault(require("../modules/users/schema"));
const rsa_1 = __importDefault(require("../middlewares/rsa"));
const redisCache_1 = __importDefault(require("../config/redisCache"));
const constant_1 = require("../constant");
const unauthenticated_1 = __importDefault(require("../utils/errors/unauthenticated"));
const badRequest_1 = __importDefault(require("../utils/errors/badRequest"));
const enums_1 = require("../enums");
const notFound_1 = __importDefault(require("../utils/errors/notFound"));
class Authentication {
    static middleware(req, res, next) {
        var _b;
        return __awaiter(this, void 0, void 0, function* () {
            // Get token from headers
            const token = (_b = req.header("Authorization")) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", "");
            try {
                if (!token)
                    throw new unauthenticated_1.default("Access denied.Please Authenticate.");
                // // Verify Token (Decrypt with RSA using the private key)
                // const isVerified = keyPair.verifySignature(token, signature);
                // if (!isVerified) throw new BadRequestError("Please Authenticate");
                const _id = rsa_1.default.decrypt(token);
                const isActive = yield redisCache_1.default.get(constant_1.ACCESS_TOKEN + _id);
                if (!isActive)
                    throw new badRequest_1.default("Access denied.Please Authenticate.");
                // Get user from database
                const user = yield schema_1.default.findById({ _id });
                if (!user)
                    throw new badRequest_1.default("Please Authenticate");
                // Add user to request
                req.user = user;
                req.token = token;
                next();
            }
            catch (error) {
                if (error.message === "Encrypted message length is invalid." ||
                    error.message === "Invalid RSAES-OAEP padding." ||
                    error.message === "Encrypted message is invalid.")
                    return res
                        .status(400)
                        .json({ STATUS: "FAILURE", MESSAGE: "Access denied.Please Authenticate." });
                next(error);
            }
        });
    }
    static generateConfirmationCode() {
        const confirmationCode = Math.floor(Math.random() * (999999 - 100000) + 100000).toString();
        return confirmationCode;
    }
    static isAdmin(req, res, next) {
        var _b, _c, _d;
        try {
            if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) === req.params.id ||
                ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userLevel) === enums_1.UserLevelEnum.isAdmin ||
                ((_d = req.user) === null || _d === void 0 ? void 0 : _d.userLevel) === enums_1.UserLevelEnum.isSuperAdmin) {
                next();
            }
            else
                throw new badRequest_1.default("You are not allowed to perform this operation!");
        }
        catch (error) {
            next(error);
        }
    }
    //  Access level verifier('Super admin')
    static isSuperAdmin(req, res, next) {
        try {
            if (req.user.userLevel === enums_1.UserLevelEnum.isSuperAdmin)
                next();
            else
                throw new badRequest_1.default("You are not allowed to perform this operation!");
        }
        catch (error) {
            next(error);
        }
    }
}
_a = Authentication;
Authentication.tokenVerification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    const { code: authToken } = req.body;
    try {
        //Fetch and Validate 2FAuth token
        const { confirmationCode } = yield redisCache_1.default.get(constant_1.AUTH_PREFIX + _id);
        if (!confirmationCode)
            throw new badRequest_1.default("Auth Code expired or does not exist");
        if (authToken !== confirmationCode)
            throw new badRequest_1.default("Invalid code");
        //Delete Confirmation code
        yield redisCache_1.default.del(constant_1.AUTH_PREFIX + _id);
        // Fetch user data
        const user = yield schema_1.default.findById(_id);
        if (!user)
            throw new notFound_1.default("User not found");
        // Generate AuthToken
        const token = rsa_1.default.encrypt(_id);
        // const signature = keyPair.sign(token);
        //Save token to Redis
        yield redisCache_1.default.set(constant_1.ACCESS_TOKEN + _id, { token }, 24 * 60 * 60);
        //Add user and token to request
        req.user = user;
        req.token = token;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.default = Authentication;
