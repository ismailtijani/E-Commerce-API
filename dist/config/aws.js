"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
require("dotenv/config");
exports.default = new client_s3_1.S3({
    forcePathStyle: true,
    region: process.env.AMAZON_S3_BUCKET_REGION,
    credentials: {
        secretAccessKey: process.env.AMAZON_S3_USER_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AMAZON_S3_USER_ACCESS_KEY_ID,
    },
});
