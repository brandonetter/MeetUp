const e = require("express");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User, Group, Tools: t, Image, Venue, Event } = require("../db/models");

async function authMiddle(req, res, next) {
  const authHeader = req?.cookies?.authorized || null;
  const token = authHeader;
  if (token == null) {
    res.statusCode = 401;
    return res.json({
      message: "Authentication required",
      statusCode: 401,
    });
  }
  try {
    const { id } = jwt.verify(token, process.env.SECRET);
    let user = await User.findOne({ where: { username: id } });
    let { username, ...rest } = user.dataValues;
    req.username = username;
    req.userId = rest.id;
    req.userObject = user;
  } catch {
    res.statusCode = 401;
    return res.json({
      message: "Authentication required",
      statusCode: 401,
    });
  }
  next();
}

router.post("/auth/new", async (req, res) => {
  try {
    ob = t.tidy(User, req.body);
    console.log("aas");
    let user = await User.create(ob);
    let { salt, hash, updatedAt, createdAt, ...rest } = user.dataValues;
    res.json({ user: rest });
  } catch (e) {
    res.json(t.tidyError(e, res, "User"));
  }
});
router.get("/auth", authMiddle, async (req, res) => {
  res.json(req.userObject);
});
router.post("/auth", async (req, res) => {
  try {
    let user = await User.scope("validation").findOne({
      where: { email: req.body.email },
    });
    if (user.validPassword(req.body.password)) {
      res.cookie("authorized", user.generateToken(), {
        maxAge: 360000,
      });
      let { salt, hash, ...userD } = user.dataValues;
      res.json({ user: userD });
    } else {
      throw e;
    }
  } catch (e) {
    res.statusCode = 401;
    res.json({
      message: "Authentication required",
      statusCode: 401,
    });
  }
});

router.post("*", authMiddle);
router.put("*", authMiddle);
router.get("/groups/all", async (req, res) => {
  try {
    let groups = await Group.findAll();
    groups = await Promise.all(
      groups.map(async (x) => {
        return await x.includePreview();
      })
    );
    res.json({ Groups: groups });
  } catch (e) {
    res.json(e);
  }
});
router.get("/groups", authMiddle, async (req, res) => {
  try {
    let groups = await req.userObject.getAllGroups();

    res.json(groups);
  } catch (e) {
    res.json(e);
  }
});
router.get("/groups/:group_id", async (req, res) => {
  try {
    let group = await Group.findOne({
      where: {
        id: req.params.group_id,
      },
    });
    await group.includeImages();
    await group.addOrganizer();
    res.json(group);
  } catch (e) {
    res.statusCode = 404;
    res.json({ message: "Group couldn't be found", statusCode: 404 });
  }
});
router.post("/groups", authMiddle, async (req, res) => {
  try {
    let ob = t.tidy(Group, req.body);
    ob.organizerId = req.userId;
    let groupReq = await Group.create(ob);
    let { numMembers, ...group } = groupReq.dataValues;
    await req.userObject.addGroup(groupReq);
    await groupReq.confirmJoin(req.userId);
    res.json(group);
  } catch (e) {
    res.json(e);
  }
});
router.post("/groups/:group_id/images", authMiddle, async (req, res) => {
  try {
    let ob = t.tidy(Image, req.body);
    ob.userId = req.userId;
    ob.groupId = req.params.group_id;
    let result = await Group.addNewImage(ob);
    res.json(result);
  } catch (e) {
    res.json(e);
  }
});
router.put("/groups/:group_id", authMiddle, async (req, res) => {
  try {
    let group = await Group.findOne({
      where: {
        id: req.params.group_id,
      },
    });
    if (!group) {
      res.statusCode = 404;
      throw {
        message: "Group couldn't be found",
        statusCode: 404,
      };
    }
    let ob = t.tidy(Group, req.body);
    if (group.organizerId != req.userObject.id) {
      res.statusCode = 401;
      throw {
        message: "You are not the organizer of this Group",
        statusCode: 401,
      };
    }
    await group.update(ob);
    res.json(group);
  } catch (e) {
    res.json(e);
  }
});
router.delete("/groups/:group_id", authMiddle, async (req, res) => {
  try {
    let group = await Group.findOne({
      where: {
        id: req.params.group_id,
      },
    });
    if (!group) {
      res.statusCode = 404;
      throw {
        message: "Group couldn't be found",
        statusCode: 404,
      };
    }
    if (group.organizerId != req.userObject.id) {
      res.statusCode = 401;
      throw {
        message: "You are not the organizer of this Group",
        statusCode: 401,
      };
    }
    await group.destroy();
    res.json({
      message: "Successfully deleted",
      statusCode: 200,
    });
  } catch (e) {
    res.json(e);
  }
});
router.get("/groups/:group_id/venues", async (req, res) => {
  try {
    let group = await Group.findOne({
      where: {
        id: req.params.group_id,
      },
    });
    let venues = await group.getVenues();
    res.json({ Venues: venues });
  } catch (e) {
    res.json(e);
  }
});
router.post("/groups/:group_id/venues", authMiddle, async (req, res) => {
  try {
    let group = await Group.findOne({
      where: {
        id: req.params.group_id,
      },
    });
    console.log(group.organizerId, req.userId);
    if (group.organizerId != req.userId)
      throw { Error: "You are not the Group Organizer" };

    let data = t.tidy(Venue, req.body);
    data.groupId = req.params.group_id;

    let venue = await Venue.create(data);
    let { createdAt, updatedAt, ...rest } = venue.dataValues;
    res.json(rest);
  } catch (e) {
    res.json(e);
  }
});
router.put("/venues/:venue_id", (req, res) => {});
router.get("/events/all", (req, res) => {});
router.get("/groups/:group_id/events", (req, res) => {});
router.get("/events/:event_id", (req, res) => {});
router.post("/groups/:group_id/events", authMiddle, async (req, res) => {
  try {
    let group = await Group.findOne({
      where: {
        id: req.params.group_id,
      },
    });
    console.log(group.organizerId, req.userId);
    if (group.organizerId != req.userId)
      throw { Error: "You are not the Group Organizer" };

    let data = t.tidy(Event, req.body);
    data.numAttending = 0;
    data.groupId = req.params.group_id;

    let event = await Event.create(data);
    let { createdAt, updatedAt, ...rest } = event.dataValues;
    res.json(rest);
  } catch (e) {
    res.json(e);
  }
});
router.post("/events/:event_id/image", (req, res) => {});
router.put("/events/:event_id", (req, res) => {});
router.get("/groups/:group_id/members", (req, res) => {});
router.get("/groups/:group_id/join", authMiddle, async (req, res) => {
  let group;
  try {
    group = await Group.findOne({ where: { id: req.params.group_id } });
    if (group === null) group.cause.an.error();
  } catch (e) {
    res.statusCode = 404;
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }
  try {
    let result = await req.userObject.addToGroup(group);
    if (!result.status) {
      res.statusCode = result.statusCode;
      throw {
        message: result.message,
        statusCode: result.statusCode,
      };
    }
    return res.json({
      groupId: Number(req.params.group_id),
      memberId: req.userId,
      status: "pending",
    });
  } catch (e) {
    return res.json(e);
  }
});
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
