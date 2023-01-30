import "./Header.css";
import logo from "../images/logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faUser,
  faRightToBracket,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import Register from "./Register";
import Login from "./login";
import * as sessionActions from "../store/session";
import { useDispatch, useSelector } from "react-redux";
library.add(faUser, faRightToBracket, faCircleXmark);

function Header() {
  const sessionUser = useSelector((state) => state.session.user);
  return (
    <div className="HeaderDiv">
      <img src={logo} alt="logo" />
      <div className="menu">
        <span>
          <Login />
        </span>
      </div>
    </div>
  );
}

export default Header;
