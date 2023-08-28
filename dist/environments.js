"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Environments;
(function (Environments) {
    Environments["dev_environment"] = "dev";
    Environments["prod_environment"] = "prod";
    Environments["qa_environment"] = "qa";
})(Environments || (Environments = {}));
class Environment {
    constructor(environment) {
        this.environment = environment;
    }
    getPort() {
        if (this.environment === Environments.prod_environment) {
            return 8081;
        }
        if (this.environment === Environments.qa_environment) {
            return 8082;
        }
        return 8000;
    }
    getDbName() {
        if (this.environment === Environments.prod_environment) {
            return "E_Commerce_Prod";
        }
        if (this.environment === Environments.qa_environment) {
            return "E_Commerce_Qa";
        }
        return "E_Commerce_Dev";
    }
}
exports.default = new Environment(Environments.dev_environment);
