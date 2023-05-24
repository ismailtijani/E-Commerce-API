import { S3Client } from "@aws-sdk/client-s3";

export default new S3Client({
  forcePathStyle: true,
  region: process.env.AMAZON_S3_BUCKET_REGION,
  credentials: {
    secretAccessKey: process.env.AMAZON_S3_USER_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AMAZON_S3_USER_ACCESS_KEY_ID as string,
  },
});
