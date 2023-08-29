import http from "http";
import app, { PORT } from "./config/app";
import Logger from "./utils/logger";

http.createServer(app).listen(PORT, () => Logger.info(`Server is running 🚀🚀🚀 on port ${PORT}`));
