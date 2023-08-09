import http from "http";
import { app, PORT } from "./src/config/app";
import Logger from "./src/utils/logger";

http.createServer(app).listen(PORT, () => Logger.info(`Server is running 🚀🚀🚀 on port ${PORT}`));
