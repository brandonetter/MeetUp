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
import GMap from "./GMap";

library.add(faLocationArrow, faPeopleArrows, faUser, faBackward);
function GroupPage() {
  const [markerPos, setMarkerPos] = useState([40, -100]);
  const setGMapPosition = (e) => {
    getAddress(e.latLng.lat(), e.latLng.lng());
    setMarkerPos([e.latLng.lat(), e.latLng.lng()]);
  };
  const sessionUser = useSelector((state) => state.session.user);

  const [current, setCurrent] = useState("About");
  const [group, setGroup] = useState([]);
  const [preview, setPreview] = useState();
  const [organizer, setOrganizer] = useState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [redir, setRedir] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(40);
  const [long, setLong] = useState(-100);

  const dispatch = useDispatch();
  const params = useParams();
  const groupId = params.groupId;
  console.log(params, "params");
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
          console.log(a.long_name, "state");
          setState(a.short_name);
        }
      }
      //search for the city
      for (let a of r.address_components) {
        if (a.types.includes("locality")) {
          console.log(a.long_name, "city");
          setCity(a.long_name);
        }
      }
      let address = "";
      for (let a of r.address_components) {
        if (a.types.includes("street_number")) {
          console.log(a.long_name, "number");
          address = a.long_name;
        }
      }
      //search for the street address
      for (let a of r.address_components) {
        if (a.types.includes("route")) {
          console.log(a.long_name, "street");
          address += " " + a.long_name;
        }
      }
      if (address) setAddress(address);
      //search for the street number
    }
  }
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

      console.log(sessionUser?.id, "sessionUser?.id");
      console.log(organizer?.id, "organizer?.id");
      console.log(group, "group");
      if (sessionUser?.id === group?.organizerId && sessionUser.id) {
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
            <div>Members</div>
          </div>
        );
      case "Events":
        return (
          <div className="groupPageAdminPanel">
            <div>Events</div>
          </div>
        );
      case "Photos":
        return (
          <div className="groupPageAdminPanel">
            <div>Photos</div>
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
          <div className="groupPageMenuButton Join">Join Group</div>
        </div>
        <div className="groupPageMenuContent">{renderPage()}</div>
      </div>
    </>
  );
}

export default GroupPage;
