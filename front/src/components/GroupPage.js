import { useParams } from "react-router-dom";
import * as searchActions from "../store/search";
import { Redirect } from "react-router-dom";
import { useDispatch, useSelector, useStore } from "react-redux";
import { useEffect, useState } from "react";
import "./groupPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHistory } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faLocationArrow,
  faPeopleArrows,
  faInfoCircle,
  faArrowLeft as faBackward,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import GMap from "./GMap";
import ImageCar from "./ImageCar";
import demoImage from "../images/placeholder.png";

library.add(faLocationArrow, faPeopleArrows, faUser, faBackward, faInfoCircle);
function GroupPage() {
  const [markerPos, setMarkerPos] = useState([40, -100]);
  const history = useHistory();
  const setGMapPosition = (e) => {
    getAddress(e.latLng.lat(), e.latLng.lng());
    setMarkerPos([e.latLng.lat(), e.latLng.lng()]);
  };
  const sessionUser = useSelector((state) => state.session.user);
  const [groupEvents, setGroupEvents] = useState([]);
  const [current, setCurrent] = useState("About");
  const [group, setGroup] = useState([]);
  const [preview, setPreview] = useState();
  const [organizer, setOrganizer] = useState();
  const [members, setMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [redir, setRedir] = useState("");
  const [pendingMembers, setPendingMembers] = useState([]);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(40);
  const [long, setLong] = useState(-100);
  const [groupImages, setGroupImages] = useState([]);
  const [ourStatus, setOurStatus] = useState("");
  const dispatch = useDispatch();
  const params = useParams();
  const groupId = params.groupId;

  const confirmPending = async (user_id) => {
    const response = await dispatch(
      searchActions.confirmPending(groupId, user_id)
    );
    if (response.id) {
      history.go(0);
    }
  };
  const removePending = async (user_id) => {
    const response = await dispatch(
      searchActions.removePending(groupId, user_id)
    );

    if (response.message) {
      history.go(0);
    }
  };

  const submitJoin = async (e) => {
    e.preventDefault();
    const response = await dispatch(searchActions.joinGroup(groupId));
    if (response === "success") {
      setOurStatus("pending");
    }
    history.go(0);
  };
  const submitLeave = async (e) => {
    e.preventDefault();
    const response = await dispatch(
      searchActions.leaveGroup(groupId, sessionUser.id)
    );
    if (response === "success") {
      setOurStatus("");
    }
    history.go(0);
  };

  const isAdminToolTip = (opacity) => {
    let div = document.getElementById("isAdminToolTip");
    div.style.opacity = opacity;
  };
  async function getAddress(
    lat,
    long,
    key = "AIzaSyDdrCHNzGnQUz1HQOwfA7jZZsIjo7ZHvOY"
  ) {
    let res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${key}`
    );
    res = await res.json();
    setLat(lat);
    setLong(long);
    for (let r of res.results) {
      //search for the state
      for (let a of r.address_components) {
        if (a.types.includes("administrative_area_level_1")) {
          setState(a.short_name);
        }
      }
      //search for the city
      for (let a of r.address_components) {
        if (a.types.includes("locality")) {
          setCity(a.long_name);
        }
      }
      let address = "";
      for (let a of r.address_components) {
        if (a.types.includes("street_number")) {
          address = a.long_name;
        }
      }
      //search for the street address
      for (let a of r.address_components) {
        if (a.types.includes("route")) {
          address += " " + a.long_name;
        }
      }
      if (address) setAddress(address);
      //search for the street number
    }
  }
  useEffect(() => {
    async function getGroupEvents() {
      let events = await dispatch(searchActions.getGroupEvents(groupId));
      setGroupEvents(events.Events);
    }
    getGroupEvents();
    async function getGroup() {
      let group = await dispatch(searchActions.getGroupById(groupId));
      setGroup(group);
      setGroupImages(group.GroupImages);
      setOrganizer(group.Organizer);
      let membersList = await dispatch(
        searchActions.getMembersByGroupId(groupId)
      );
      //Search membersList.Users to see if the current user is a member
      let pendingMembers = [];
      for (let m of membersList.Users) {
        if (m.id === sessionUser?.id) {
          console.log(m.Membership.status);
          setOurStatus(m.Membership.status);
        }
        if (m.Membership.status === "pending") pendingMembers.push(m);
      }
      setPendingMembers(pendingMembers);

      setMembers(membersList.Users);
      let foundPreview = false;
      for (let im of group.GroupImages) {
        if (im.preview) {
          foundPreview = true;
          setPreview("/imagebin/" + im.url);
        }
      }
      if (!foundPreview) {
        setPreview(demoImage);
      }
      if (sessionUser?.id === group?.organizerId && sessionUser.id) {
        setIsAdmin(true);
      }
    }
    getGroup();
  }, [dispatch, groupId, sessionUser]);
  const deleteGroup = async () => {
    const res = await dispatch(searchActions.deleteGroup(groupId));
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
    if (res.id) {
      setRedir(<Redirect to="/dashboard"></Redirect>);
    }
  };

  const addVenue = async (e) => {
    e.preventDefault();
    const res = await dispatch(
      searchActions.addVenue(
        {
          address: address,
          city: city,
          state: state,
          lat: lat,
          lng: long,
        },
        groupId
      )
    );
  };
  const renderPage = () => {
    switch (current) {
      case "About":
        return (
          <>
            <div className="groupPageAdminPanel">
              <h1>About this group:</h1>
              {group.about}
            </div>
          </>
        );

      case "Members":
        return (
          <div className="groupPageAdminPanel">
            <h1>Members</h1>
            {members.map((m) => (
              <div key={m.id}>
                <div>
                  {m.firstname} {m.lastname}{" "}
                  {m.Membership.status === "pending" && (
                    <span className="pending">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      case "ManageMembers":
        return (
          <div className="groupPageAdminPanel">
            <h1>Pending Members</h1>
            {pendingMembers.map((m) => (
              <div key={m.id}>
                <div>
                  {m.firstname} {m.lastname}{" "}
                  {m.Membership.status === "pending" && (
                    <div className="pendingControls">
                      <button onClick={() => confirmPending(m.id)}>Add</button>
                      <button onClick={() => removePending(m.id)}>
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      case "Events":
        return (
          <div className="groupPageAdminPanel">
            <h1>Events</h1>
            {redir}
            {groupEvents.map((e) => (
              <div
                className="myEventListItem"
                key={e.id}
                onClick={() =>
                  setRedir(<Redirect to={`/events/${e.id}`}></Redirect>)
                }
              >
                <h3>{e.name}</h3>
              </div>
            ))}
          </div>
        );
      case "Photos":
        return (
          <div className="groupPageAdminPanel">
            <div>Photos</div>
            <ImageCar eventImages={groupImages} />
          </div>
        );

      case "Admin":
        return (
          <div className="groupPageAdminPanel">
            {redir}
            <h3>Admin Panel</h3>
            <button onClick={() => setCurrent("Update")}>Update Group</button>
            <button onClick={deleteGroup}>Delete Group</button>
            <button onClick={() => setCurrent("Venue")}>Add Venue</button>
            <button onClick={() => setCurrent("ManageMembers")}>
              Manage Members
            </button>
          </div>
        );
      case "Venue":
        return (
          <div className="groupPageAdminPanel">
            {redir}
            <h3>Add Venue</h3>
            <form onSubmit={addVenue}>
              <label>Venue Name</label>
              <GMap
                draggable
                markerPosition={markerPos}
                onClick={setGMapPosition}
              />
              <label>Venue Location</label>
              <input type="text" value={city} disabled></input>
              <input type="text" value={state} disabled></input>
              <input type="text" value={address} disabled></input>
              <input type="text" value={lat} disabled></input>
              <input type="text" value={long} disabled></input>
              <button>Add Venue</button>
            </form>
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

          <div className="isAdminToolTip" id="isAdminToolTip">
            <FontAwesomeIcon icon={faInfoCircle}></FontAwesomeIcon>
            <div className="isAdminToolTipText">
              You are the organizer of this group, To leave this group, you must
              first transfer ownership to another member.
            </div>
          </div>
          {isAdmin ? (
            <div
              className="groupPageMenuButton JoinDisabled"
              onMouseOver={() => isAdminToolTip("1")}
              onMouseOut={() => isAdminToolTip("0")}
            >
              Leave Group
            </div>
          ) : ourStatus === "member" ? (
            <div className="groupPageMenuButton Leave" onClick={submitLeave}>
              Leave Group
            </div>
          ) : ourStatus === "pending" ? (
            <div className="groupPageMenuButton Join" onClick={submitLeave}>
              Cancel Request
            </div>
          ) : (
            <div className="groupPageMenuButton Join" onClick={submitJoin}>
              Join Group
            </div>
          )}
        </div>
        <div className="groupPageMenuContent">{renderPage()}</div>
      </div>
    </>
  );
}

export default GroupPage;
