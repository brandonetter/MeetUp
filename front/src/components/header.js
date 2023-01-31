import "./Header.css";
import logo from "../images/logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faUser,
  faRightToBracket,
  faCircleXmark,
  faBell,
  faComments,
  faCircleUser,
  faPersonCirclePlus,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import Register from "./Register";
import Login from "./login";
import * as sessionActions from "../store/session";
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "./SearchBar";
library.add(
  faUser,
  faRightToBracket,
  faCircleXmark,
  faBell,
  faComments,
  faCircleUser
);

function Header() {
  const sessionUser = useSelector((state) => state.session.user);
  const location = useLocation().pathname;
  return (
    <div className={"HeaderDiv " + (location == "/" ? "" : "loggedIn")}>
      <img src={logo} alt="logo" />
      {location == "/dashboard" && <SearchBar type="Groups"></SearchBar>}
      <div className="menuHeader">
        {location == "/dashboard" && (
          <>
            <span className="iconButton">
              <FontAwesomeIcon icon={faLocationDot}></FontAwesomeIcon>
              <span>Add Event</span>
            </span>
            <span className="iconButton">
              <FontAwesomeIcon icon={faPersonCirclePlus}></FontAwesomeIcon>
              <span>Add Group</span>
            </span>
          </>
        )}
        <span className="userButton">
          <Login />
        </span>
      </div>
    </div>
  );
}

export default Header;
