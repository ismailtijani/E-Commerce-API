import { S3 } from "@aws-sdk/client-s3";
import "dotenv/config";

export default new S3({
  forcePathStyle: true,
  region: process.env.AMAZON_S3_BUCKET_REGION,
  credentials: {
    secretAccessKey: process.env.AMAZON_S3_USER_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AMAZON_S3_USER_ACCESS_KEY_ID as string,
  },
});
