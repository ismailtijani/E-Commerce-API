"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const multer_1 = __importDefault(require("../../middlewares/multer"));
const validator_1 = __importDefault(require("../../middlewares/validator"));
const validator_2 = __importDefault(require("../../modules/users/validator"));
const user_1 = __importDefault(require("../../controllers/user"));
class UserRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.registeredRoutes();
    }
    registeredRoutes() {
        //Every routes below will require authentication
        this.router.use(auth_1.default.middleware);
        this.router.get("/", user_1.default.readProfile);
        this.router.post("/profile_photo", 
        // validator(userValidatorSchema.profilePhoto, "body"),
        (0, multer_1.default)().single("upload"), user_1.default.updateProfilePhoto);
        this.router.get("/profile_photo/:filename", user_1.default.viewProfilePhoto);
        this.router.patch("/profile_photo/:filename", user_1.default.updateProfilePhoto);
        this.router.delete("/profile_photo/:filename", user_1.default.deleteProfilePhoto);
        this.router.patch("/", (0, validator_1.default)(validator_2.default.update, "body"), user_1.default.updateProfile);
    }
}
const userRouter = new UserRoutes().router;
exports.default = userRouter;
