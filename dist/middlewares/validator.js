"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const badRequest_1 = __importDefault(require("../utils/errors/badRequest"));
function validator(schema, property) {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], {
            abortEarly: false,
        });
        const valid = error == null;
        if (valid) {
            next();
        }
        else {
            const { details } = error;
            const message = details.map((i) => i.message).join(",");
            throw new badRequest_1.default(message);
        }
    };
}
exports.default = validator;
