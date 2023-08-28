"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountStatusEnum = exports.UserLevelEnum = void 0;
var UserLevelEnum;
(function (UserLevelEnum) {
    UserLevelEnum["isSuperAdmin"] = "2";
    UserLevelEnum["isAdmin"] = "1";
    UserLevelEnum["isUser"] = "0";
})(UserLevelEnum || (exports.UserLevelEnum = UserLevelEnum = {}));
var AccountStatusEnum;
(function (AccountStatusEnum) {
    AccountStatusEnum["PENDING"] = "pending";
    AccountStatusEnum["ACTIVATED"] = "activated";
})(AccountStatusEnum || (exports.AccountStatusEnum = AccountStatusEnum = {}));
