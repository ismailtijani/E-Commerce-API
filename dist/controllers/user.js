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
const responseHelper_1 = require("../utils/responseHelper");
const aws_1 = __importDefault(require("../config/aws"));
const badRequest_1 = __importDefault(require("../utils/errors/badRequest"));
const serverError_1 = __importDefault(require("../utils/errors/serverError"));
class Controller {
}
_a = Controller;
Controller.Bucket = process.env.AMAZON_S3_PROPERTY_IMAGES_BUCKET;
Controller.readProfile = (req, res) => {
    return responseHelper_1.responseHelper.successResponse(res, undefined, req.user);
};
Controller.uploadProfilePhoto = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        if (!req.file)
            throw new badRequest_1.default("Invalid input");
        if ("location" in req.file && "key" in req.file) {
            user.imageUrl = req.file.location;
            yield user.save();
            return responseHelper_1.responseHelper.successResponse(res, "Image uploaded successfully", {
                location: req.file.location,
                key: req.file.key,
            });
        }
        else
            throw new badRequest_1.default("Failed to save user profile photo");
    }
    catch (error) {
        next(error);
    }
});
Controller.viewProfilePhoto = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield aws_1.default.getObject({ Bucket: _a.Bucket, Key: req.params.filename });
        return responseHelper_1.responseHelper.successResponse(res, undefined, response.Body);
    }
    catch (error) {
        next(error);
    }
});
Controller.updateProfilePhoto = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        yield aws_1.default.deleteObject({ Bucket: _a.Bucket, Key: req.params.filename });
        const response = yield aws_1.default.putObject({
            Bucket: _a.Bucket,
            Key: (_b = req.file) === null || _b === void 0 ? void 0 : _b.filename,
            Body: (_c = req.file) === null || _c === void 0 ? void 0 : _c.buffer,
        });
        if ("Location" in response && "Key" in response) {
            return responseHelper_1.responseHelper.successResponse(res, "Image uploaded successfully", {
                location: response.Location,
                key: response.Key,
            });
        }
        throw new serverError_1.default("Failed to save user profile photo");
    }
    catch (error) {
        next(error);
    }
});
Controller.deleteProfilePhoto = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield aws_1.default.deleteObject({ Bucket: _a.Bucket, Key: req.params.filename });
        if (response.$metadata.httpStatusCode === 204) {
            req.user.imageUrl = undefined;
            yield req.user.save();
            return responseHelper_1.responseHelper.successResponse(res, "Image deleted successfully");
        }
        throw new serverError_1.default("Error deleting image, please try again");
    }
    catch (error) {
        next(error);
    }
});
Controller.updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["firstName", "lastName", "phoneNumber", "password"];
    try {
        if (updates.length === 0)
            throw new badRequest_1.default("Invalid update!");
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
        if (!isValidOperation)
            throw new badRequest_1.default("Invalid update");
        const user = req.user;
        updates.forEach((update) => (user[update] = req.body[update]));
        yield user.save();
        return responseHelper_1.responseHelper.successResponse(res, "Profile updated successfully✅");
    }
    catch (error) {
        next(error);
    }
});
Controller.deleteAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        yield ((_d = req.user) === null || _d === void 0 ? void 0 : _d.deleteOne());
        responseHelper_1.responseHelper.successResponse(res, "Account deleted successfully");
    }
    catch (error) {
        next(error);
    }
});
exports.default = Controller;
