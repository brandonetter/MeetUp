import "./searchbar.css";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import * as searchActions from "../store/search";
import { useDispatch, useSelector } from "react-redux";
import { GoogleMap, useJSApiLoader } from "@react-google-maps/api";

library.add(faMagnifyingGlass);
function SearchBar({ type }) {
  const search = useSelector((state) => state.search);
  const dispatch = useDispatch();
  const [location, setLocation] = useState("Location");
  useEffect(() => {
    dispatch(searchActions.setLocation(location));
  }, [location]);
  useEffect(() => {
    async function getSelection() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, posError);
      }
    }
    async function getAddress(
      lat,
      long,
      key = "AIzaSyDdrCHNzGnQUz1HQOwfA7jZZsIjo7ZHvOY"
    ) {
      let res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${key}`
      );
      res = await res.json();
      let city, state;
      for (let r of res.results) {
        for (let a of r.address_components) {
          if (city && state) break;
          if (a.types.includes("locality")) {
            city = a.short_name;
          }
        }
        for (let a of r.address_components) {
          if (a.types.includes("administrative_area_level_1")) {
            state = "," + a.short_name;
          }
        }
      }
      setLocation(city + " " + state);
    }
    function showPosition(pos) {
      console.log(pos);
      getAddress(pos.coords.latitude, pos.coords.longitude);
    }
    function posError() {
      if (navigator.permissions) {
        navigator.permissions.query({ name: "geolocation" }).then((res) => {
          if (res.state === "denied") {
            alert(
              "Enable location persmissions for this website in your browser settings"
            );
          }
        });
      }
    }
    getSelection();
  }, []);
  const setLoc = (e) => {
    e.preventDefault();
    // setLocation(document.getElementsByClassName("sb2")[0].value);
    dispatch(
      searchActions.setLocation(document.getElementsByClassName("sb2")[0].value)
    );
  };
  return (
    <div className="singleBar">
      <form onSubmit={setLoc} className="sbForm">
        <input className="sb1" placeholder={`Search ${type}`}></input>
        <input className="sb2" placeholder={location}></input>
        <button className="sb3" onClick={setLoc}>
          <FontAwesomeIcon icon={faMagnifyingGlass}></FontAwesomeIcon>
        </button>
      </form>
    </div>
  );
}
export default SearchBar;
