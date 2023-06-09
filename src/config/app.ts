import express, { Request, Response, Application, NextFunction } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import Logger from "../utils/logger";
import Environment from "../environments";
import errorHandler from "../middlewares/errorHandler";
import v1AuthRouter from "../v1/routes/auth";
import v1userRouter from "../v1/routes/user";
import v1productRouter from "../v1/routes/product";
import v1CartRouter from "../v1/routes/cart";

class App {
  public app: Application;
  public mongoUrl =
    process.env.NODE_ENV === "development"
      ? `mongodb://127.0.0.1/${Environment.getDbName()}`
      : (process.env.MONGODB_URL as string);

  constructor() {
    this.app = express();
    this.mongoSetup();
    this.config();
  }

  private config() {
    this.app.use(
      cors({
        origin: ClientBaseUrl,
        methods: "GET,POST,PUT,DELETE,PATCH",
        credentials: true,
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // routes
    // set home route
    this.app.get("/", (req, res) => {
      res.status(200).json({ message: "Welcome to the E Commerce API" });
    });
    this.app.use("/api/v1/accounts", v1AuthRouter);
    this.app.use("/api/v1/users", v1userRouter);
    this.app.use("/api/v1/products", v1productRouter);
    this.app.use("/api/v1/carts", v1CartRouter);
    // set up global error handling here
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      errorHandler.handleError(error, res);
    });
  }

  private mongoSetup() {
    try {
      mongoose
        .set("strictQuery", false)
        .connect(this.mongoUrl, { retryWrites: true, w: "majority" });
      Logger.info("DB Connection Successful");
      Logger.info(`'''''''''''''''''''''''''`);
    } catch (error: any) {
      Logger.error(`MongoDB connection error: ${error.name}`);
      errorHandler.handleError(error);
    }
  }
}

export const PORT = process.env.PORT || Environment.getPort();
export const ClientBaseUrl =
  process.env.NODE_ENV !== "development"
    ? (process.env.PROD_URL as string)
    : "http://localhost:3000";

export default new App().app;
