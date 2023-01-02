const e = require("express");
const express = require("express");
const router = express.Router();
// router.use(express.json());
const jwt = require("jsonwebtoken");
const {
  User,
  Group,
  Tools: t,
  Image,
  Venue,
  Event,
  UserEvent,
  UserGroup,
  Sequelize,
} = require("../db/models");

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
async function softAuthMiddle(req, res, next) {
  const authHeader = req?.cookies?.authorized || null;
  const token = authHeader;
  if (token == null) {
    return next();
  }
  try {
    const { id } = jwt.verify(token, process.env.SECRET);
    let user = await User.findOne({ where: { username: id } });
    let { username, ...rest } = user.dataValues;
    req.username = username;
    req.userId = rest.id;
    req.userObject = user;
  } catch {
    return next();
  }
  next();
}
router.post("/auth/new", async (req, res) => {
  console.log(req.body);
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
router.put("/venues/:venue_id", async (req, res) => {
  // get venue by id
  try {
    let venue = await Venue.findOne({
      where: {
        id: req.params.venue_id,
      },
    });
    if (!venue) {
      res.statusCode = 404;
      throw {
        message: "Venue couldn't be found",
        statusCode: 404,
      };
    }
    let ob = t.tidy(Venue, req.body);

    for (let i in ob) {
      if (ob[i] == null) delete ob[i];
    }
    ob.id = venue.id;
    ob.groupId = venue.groupId;
    try {
      await venue.update(ob);
    } catch (e) {
      console.log(e);
    }
    res.json(venue);
  } catch (e) {
    res.json(e);
  }
});
router.get("/events/all", async (req, res) => {
  try {
    let events = await Event.findAll();
    events = await Promise.all(
      events.map(async (x) => {
        let groups = await x.getGroups();
        let venues = await x.getVenues();
        groups && (x.dataValues.Group = groups);
        venues && (x.dataValues.Venue = venues);
        return x;
      })
    );
    res.json({ Events: events });
  } catch (e) {
    res.json(e);
  }
});

router.get("/groups/:group_id/events", (req, res) => {
  //get all events based on group ID
  Group.findOne({
    where: {
      id: req.params.group_id,
    },
  })
    .then((group) => {
      group.getEvents().then((events) => {
        res.json({ Events: events });
      });
    })
    .catch((e) => {
      res.json(e);
    });
});
router.get("/events/:event_id", (req, res) => {
  //return event based on event id
  Event.findOne({
    where: {
      id: req.params.event_id,
    },
  })
    .then((event) => {
      let { createdAt, updatedAt, ...rest } = event.dataValues;
      res.json(rest);
    })
    .catch((e) => {
      res.json(e);
    });
});
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
    data.numAttending = 1;
    data.groupId = req.params.group_id;

    let event = await Event.create(data);
    let { createdAt, updatedAt, ...rest } = event.dataValues;
    let userEvent = await UserEvent.create({
      userId: req.userId,
      eventId: event.id,
      status: "member",
    });
    res.json(rest);
  } catch (e) {
    res.json(e);
  }
});

