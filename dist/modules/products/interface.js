"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingEnum = exports.CategoryEnum = void 0;
var CategoryEnum;
(function (CategoryEnum) {
    CategoryEnum["FOOD"] = "food";
    CategoryEnum["ELECTRONICS"] = "electronics";
    CategoryEnum["CLOTHING"] = "clothing";
    CategoryEnum["FURNITURE"] = "furniture";
    CategoryEnum["OTHERS"] = "others";
})(CategoryEnum || (exports.CategoryEnum = CategoryEnum = {}));
var RatingEnum;
(function (RatingEnum) {
    RatingEnum[RatingEnum["ZERO"] = 0] = "ZERO";
    RatingEnum[RatingEnum["ONE"] = 1] = "ONE";
    RatingEnum[RatingEnum["TWO"] = 2] = "TWO";
    RatingEnum[RatingEnum["THREE"] = 3] = "THREE";
    RatingEnum[RatingEnum["FOUR"] = 4] = "FOUR";
    RatingEnum[RatingEnum["FIVE"] = 5] = "FIVE";
})(RatingEnum || (exports.RatingEnum = RatingEnum = {}));
