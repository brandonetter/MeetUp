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
  try {
    ob = t.tidy(User, req.body);
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
router.get("/groups/:group_id/venues", authMiddle, async (req, res) => {
  try {
    let group = await Group.findOne({
      where: {
        id: req.params.group_id,
      },
      attributes: [
        "id",
        "organizerId",
        [
          Sequelize.literal(
            `(SELECT "ug"."status" FROM "UserGroups" as "ug" WHERE "ug"."groupId"=${Number(
              req.params.group_id
            )} AND "ug"."userId"=${req.userObject.id})`
          ),
          "ourStatus",
        ],
      ],
    });

    if (!group) {
      res.statusCode = 404;
      throw { message: "Group Not Found" };
    }
    if (
      group.dataValues.ourStatus != "co-host" &&
      group.dataValues.ourStatus != "member" &&
      group.dataValues.organizerId != req.userObject.id
    ) {
      res.statusCode = 401;
      throw { message: "You are not the Organizer or Co-host" };
    }
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
    if (!group) {
      res.statusCode = 404;
      throw {
        Error: "Group Does Not Exist",
      };
    }
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
      attributes: [
        "id",
        "groupId",
        "address",
        "city",
        "state",
        "lat",
        "lng",
        [
          Sequelize.literal(
            `(SELECT "g"."organizerId" from "Groups" as "g" where "g"."id"="Venue"."groupId")`
          ),
          "organizerId",
        ],
        [
          Sequelize.literal(
            `(SELECT "ug"."status" from "UserGroups" as "ug" WHERE "ug"."groupId"="Venue"."groupId" AND "ug"."userId"=${req.userObject.id})`
          ),
          "ourStatus",
        ],
      ],
    });
    if (!venue) {
      res.statusCode = 404;
      throw {
        message: "Venue couldn't be found",
        statusCode: 404,
      };
    }
    let { ourStatus, organizerId } = venue.dataValues;
    if (organizerId != req.userObject.id && ourStatus != "co-host") {
      res.statusCode = 401;
      throw {
        message: "You are not the Organizer or the co-host for this Group",
      };
    }
    delete venue.dataValues.ourStatus;
    delete venue.dataValues.organizerId;
    let ob = t.tidy(Venue, req.body);

    for (let i in ob) {
      if (ob[i] == null) delete ob[i];
    }
    ob.id = venue.id;
    ob.groupId = venue.groupId;
    try {
      await venue.update(ob);
    } catch (e) {}
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
        delete x?.dataValues?.createdAt;
        delete x?.dataValues?.updatedAt;
        return x;
      })
    );
    res.json({ Events: events });
  } catch (e) {
    res.json(e);
  }
});

