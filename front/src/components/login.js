import React, { useState, useEffect, useRef } from "react";
import * as sessionActions from "../store/session";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCircleXmark,
  faUser,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import "./Login.css";
import { valid } from "semver";

library.add(faCircleXmark);
function Login() {
  const emailValid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const passwordValid = /^[a-zA-Z0-9]{8,}$/;
  const nameValid = /^[a-zA-Z]{2,14}$/;
  const unameValid = /^[a-zA-Z0-9_]{3,12}$/;
  const emailError = "Invalid Email";
  const unameError =
    "Username must be between 3 and 12 alphanumeric characters";
  const fnameError =
    "Firstname must be only letters and between 2 and 14 characters";
  const lnameError =
    "Lastname must be only letters and between 2 and 14 characters";
  const passwordError =
    "Invalid Password, Must be at least 8 characters and contain only letters and numbers";
  const modalContent = useRef();
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFName] = useState("");
  const [lname, setLName] = useState("");
  const [uname, setUName] = useState("");

  const [errors, setErrors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [hasRun, setHasRun] = useState(false);
  useEffect(() => {
    async function restore() {
      return dispatch(sessionActions.sessionRestore()).catch(async (res) => {
        const data = await res?.json();
        if (data && data.errors) setErrors(data.errors);
      });
    }
    restore();
    setTimeout(() => setHasRun(true), 100);
  }, []);

  const validate = () => {
    const errors = [];
    setValidationErrors([]);
    !credential.match(emailValid) && errors.push(emailError);
    !password.match(passwordValid) && errors.push(passwordError);

    setValidationErrors(errors);
  };
  const registerValidate = () => {
    const errors = [];
    setValidationErrors([]);
    !credential.match(emailValid) && errors.push(emailError);
    !password.match(passwordValid) && errors.push(passwordError);
    !fname.match(nameValid) && errors.push(fnameError);
    !lname.match(nameValid) && errors.push(lnameError);
    !uname.match(unameValid) && errors.push(unameError);
    setValidationErrors(errors);
  };
  useEffect(() => {
    if (!validationErrors.length) return;
    validate();
  }, [credential, password]);
  useEffect(() => {
    if (!validationErrors.length) return;
    registerValidate();
  }, [credential, password, fname, lname, uname]);

  const logout = () => {
    document.cookie = "authorized=''";
    dispatch(sessionActions.sessionLogout());
  };
  const toggleModal = (e) => {
    setShowModal(!showModal);
  };
  const toggleRegisterModal = (e) => {
    setShowRegisterModal(!showRegisterModal);
  };
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    registerValidate();
    if (!validationErrors.length)
      return dispatch(
        sessionActions.sessionRegister({
          email: credential,
          hash: password,
          firstname: fname,
          lastname: lname,
          username: uname,
        })
      ).catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) setErrors(data.errors);
      });
  };
  const handleSubmit = (e) => {
    console.log("Asdasd");
    e.preventDefault();
    validate();
    if (!validationErrors.length)
      return dispatch(
        sessionActions.sessionLogin({ credential, password })
      ).catch(async (res) => {
        const data = await res?.json();
        if (data && data.errors) setErrors(data.errors);
      });
  };
  const menu = (
    <ul className="menuList">
      <li onClick={logout}>Logout</li>
    </ul>
  );
  const style = { color: showMenu ? "#81bdf9" : "" };
  if (!hasRun) return <></>;
  if (sessionUser) {
    return (
      <span className="user" onClick={toggleMenu} style={style}>
        {sessionUser.username} <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>
        {showMenu && menu}
      </span>
    );
  }
  return (
    <>
      <span className="loginButton" onClick={toggleModal}>
        <FontAwesomeIcon icon="fa-solid fa-right-to-bracket" /> Login
      </span>{" "}
      <span className="loginButton" onClick={toggleRegisterModal}>
        <FontAwesomeIcon icon={faUser} /> Register
      </span>
      <div className={showModal ? "modalShow modal" : "modal"}>
        <div className="modalContent" ref={modalContent}>
          <div className="modalHeader">
            <h2>Welcome Back!</h2>

            <FontAwesomeIcon
              icon={faCircleXmark}
              className="xButton"
              onClick={toggleModal}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <ul>
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
            <label>
              Email
              <input
                type="text"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit">Log In</button>
          </form>
          {validationErrors.map((error) => (
            <li>{error}</li>
          ))}
        </div>
      </div>
      <div className={showRegisterModal ? "modalShow modal" : "modal"}>
        <div className="modalContent" ref={modalContent}>
          <div className="modalHeader">
            <h2>Come Join!</h2>

            <FontAwesomeIcon
              icon={faCircleXmark}
              className="xButton"
              onClick={toggleRegisterModal}
            />
          </div>

          <form onSubmit={handleRegisterSubmit}>
            <ul>
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
            <label>
              First Name
              <input
                type="text"
                value={fname}
                style={
                  validationErrors.includes(fnameError) ? { color: "red" } : {}
                }
                onChange={(e) => setFName(e.target.value)}
                required
              />
            </label>
            <label>
              Last Name
              <input
                type="text"
                value={lname}
                style={
                  validationErrors.includes(lnameError) ? { color: "red" } : {}
                }
                onChange={(e) => setLName(e.target.value)}
                required
              />
            </label>

            <label>
              Username
              <input
                type="text"
                value={uname}
                style={
                  validationErrors.includes(unameError) ? { color: "red" } : {}
                }
                onChange={(e) => setUName(e.target.value)}
                required
              />
            </label>
            <label>
              Email
              <input
                type="text"
                value={credential}
                style={
                  validationErrors.includes(emailError) ? { color: "red" } : {}
                }
                onChange={(e) => setCredential(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                style={
                  validationErrors.includes(passwordError)
                    ? { color: "red" }
                    : {}
                }
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit">Register</button>
          </form>
          {validationErrors.map((error) => (
            <li>{error}</li>
          ))}
        </div>
      </div>
    </>
  );
}

export default Login;
