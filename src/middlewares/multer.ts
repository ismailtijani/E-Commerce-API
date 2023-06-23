import { Request } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../config/aws";
import AppError from "../utils/errors/appError";
import { statusCodes } from "../utils/interfaces";
import BadRequestError from "../utils/errors/badRequest";

const upload = () => {
  const fileFilter = (req: Request, file: any, cb: any) => {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new BadRequestError({ message: "Invalid file format, Please upload an Image" }));
    }
    cb(null, true);
  };

  const storage = multerS3({
    s3,
    bucket: process.env.AMAZON_S3_PROPERTY_IMAGES_BUCKET as string,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileName =
        Date.now() +
        "_" +
        file.fieldname +
        "_" +
        file.originalname +
        "." +
        file.mimetype.split("/")[1];
      cb(null, fileName);
    },
  });

  return multer({ storage, fileFilter, limits: { fileSize: 5000000 } });
};

export default upload;
