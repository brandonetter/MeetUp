import "./Header.css";
import logo from "../images/logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import Calender from "./Calender";
import {
  faUser,
  faRightToBracket,
  faBell,
  faComments,
  faCircleUser,
  faPersonCirclePlus,
  faCircleXmark,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import Login from "./login";
import * as sessionActions from "../store/session";
import * as searchActions from "../store/search";
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "./SearchBar";

import {
  GoogleMap,
  useJSApiLoader,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import { useState, useEffect, useRef } from "react";
import GMap from "./GMap";
library.add(
  faUser,
  faRightToBracket,
  faBell,
  faComments,
  faCircleUser,
  faCircleXmark,
  faPersonCirclePlus,
  faLocationDot
);
function Header() {
  const stateSelect = useRef(null);
  const citySelect = useRef(null);
  const [markerPosition, setMarkerPosition] = useState([35, -80.2]);
  const sessionUser = useSelector((state) => state.session.user);
  const [addGroupModal, setAddGroupModal] = useState(false);
  const [addEventModal, setAddEventModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [venues, setVenues] = useState([]);
  const [showCal, setShowCal] = useState(false);
  const [startDate, setStartDate] = useState("0/0/0");
  const [endDate, setEndDate] = useState("0/0/0");
  const location = useLocation().pathname;
  const dispatch = useDispatch();
  const toggleShowCal = () => {
    setShowCal(!showCal);
  };

  const updateDate = (startDate, endDate) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };
  useEffect(() => {
    async function getUserGroups() {
      let userGroups = await dispatch(searchActions.getUserGroups());
      //filter groups where the user ID doesn't match the organizer ID
      if (!userGroups) return;
      userGroups = userGroups.filter(
        (group) => group.organizerId === sessionUser?.id
      );

      setUserGroups(userGroups);
    }
    getUserGroups();
  }, [addEventModal]);
  const listOfUSStates = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];
  async function getAddress(
    lat,
    long,
    key = "AIzaSyDdrCHNzGnQUz1HQOwfA7jZZsIjo7ZHvOY"
  ) {
    let res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${key}`
    );
    res = await res.json();
    for (let r of res.results) {
      //search for the state
      for (let a of r.address_components) {
        if (a.types.includes("administrative_area_level_1")) {
          stateSelect.current.value = a.short_name;
        }
      }
      //search for the city
      for (let a of r.address_components) {
        if (a.types.includes("locality")) {
          citySelect.current.value = a.short_name;
        }
      }
    }
  }
  const submitEvent = async (e) => {
    e.preventDefault();
    const formData = {};
    formData.name = e?.target[2].value;
    formData.type = e?.target[4].value;
    formData.description = e?.target[3].value;
    formData.startDate = startDate;
    formData.endDate = endDate;
    formData.venueId = e?.target[1].value;
    formData.groupId = e?.target[0].value;
    formData.capacity = e?.target[5].value;
    formData.price = e?.target[6].value;
    const event = dispatch(searchActions.addEvent(formData, formData.groupId));
    setAddEventModal(false);
  };

  const submitGroup = async (e) => {
    e.preventDefault();
    const imageUpload = e.target[3]?.files[0];
    const formData = {};
    if (imageUpload) {
      //send image to /apiv1/uploadImage
      //get the url back
      //add the url to the form data
      const response = await dispatch(sessionActions.uploadImage(imageUpload));
      formData.preview = response.url;

      //dispatch(sessionActions.addGroup(formData));
    }
    formData.about = e?.target[1].value;
    formData.name = e?.target[0].value;
    formData.type = e?.target[2].value;
    formData.state = stateSelect.current.value;
    formData.private = "false";
    formData.city = citySelect.current.value;
    dispatch(sessionActions.addGroup(formData));

    toggleGroupModal();
  };

  const showFile = (e) => {
    setCurrentImage(URL.createObjectURL(e.target.files[0]));
  };
  const toggleGroupModal = () => {
    window.scrollTo(0, 0);
    setScroll(addGroupModal);
    setAddGroupModal(!addGroupModal);
  };
  const toggleEventModal = () => {
    setAddEventModal(!addEventModal);
  };
  const setGMapPosition = (e) => {
    getAddress(e.latLng.lat(), e.latLng.lng());
    setMarkerPosition([e.latLng.lat(), e.latLng.lng()]);
  };
  const getVenues = async (e) => {
    //get current id of selected group
    //get current id of selected group from e
    let groupId = e.target.value;

    // use searchAction to get venues
    let res = await dispatch(searchActions.getGroupVenues(groupId));
    setVenues(res.Venues);
  };

  function setScroll(bool) {
    bool
      ? document.body.classList.remove("stop-scrolling")
      : document.body.classList.add("stop-scrolling");
  }

  return (
    <div className={"HeaderDiv " + (location !== "/" ? "loggedIn" : "")}>
      <img src={logo} alt="logo" />
      {location != "/" && <SearchBar type="Groups"></SearchBar>}
      <div className="menuHeader">
        {location != "/" && (
          <>
            <span className="iconButton" onClick={toggleEventModal}>
              <FontAwesomeIcon icon={faLocationDot}></FontAwesomeIcon>
              <span>Add Event</span>
            </span>
            <span className="iconButton" onClick={toggleGroupModal}>
              <FontAwesomeIcon icon={faPersonCirclePlus}></FontAwesomeIcon>
              <span>Add Group</span>
            </span>
          </>
        )}
        <span className="userButton">
          <Login />
        </span>
      </div>
      {addGroupModal && (
        <div className="headerModal">
          <div className="headerModalContent">
            <div className="headerModalHeader">
              <span className="headerModalTitle">Add Group</span>
              <span className="modalClose" onClick={toggleGroupModal}>
                <FontAwesomeIcon
                  icon={faCircleXmark}
                  className="xButton"
                ></FontAwesomeIcon>
              </span>
            </div>
            <form className="headerModalForm" onSubmit={submitGroup}>
              <label className="headerModalLabel">Group Name</label>
              <input className="headerModalInput"></input>
              <label className="headerModalLabel">Group Description</label>
              <textarea className="headerModalInput"></textarea>
              <label className="headerModalLabel">Group Type</label>
              <select name="type" className="headerModalInput select">
                <option value="Online">Online</option>
                <option value="In person">In Person</option>
              </select>
              <div className="headerModalGroup">
                <div className="small">
                  <label className="headerModalLabel">Group Image</label>
                  <input
                    type="file"
                    className="headerModalInput"
                    onChange={showFile}
                  ></input>
                </div>
                <div className="small">
                  {currentImage && (
                    <img
                      src={currentImage}
                      alt="groupImage"
                      className="prevImage"
                    ></img>
                  )}
                  <GMap
                    markerPosition={markerPosition}
                    onClick={setGMapPosition}
                  />
                </div>
              </div>

              <label className="headerModalLabel">Location</label>
              <div className="small row">
                <select
                  name="state"
                  className="headerModalInput select"
                  ref={stateSelect}
                >
                  {listOfUSStates.map((state) => (
                    <option value={state}>{state}</option>
                  ))}
                </select>

                <input
                  className="headerModalInput"
                  placeholder="City"
                  ref={citySelect}
                ></input>
              </div>
              <button
                type="submit"
                className="headerModalButton"
                value="Add Group"
              >
                Add group
              </button>
            </form>
          </div>
        </div>
      )}
      {addEventModal && (
        <div className="headerModal">
          <div className="headerModalContent">
            <div className="headerModalHeader">
              <span className="headerModalTitle">Event</span>

              <span className="modalClose" onClick={toggleEventModal}>
                <FontAwesomeIcon
                  icon={faCircleXmark}
                  className="xButton"
                ></FontAwesomeIcon>
              </span>
            </div>
            <form className="headerModalForm" onSubmit={submitEvent}>
              <div className="headerGroupSelectVenues">
                <div>
                  <label className="headerModalLabel">Group: </label>
                  <select
                    name="type"
                    className="headerModalInput select"
                    onChange={getVenues}
                  >
                    <option value="0">Select a group</option>
                    {userGroups?.map((group) => (
                      <option value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="headerModalLabel">Venue: </label>
                  <select name="type" className="headerModalInput select">
                    <option value="0">Select a Venue</option>
                    {venues?.map((group) => (
                      <option value={group.id}>
                        {group.address + ", " + group.city + ", " + group.state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="headerModalLabel">Event Name</label>
              <input className="headerModalInput"></input>
              <label className="headerModalLabel">Event Description</label>
              <textarea className="headerModalInput"></textarea>

              <br></br>
              <div className="headerModalGroupEvent">
                <label className="headerModalLabel">Event Type</label>
                <select name="type" className="headerModalInput select">
                  <option value="Online">Online</option>
                  <option value="In person">In Person</option>
                </select>
                <label className="headerModalLabel">Event Capacity</label>
                <input
                  className="headerModalInput"
                  type="number"
                  defaultValue={20}
                ></input>
                <label className="headerModalLabel">Event Price</label>
                <input
                  className="headerModalInput"
                  type="number"
                  increment="0.01"
                  step="0.01"
                  defaultValue={5.99}
                ></input>
              </div>
              <label className="headerModalLabel">Event Date</label>
              <div className="headerModalGroupEventDate">
                {showCal && (
                  <div className="headerModalCalendarModal">
                    <div className="headerModalCalendarContent">
                      <div className="headerModalCalendarXButton">
                        <FontAwesomeIcon
                          icon={faCircleXmark}
                          onClick={toggleShowCal}
                        ></FontAwesomeIcon>
                      </div>
                      <div className="headerModalCalendar">
                        <Calender
                          small
                          selectable
                          sendDate={updateDate}
                        ></Calender>
                      </div>
                    </div>
                  </div>
                )}
                <div onClick={toggleShowCal} className="divButton">
                  Select Date
                </div>
                <input className="headerModalInput" value={startDate}></input>
                <input className="headerModalInput" value={endDate}></input>
              </div>

              <button
                type="submit"
                className="headerModalButton"
                value="Add Group"
              >
                Add Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
