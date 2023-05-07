enum Environments {
  dev_environment = "dev",
  prod_environment = "prod",
  qa_environment = "qa",
}

class Environment {
  constructor(private environment: string) {}

  getPort(): number {
    if (this.environment === Environments.prod_environment) {
      return 8081;
    }
    if (this.environment === Environments.qa_environment) {
      return 8082;
    }
    return 8000;
  }

  getDbName(): string {
    if (this.environment === Environments.prod_environment) {
      return "E_Commerce_Prod";
    }
    if (this.environment === Environments.qa_environment) {
      return "E_Commerce_Qa";
    }
    return "E_Commerce_Dev";
  }
}

export default new Environment(Environments.dev_environment);
