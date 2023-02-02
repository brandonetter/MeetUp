require("dotenv").config({ path: "../.env" });

const express = require("express");
const fs = require("fs");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
var csrf = require("csurf");
const multer = require("multer");
const imageStorage = multer.diskStorage({
  // Destination to store image
  destination: "../public/images",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
    // file.fieldname is name of the field (image)
    // path.extname get the uploaded file extension
  },
});
const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

app.use(cookieParser());
app.use(csrf({ cookie: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//
// For Single image upload
app.post(
  "/apiv1/uploadImage",
  imageUpload.single("image"),
  (req, res) => {
    console.log("Asd");
    console.log(req.file);
    res.json({ url: req.file.filename });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);
// if (process.env.NODE_ENV === "production") {
// const path = require("path");
// Serve the frontend's index.html file at the root route
app.get("/", (req, res) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  return res.sendFile(
    path.resolve(__dirname, "../front", "build", "index.html")
  );
});

// Serve the static assets in the frontend's build folder
app.use(express.static(path.resolve("../front/build")));
app.use("/imagebin", express.static(path.resolve("../public/images")));
// Serve the frontend's index.html file at all other routes NOT starting with /api
app.get(/^(?!\/?api).*/, (req, res) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  return res.sendFile(
    path.resolve(__dirname, "../front", "build", "index.html")
  );
});

for (let route in routes) {
  app.use("/" + route, routes[route]);
}
// }
app.get("/api/csrf/restore", (req, res) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  return res.json({});
});
// if (process.env.NODE_ENV !== "production") {
//   app.get("/apiv1/test", (req, res) => {
//     res.json({ ooh: "ahh" });
//   });
//   app.get("/api/csrf/restore", (req, res) => {
//     res.cookie("XSRF-TOKEN", req.csrfToken());
//     return res.json({});
//   });
// }
app.listen(process.env.PORT || 8000, () => {
  console.log("Running on port " + (process.env.PORT || 8000));
});