router.get("/groups/:group_id/events", async (req, res) => {
  //get all events based on group ID
  try {
    let group = await Group.findOne({
      where: {
        id: req.params.group_id,
      },
    });
    if (!group) {
      res.statusCode = 404;
      throw { message: "Group Not Found" };
    }
    group.getEvents().then((events) => {
      res.json({ Events: events });
    });
  } catch (e) {
    res.json(e);
  }
});
router.get("/events/:event_id", async (req, res) => {
  //return event based on event id
  try {
    let event = await Event.findOne({
      where: {
        id: req.params.event_id,
      },
    });
    if (!event) {
      res.statusCode = 404;
      throw {
        message: "Event Not Found",
      };
    }
    let { createdAt, updatedAt, ...rest } = event.dataValues;
    res.json(rest);
  } catch (e) {
    res.json(e);
  }
});
router.post("/groups/:group_id/events", authMiddle, async (req, res) => {
  try {
    let group = await Group.findOne({
      where: {
        id: req.params.group_id,
      },
      attributes: [
        "id",
        "organizerId",
        [
          Sequelize.literal(
            `(SELECT "venue"."id" FROM "Venues" as "venue" WHERE "venue"."id"=${Number(
              req.body.venueId
            )})`
          ),
          "venue",
        ],
      ],
    });
    if (!group) {
      res.statusCode = 404;
      throw { message: "Group not found" };
    }
    if (group.organizerId != req.userId)
      throw { Error: "You are not the Group Organizer" };
    if (group.dataValues.venue == null) {
      res.statusCode = 400;
      throw { message: "Venue does not exist" };
    }
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
    let event = await Event.findOne({
      where: {
        id: ob.eventId,
      },
    });
    if (!event) {
      res.statusCode = 404;
      throw { message: "Event couldn't be found" };
    }
    let result = await Event.addNewImage(ob);

    res.json(result);
  } catch (e) {
    res.statusCode = e.statusCode || 404;
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
    delete event.dataValues.createdAt;
    delete event.dataValues.updatedAt;
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
      res.statusCode = result.statusCode || 200;
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
            `(SELECT "organizerId" FROM "Groups" WHERE "id"=${req.params.group_id})`
          ),
          "organizerId",
        ],
        [
          Sequelize.literal(
            `(SELECT "status" FROM 'UserGroups' WHERE "groupId"=${req.params.group_id} AND "userId"=${req.userObject.id})`
          ),
          "ourStatus",
        ],
      ],
    });

    let oldStatus = userGroup?.status;
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
      let group = await Group.findOne({
        where: {
          id: userGroup.groupId,
        },
      });
      if (oldStatus === "pending") group.numMembers += 1;
      await group.save();
    } catch (e) {}
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
            `(SELECT "organizerId" FROM 'Groups' WHERE "id"=${req.params.group_id})`
          ),
          "organizerId",
        ],
        [
          Sequelize.literal(
            `(SELECT "status" FROM 'UserGroups' WHERE "groupId"=${req.params.group_id} AND "userId"=${req.userObject.id})`
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
        let grup = await Group.findOne({
          where: {
            id: userGroup.groupId,
          },
        });
        grup.numMembers -= 1;
        await grup.save();
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
        "userId",
        "eventId",
        [
          Sequelize.literal(
            `(SELECT "user"."id" ||','|| "user"."firstname"||','||"user"."lastname" as "fn" FROM "Users" as "user" WHERE "user"."id"="UserEvent"."userId")`
          ),
          "usersList",
        ],
        [
          Sequelize.literal(
            `(SELECT "grouped"."organizerId" FROM "Groups" as "grouped" WHERE "grouped"."id" in (SELECT "event"."groupId" FROM "Events" as "event" WHERE "event"."id"="UserEvent"."eventId"))`
          ),
          "organizerId",
        ],
        [
          Sequelize.literal(
            `(SELECT "userG"."status" FROM "UserGroups" as "userG" WHERE "userG"."groupId" in (SELECT "event"."groupId" FROM "Events" as "event" WHERE "event"."id"="UserEvent"."eventId") AND "userG"."userId" = ${Number(
              req.userObject.id
            )})`
          ),
          "GroupStatus",
        ],
      ],
    });
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
            `(SELECT "grouped"."organizerId" FROM "Groups" as "grouped" WHERE "grouped"."id" in (SELECT "event"."groupId" FROM "Events" as "event" WHERE "event"."id"="UserEvent"."eventId"))`
          ),
          "organizerId",
        ],
        [
          Sequelize.literal(
            `(SELECT "userG"."status" FROM "UserGroups" as "userG" WHERE "userG"."groupId" in (SELECT "event"."groupId" FROM "Events" as "event" WHERE "event"."id"="UserEvent"."eventId") AND "userG"."userId" = ${req.userObject.id})`
          ),
          "GroupStatus",
        ],
      ],
    });
    let oldStatus = userGroup.dataValues.status;
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
      if (oldStatus == "pending") {
        let event = await Event.findOne({
          where: {
            id: userGroup.data.id,
          },
        });
        event.numAttending += 1;
        await event.save();
      }
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
    res.statusCode = 404;
    res.json({
      message: "Event Could Not Be Found",
      statusCode: 404,
    });
  }
});
router.delete("/events/:event_id/attendees", authMiddle, async (req, res) => {
  try {
    let userGroup = await UserEvent.findOne({
      where: {
        userId: req.body.userId,
        eventId: req.params.event_id,
      },
      attributes: [
        "id",
        "userId",
        "eventId",
        "status",

        [
          Sequelize.literal(
            `(SELECT "grouped"."organizerId" FROM 'Groups' as "grouped" WHERE "grouped"."id" in (SELECT "event"."groupId" FROM 'Events' as "event" WHERE "event"."id"="UserEvent"."eventId"))`
          ),
          "organizerId",
        ],
        [
          Sequelize.literal(
            `(SELECT "userG"."status" FROM 'UserGroups' as "userG" WHERE "userG"."groupId" in (SELECT "event"."groupId" FROM 'Events' as "event" WHERE "event"."id"="UserEvent"."eventId") AND "userG"."userId" = ${req.userObject.id})`
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

    if (
      userGroup.dataValues.groupStatus == "co-host" ||
      userGroup.dataValues.organizerId == req.userObject.id ||
      userGroup.dataValues.userId == req.userObject.id
    ) {
      let event = await Event.findOne({
        where: {
          id: userGroup.eventId,
        },
      });
      event.numAttending -= 1;
      await event.save();
      await userGroup.destroy();
    } else {
      res.statusCode = 401;
      throw {
        message: "Only the User or organizer may delete an Attendance",
        statusCode: 403,
      };
    }

    res.json({
      message: "Successfully deleted attendance from event",
    });
  } catch (e) {
    res.json(e);
  }
});
router.delete(
  "/groups/:group_id/images/:image_id",
  authMiddle,
  async (req, res) => {
    //remove entry from Image table
    try {
      let im = await Image.findOne({
        where: { id: req.params.image_id, groupId: req.params.group_id },
        attributes: [
          "id",
          [
            Sequelize.literal(
              `(SELECT "grouped"."organizerId" FROM "Groups" as "grouped" WHERE "grouped"."id" = ${Number(
                req.params.group_id
              )})`
            ),
            "organizerId",
          ],
          [
            Sequelize.literal(
              `(SELECT "userG"."status" FROM "UserGroups" as "userG" WHERE "userG"."groupId"=${Number(
                req.params.group_id
              )} AND "userG"."userId" = ${req.userObject.id})`
            ),
            "GroupStatus",
          ],
        ],
      });

      if (
        im.dataValues.organizerId == req.userObject.id ||
        im.dataValues.GroupStatus == "co-host"
      ) {
        await im.destroy();

        res.json({
          message: "Successfully deleted",
          statusCode: 200,
        });
      } else {
        res.json({
          message:
            "You are not the Organizer or Co-Host for the Group this Image belongs to.",
          statusCode: 401,
        });
      }
    } catch (e) {
      res.json({
        message: "Group Image couldn't be found",
        statusCode: 404,
      });
    }
  }
);

router.delete(
  "/events/:event_id/images/:image_id",
  authMiddle,
  async (req, res) => {
    try {
      let im = await Image.findOne({
        where: { id: req.params.image_id, eventId: req.params.event_id },
        attributes: [
          "id",
          [
            Sequelize.literal(
              `(SELECT "grouped"."organizerId" FROM "Groups" as "grouped" WHERE "grouped"."id" in (SELECT "groupId" from "Events" WHERE id = ${Number(
                req.params.event_id
              )}))`
            ),
            "organizerId",
          ],
          [
            Sequelize.literal(
              `(SELECT "userG"."status" FROM "UserGroups" as "userG" WHERE "userG"."groupId" in (SELECT "groupId" from "Events" WHERE id = ${Number(
                req.params.event_id
              )}) AND "userG"."userId" = ${req.userObject.id})`
            ),
            "GroupStatus",
          ],
        ],
      });
      if (
        im.dataValues.organizerId == req.userObject.id ||
        im.dataValues.GroupStatus == "co-host"
      ) {
        await im.destroy();

        res.json({
          message: "Successfully deleted",
          statusCode: 200,
        });
      } else {
        res.json({
          message:
            "You are not the Organizer or Co-Host for the Group this Image belongs to.",
          statusCode: 401,
        });
      }
    } catch (e) {
      res.json({
        message: "Event Image couldn't be found",
        statusCode: 404,
      });
    }
  }
);
router.get("/events", async (req, res) => {
  try {
    //input validation
    let errors = paginateValidation(req.query);
    if (errors.length) {
      throw errors;
    }
    //end input validation
    let {
      page = 0,
      size = 0,
      name = false,
      type = false,
      startDate = false,
    } = req.query;

    let events = await Event.findAll({
      limit: size,
      offset: size * page,
      where: {
        ...(name && { name: { [Sequelize.Op.like]: `%${name}%` } }),
        ...(type && { type: type }),
        ...(startDate && { startDate: { [Sequelize.Op.gte]: startDate } }),
      },

      attributes: [
        "id",
        "groupId",
        "venueId",
        "name",
        "type",
        "startDate",
        "endDate",
        "numAttending",
        [
          Sequelize.literal(
            `(SELECT "im"."url" from "Images" as "im" WHERE "im"."eventId" = "Event"."id" AND "im"."preview" = TRUE )`
          ),
          "previewImage",
        ],
        [
          Sequelize.literal(
            `(SELECT "g"."id"||','||"g"."name"||','||"g"."city"||','||"g"."state" as "f" from "Groups" as "g" WHERE "id" = "Event"."groupId")`
          ),
          "Group",
        ],
        [
          Sequelize.literal(
            `(SELECT "id"||','||"city"||','||"state" as "f" from "Venues" WHERE "groupId" = "Event"."groupId" LIMIT 1)`
          ),
          "Venue",
        ],
      ],
    });
    events.forEach((evt) => {
      if (!evt.dataValues.Group) return;

      let g = evt.dataValues.Group.split(",");
      evt.dataValues.Group = {
        id: g[0],
        name: g[1],
        city: g[2],
        state: g[3],
      };
    });
    events.forEach((evt) => {
      if (!evt.dataValues.Venue) return;

      let g = evt.dataValues.Venue.split(",");
      evt.dataValues.Venue = {
        id: g[0],
        city: g[1],
        state: g[2],
      };
    });
    res.json({ Events: events });
  } catch (e) {
    res.json(e);
  }
});

function paginateValidation(query) {
  let req = { query: query };
  let errors = [];
  for (let key in req.query) {
    let k = key.toLowerCase();
    switch (true) {
      case k == "page" || k == "size":
        if (
          !(Number(req.query[key]) >= 0) ||
          Number(req.query[key] > (k == "size" ? 20 : 10))
        ) {
          errors.push(
            key +
              " must be greater than or equal to 0 and less than " +
              (k == "size" ? 20 : 10)
          );
        }
        break;
      case k == "type":
        if (req.query[key] != "Online" && req.query[key] != "In Person") {
          errors.push("Type must be 'Online' or 'In Person'");
        }
        break;
      case k == "startdate":
        let d = new Date(req.query[key]);
        if (!(d instanceof Date && isFinite(d))) {
          errors.push("startDate must be a valid datetime");
        }
    }
  }
  return errors;
}
module.exports = router;
