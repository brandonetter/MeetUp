require("dotenv").config();
let ob = {
  development: {
    storage: "./server/dev.db",
    dialect: "sqlite",
  },
  test: {
    use_env_variable: process.env.URL,
    url: process.env.URL,

    dialect: "postgres",
  },
  test2: {
    use_env_variable: "postgresql://postgres:pass@localhost/postgres",
    url: "postgresql://postgres:pass@localhost/postgres",

    dialect: "postgres",
  },
};
export default ob;
