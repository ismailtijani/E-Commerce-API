"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const aws_1 = __importDefault(require("../config/aws"));
require("dotenv/config");
const badRequest_1 = __importDefault(require("../utils/errors/badRequest"));
const upload = () => {
    const fileFilter = (req, file, cb) => {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new badRequest_1.default("Invalid file format, Please upload an Image"));
        }
        cb(null, true);
    };
    const storage = (0, multer_s3_1.default)({
        s3: aws_1.default,
        bucket: process.env.AMAZON_S3_PROPERTY_IMAGES_BUCKET,
        acl: "public-read",
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const fileName = Date.now() +
                "_" +
                file.fieldname +
                "_" +
                file.originalname +
                "." +
                file.mimetype.split("/")[1];
            console.log("Generated Key:", fileName);
            cb(null, fileName);
        },
    });
    return (0, multer_1.default)({ storage, fileFilter, limits: { fileSize: 5000000 } });
};
exports.default = upload;
