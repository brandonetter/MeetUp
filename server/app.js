require("dotenv").config({ path: "../.env" });

const express = require("express");
const fs = require("fs");
const app = express();
const path = require("path");
const routes = require("./routes");

for (let route in routes) {
  app.use("/" + route, routes[route]);
}

app.listen(process.env.PORT || 8000, () => {
  console.log("Running on port " + (process.env.PORT || 8000));
});