router.post("/events/:event_id/image", authMiddle, async (req, res) => {
  try {
    let ob = t.tidy(Image, req.body);
    ob.userId = req.userId;
    ob.eventId = req.params.event_id;
    let result = await Event.addNewImage(ob);
    res.json(result);
  } catch (e) {
    res.json(e);
  }
});
router.put("/events/:event_id", authMiddle, async (req, res) => {
  //Update event
  try {
    let event = await Event.findOne({
      where: {
        id: req.params.event_id,
      },
    });
    if (!event) {
      res.statusCode = 404;
      throw {
        message: "Event couldn't be found",
        statusCode: 404,
      };
    }
    let ob = t.tidy(Event, req.body);
    for (let i in ob) {
      if (ob[i] == null) delete ob[i];
    }
    let group = await Group.findOne({
      where: {
        id: event.groupId,
      },
    });
    if (group.organizerId != req.userObject.id) {
      res.statusCode = 401;
      throw {
        message: "You are not the organizer of the Group for this Event",
        statusCode: 401,
      };
    }
    await event.update(ob);
    res.json(event);
  } catch (e) {
    res.json(e);
  }
});
router.get("/groups/:group_id/members", softAuthMiddle, (req, res) => {
  // get all members of a group
  Group.findOne({
    where: {
      id: req.params.group_id,
    },
  })
    .then((group) => {
      group.getUsers().then((users) => {
        users.map((user, i) => {
          user.dataValues.Membership = {
            status: user.UserGroup.dataValues.status,
          };
          delete user.UserGroup.dataValues;
          delete user.dataValues.username;
          delete user.dataValues.email;
          if (group.organizerId != req.userId) {
            if (user.dataValues.Membership.status == "pending") {
              delete users[i];
            }
          }
        });
        users = users.filter((x) => x != null);
        res.json({ Users: users });
      });
    })
    .catch((e) => {
      res.json({
        message: "Group couldn't be found",
        statusCode: 404,
      });
    });
});
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
router.put("/groups/:group_id/members", authMiddle, async (req, res) => {
  try {
    let userGroup = await UserGroup.findOne({
      where: {
        userId: req.body.memberId,
        groupId: req.params.group_id,
      },
      attributes: [
        "id",
        "userId",
        "groupId",
        "status",
        [
          Sequelize.literal(
            `(SELECT organizerId FROM 'Groups' WHERE id=${req.params.group_id})`
          ),
          "organizerId",
        ],
        [
          Sequelize.literal(
            `(SELECT status FROM 'UserGroups' WHERE groupId=${req.params.group_id} AND userId=${req.userObject.id})`
          ),
          "ourStatus",
        ],
      ],
    });
    console.log(userGroup);
    if (!userGroup) {
      res.statusCode = 404;
      throw {
        message: "Membership couldn't be found",
        statusCode: 404,
      };
    }
    let ob = t.tidy(UserGroup, req.body);
    for (let i in ob) {
      if (ob[i] == null) delete ob[i];
    }
    ob.id = userGroup.dataValues.id;
    if (ob.status == "member") {
      if (
        userGroup.dataValues.organizerId != req.userObject.id &&
        userGroup.dataValues.ourStatus != "co-host"
      ) {
        res.statusCode = 401;
        throw {
          message: "You are not the organizer or a co-host of this Group",
          statusCode: 401,
        };
      }
    }
    if (ob.status == "co-host") {
      if (userGroup.dataValues.organizerId != req.userObject.id) {
        res.statusCode = 401;
        throw {
          message: "You are not the organizer of this Group",
          statusCode: 401,
        };
      }
    }
    if (ob.status == "pending") {
      res.statusCode = 400;
      throw {
        message: "Cannot change a membership status to pending",
        statusCode: 400,
      };
    }
    try {
      await userGroup.update(ob);
    } catch (e) {
      console.log(e);
    }
    delete userGroup.dataValues.updatedAt;
    delete userGroup.dataValues.organizerId;
    userGroup.dataValues.memberId = userGroup.dataValues.userId;
    delete userGroup.dataValues.userId;
    delete userGroup.dataValues.ourStatus;
    res.json(userGroup);
  } catch (e) {
    res.json(e);
  }
});
router.delete("/groups/:group_id/members", authMiddle, async (req, res) => {
  try {
    let userGroup = await UserGroup.findOne({
      where: {
        userId: req.body.memberId,
        groupId: req.params.group_id,
      },
      attributes: [
        "id",
        "userId",
        "groupId",
        "status",
        [
          Sequelize.literal(
            `(SELECT organizerId FROM 'Groups' WHERE id=${req.params.group_id})`
          ),
          "organizerId",
        ],
        [
          Sequelize.literal(
            `(SELECT status FROM 'UserGroups' WHERE groupId=${req.params.group_id} AND userId=${req.userObject.id})`
          ),
          "ourStatus",
        ],
      ],
    });

    if (userGroup) {
      let { ourStatus, organizerId, ...rest } = userGroup.dataValues;
      if (
        ourStatus === "co-host" ||
        req.body.memberId === req.userObject.id ||
        req.userObject.id === organizerId
      ) {
        await userGroup.destroy();
        res.json({
          message: "Successfully deleted membership from group",
        });
      }
    } else {
      res.statusCode = 404;
      throw {
        message: "Membership does not exist for this User",
        statusCode: 404,
      };
    }
  } catch (e) {
    res.json(e);
  }
});
router.get("/events/:event_id/attendees", softAuthMiddle, async (req, res) => {
  try {
    if (req?.userObject?.id == undefined) {
      req.userObject = { id: 0 };
    }
    let userEvent = await UserEvent.findAll({
      where: {
        eventId: req.params.event_id,
      },
      attributes: [
        "id",
        "status",
        [
          Sequelize.literal(
            `(SELECT user.id ||','|| user.firstname||','||user.lastname as fn FROM 'Users' as user WHERE user.id=UserEvent.userId)`
          ),
          "usersList",
        ],
        [
          Sequelize.literal(
            `(SELECT grouped.organizerId FROM 'Groups' as grouped WHERE grouped.id in (SELECT event.groupId FROM 'Events' as event WHERE event.id=UserEvent.eventId))`
          ),
          "organizerId",
        ],
        [
          Sequelize.literal(
            `(SELECT userG.status FROM 'UserGroups' as userG WHERE userG.groupId in (SELECT event.groupId FROM 'Events' as event WHERE event.id=UserEvent.eventId) AND userG.userId = ${req.userObject.id})`
          ),
          "GroupStatus",
        ],
      ],
    });
    console.log("yea");
    let response = { Attendees: [] };

    userEvent.forEach((att) => {
      if (att.dataValues.status === "pending") {
        if (
          att.dataValues.groupStatus != "co-host" &&
          att.dataValues.organizerId != req.userObject.id
        ) {
          return;
        }
      }
      let newOb = {};
      let users = att.dataValues.usersList.split(",");
      newOb.id = users[0];
      newOb.firstName = users[1];
      newOb.lastName = users[2];
      newOb.Attendance = { status: att.dataValues.status };
      response.Attendees.push(newOb);
    });
    res.json(response);
  } catch (e) {
    res.json(e);
  }
});
router.get("/events/:event_id/join", authMiddle, async (req, res) => {
  let event;
  try {
    event = await Event.findOne({ where: { id: req.params.event_id } });
    if (event === null) event.cause.an.error();
  } catch (e) {
    res.statusCode = 404;
    return res.json({
      message: "Event couldn't be found",
      statusCode: 404,
    });
  }
  try {
    let result = await req.userObject.addToEvent(event);

    if (!result.status) {
      res.statusCode = result.statusCode;
      throw {
        message: result.message,
        statusCode: result.statusCode,
      };
    }
    return res.json({
      eventId: Number(req.params.event_id),
      memberId: req.userId,
      status: "pending",
    });
  } catch (e) {
    return res.json(e);
  }
});
router.put("/events/:event_id/attendees", authMiddle, async (req, res) => {
  try {
    let userGroup = await UserEvent.findOne({
      where: {
        userId: req.body.memberId,
        eventId: req.params.event_id,
      },
      attributes: [
        "id",
        "userId",
        "eventId",
        "status",

        [
          Sequelize.literal(
            `(SELECT grouped.organizerId FROM 'Groups' as grouped WHERE grouped.id in (SELECT event.groupId FROM 'Events' as event WHERE event.id=UserEvent.eventId))`
          ),
          "organizerId",
        ],
        [
          Sequelize.literal(
            `(SELECT userG.status FROM 'UserGroups' as userG WHERE userG.groupId in (SELECT event.groupId FROM 'Events' as event WHERE event.id=UserEvent.eventId) AND userG.userId = ${req.userObject.id})`
          ),
          "GroupStatus",
        ],
      ],
    });
    if (!userGroup) {
      res.statusCode = 404;
      throw {
        message: "Attendee for Event couldn't be found",
        statusCode: 404,
      };
    }
    let ob = t.tidy(UserEvent, req.body);
    for (let i in ob) {
      if (ob[i] == null) delete ob[i];
    }
    ob.id = userGroup.dataValues.id;
    if (ob.status == "pending") {
      res.statusCode = 400;
      throw {
        message: "Cannot change a membership status to pending",
        statusCode: 400,
      };
    }
    if (
      userGroup.dataValues.groupStatus == "co-host" ||
      userGroup.dataValues.organizerId == req.userObject.id
    ) {
      await userGroup.update(ob);
    } else {
      res.statusCode = 401;
      throw {
        message: "You are not the organizer or co-host of this Event's Group",
        statusCode: 401,
      };
    }

    delete userGroup.dataValues.updatedAt;
    delete userGroup.dataValues.organizerId;
    userGroup.dataValues.memberId = userGroup.dataValues.userId;
    delete userGroup.dataValues.userId;
    delete userGroup.dataValues.GroupStatus;
    res.json(userGroup);
  } catch (e) {
    res.json(e);
  }
});
router.delete("/events/:event_id/attendees", (req, res) => {});
router.delete("/groups/:group_id/images/:image_id", (req, res) => {});
router.delete("/events/:event_id/images/:image_id", (req, res) => {});
router.get("/events", (req, res) => {});

module.exports = router;
