import { useParams } from "react-router-dom";
import * as searchActions from "../store/search";
import { Redirect } from "react-router-dom";
import { useDispatch, useSelector, useStore } from "react-redux";
import { useEffect, useState } from "react";
import "./groupPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faLocationArrow,
  faPeopleArrows,
  faU,
  faArrowLeft as faBackward,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
library.add(faLocationArrow, faPeopleArrows, faUser, faBackward);
function GroupPage() {
  const sessionUser = useSelector((state) => state.session.user);

  const [current, setCurrent] = useState("About");
  const [group, setGroup] = useState([]);
  const [preview, setPreview] = useState();
  const [organizer, setOrganizer] = useState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [redir, setRedir] = useState("");
  const dispatch = useDispatch();
  const params = useParams();
  const groupId = params.groupId;
  console.log(params, "params");
  useEffect(() => {
    console.log(sessionUser, "sessionUser");
  }, [sessionUser]);
  useEffect(() => {
    async function getGroup() {
      let group = await dispatch(searchActions.getGroupById(groupId));
      setGroup(group);
      setOrganizer(group.Organizer);
      for (let im of group.GroupImages) {
        if (im.preview) {
          setPreview("/imagebin/" + im.url);
        }
      }

      if (sessionUser?.id === organizer?.id) {
        setIsAdmin(true);
      }
    }
    getGroup();

    console.log(group, "group");
  }, [dispatch, groupId, sessionUser]);
  const deleteGroup = async () => {
    const res = await dispatch(searchActions.deleteGroup(groupId));
    console.log("RES", res);
    if (res.statusCode === 200) {
      setRedir(<Redirect to="/dashboard"></Redirect>);
    }
  };
  const updateGroup = async (e) => {
    e.preventDefault();
    const res = await dispatch(
      searchActions.updateGroup(
        {
          name: e.target[0].value,
          about: e.target[1].value,
          city: e.target[2].value,
          state: e.target[3].value,
        },
        groupId
      )
    );
    console.log("RES", res);
    if (res.id) {
      setRedir(<Redirect to="/dashboard"></Redirect>);
    }
  };

  const renderPage = () => {
    switch (current) {
      case "About":
        return (
          <>
            <h1>About this group:</h1>
            {group.about}
          </>
        );

      case "Members":
        return <div>Members</div>;
      case "Events":
        return <div>Events</div>;
      case "Photos":
        return <div>Photos</div>;

      case "Admin":
        return (
          <div className="groupPageAdminPanel">
            {redir}
            <h3>Admin Panel</h3>
            <button onClick={() => setCurrent("Update")}>Update Group</button>
            <button onClick={deleteGroup}>Delete Group</button>
          </div>
        );
      case "Update":
        return (
          <div>
            {redir}
            <form onSubmit={updateGroup}>
              <label>Group Name</label>
              <input type="text" placeholder={group.name}></input>
              <label>Group Description</label>
              <textarea
                style={{ display: "block" }}
                type="text"
                placeholder={group.about}
              ></textarea>
              <label>Group Location</label>
              <input type="text" placeholder={group.city}></input>
              <input type="text" placeholder={group.state}></input>
              <button>Update Group</button>
            </form>
          </div>
        );
    }
  };
  return (
    <>
      {redir}
      <div className="groupPageContent">
        <div className="groupPageGreet">
          <div className="groupPagePreviewImage">
            <img src={preview}></img>
          </div>

          <div className="groupPageGreetingCard">
            <div
              onClick={() => setRedir(<Redirect to="/dashboard"></Redirect>)}
              className="groupPageBackButton"
            >
              <FontAwesomeIcon icon={faBackward}></FontAwesomeIcon>
            </div>
            <div className="groupPageName">{group?.name} </div>
            <div className="groupPageMiscInfo">
              <div className="groupPageLocation">
                <FontAwesomeIcon icon={faLocationArrow}></FontAwesomeIcon>
                {group?.city + ", " + group?.state}
              </div>

              <div className="groupPageMemberCount">
                <FontAwesomeIcon icon={faPeopleArrows}></FontAwesomeIcon>
                {group?.numMembers} members
              </div>
              <div className="groupPageOrganizer">
                <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>
                Organized By <b>{organizer?.firstname}</b>
              </div>
            </div>
          </div>
        </div>
        <div className="groupPageBorder"></div>
        <div className="groupPageMenuBar">
          <div className="groupPageMenu">
            <div
              className={
                current == "About"
                  ? "groupPageMenuButton selected"
                  : "groupPageMenuButton"
              }
              onClick={() => setCurrent("About")}
            >
              About
            </div>
            <div
              className={
                current == "Events"
                  ? "groupPageMenuButton selected"
                  : "groupPageMenuButton"
              }
              onClick={() => setCurrent("Events")}
            >
              Events
            </div>
            <div
              className={
                current == "Members"
                  ? "groupPageMenuButton selected"
                  : "groupPageMenuButton"
              }
              onClick={() => setCurrent("Members")}
            >
              Members
            </div>
            <div
              className={
                current == "Photos"
                  ? "groupPageMenuButton selected"
                  : "groupPageMenuButton"
              }
              onClick={() => setCurrent("Photos")}
            >
              Photos
            </div>
            {isAdmin && (
              <div
                className={
                  current == "Admin"
                    ? "groupPageMenuButton selected"
                    : "groupPageMenuButton"
                }
                onClick={() => setCurrent("Admin")}
              >
                Admin
              </div>
            )}
          </div>
          <div className="groupPageMenuButton Join">Join Group</div>
        </div>
        <div className="groupPageMenuContent">{renderPage()}</div>
      </div>
    </>
  );
}

export default GroupPage;
