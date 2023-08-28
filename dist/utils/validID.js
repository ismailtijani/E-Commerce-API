"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const badRequest_1 = __importDefault(require("./errors/badRequest"));
class validObjectId {
    constructor() {
        this.validateId = (req, res, next) => {
            try {
                if (mongoose_1.default.Types.ObjectId.isValid(req.params._id)) {
                    next();
                }
                else {
                    throw new badRequest_1.default("Invalid Params Id");
                }
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = new validObjectId().validateId;
