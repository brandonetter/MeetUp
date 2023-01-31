import "./Header.css";
import logo from "../images/logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
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
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "./SearchBar";
import { useState, useEffect } from "react";
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
  const sessionUser = useSelector((state) => state.session.user);
  const [addGroupModal, setAddGroupModal] = useState(false);
  const [addEventModal, setAddEventModal] = useState(false);
  const location = useLocation().pathname;
  const toggleGroupModal = () => {
    window.scrollTo(0, 0);
    setScroll(addGroupModal);
    setAddGroupModal(!addGroupModal);
  };
  const toggleEventModal = () => {
    setAddEventModal(!addEventModal);
  };

  function setScroll(bool) {
    bool
      ? document.body.classList.remove("stop-scrolling")
      : document.body.classList.add("stop-scrolling");
  }

  return (
    <div className={"HeaderDiv " + (location == "/" ? "" : "loggedIn")}>
      <img src={logo} alt="logo" />
      {location == "/dashboard" && <SearchBar type="Groups"></SearchBar>}
      <div className="menuHeader">
        {location == "/dashboard" && (
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
            <form className="headerModalForm">
              <label className="headerModalLabel">Group Name</label>
              <input className="headerModalInput"></input>
              <label className="headerModalLabel">Group Description</label>
              <textarea className="headerModalInput"></textarea>
              <div className="headerModalGroup">
                <div className="small">
                  <label className="headerModalLabel">Group Image</label>
                  <input className="headerModalInput"></input>{" "}
                </div>
                <div className="small">
                  <label className="headerModalLabel">Location</label>
                  <input className="headerModalInput"></input>
                </div>
              </div>
              <button className="headerModalButton">Add Group</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
