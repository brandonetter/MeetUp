const exporter = [];
const fs = require("fs");
fs.readdirSync("./routes").forEach(function (file) {
  if (file != "index.js") {
    exporter[file.replace(".js", "")] = require("./" + file);
  }
});

module.exports = exporter;
