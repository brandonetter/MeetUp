const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json("works");
});
router.get("/auth", (req, res) => {});
router.post("/auth", (req, res) => {});
router.post("/auth/new", (req, res) => {});
router.get("/groups/all", (req, res) => {});
router.get("/groups", (req, res) => {});
router.get("/groups/:group_id", (req, res) => {});
router.post("/groups", (req, res) => {});
router.post("/groups/:group_id/images", (req, res) => {});
router.put("/groups/:group_id", (req, res) => {});
router.delete("/groups/:group_id", (req, res) => {});
router.get("/groups/:group_id/venues", (req, res) => {});
router.post("/groups/:group_id/venues", (req, res) => {});
router.put("/venues/:venue_id", (req, res) => {});
router.get("/events/all", (req, res) => {});
router.get("/groups/:group_id/events", (req, res) => {});
router.get("/events/:event_id", (req, res) => {});
router.post("/groups/:group_id/events", (req, res) => {});
router.post("/events/:event_id/image", (req, res) => {});
router.put("/events/:event_id", (req, res) => {});
router.get("/groups/:group_id/members", (req, res) => {});
router.get("/groups/:group_id/join", (req, res) => {});
router.put("/groups/:group_id/members", (req, res) => {});
router.delete("/groups/:group_id/members", (req, res) => {});
router.get("/events/:event_id/attendees", (req, res) => {});
router.get("/events/:event_id/join", (req, res) => {});
router.put("/events/:event_id/attendees", (req, res) => {});
router.delete("/events/:event_id/attendees", (req, res) => {});
router.delete("/groups/:group_id/images/:image_id", (req, res) => {});
router.delete("/events/:event_id/images/:image_id", (req, res) => {});
router.get("/events", (req, res) => {});

module.exports = router;
