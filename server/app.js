require("dotenv").config({ path: "../.env" });

const express = require("express");
const fs = require("fs");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
var csrf = require("csurf");

app.use(cookieParser());
app.use(csrf({ cookie: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
for (let route in routes) {
  app.use("/" + route, routes[route]);
}

if (process.env.NODE_ENV === "production") {
  const path = require("path");
  // Serve the frontend's index.html file at the root route
  app.get("/", (req, res) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    return res.sendFile(
      path.resolve(__dirname, "../../frontend", "build", "index.html")
    );
  });

  // Serve the static assets in the frontend's build folder
  app.use(express.static(path.resolve("../frontend/build")));

  // Serve the frontend's index.html file at all other routes NOT starting with /api
  app.get(/^(?!\/?api).*/, (req, res) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    return res.sendFile(
      path.resolve(__dirname, "../../frontend", "build", "index.html")
    );
  });
}

if (process.env.NODE_ENV !== "production") {
  app.get("/apiv1/test", (req, res) => {
    res.json({ ooh: "ahh" });
  });
  app.get("/api/csrf/restore", (req, res) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    return res.json({});
  });
}
app.listen(process.env.PORT || 8000, () => {
  console.log("Running on port " + (process.env.PORT || 8000));
});
