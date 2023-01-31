import "./searchbar.css";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import * as sessionActions from "../store/session";
import { useDispatch, useSelector } from "react-redux";
import { GoogleMap, useJSApiLoader } from "@react-google-maps/api";
library.add(faMagnifyingGlass);
function SearchBar() {
  const [location, setLocation] = useState("Location");
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
      let add = "";
      add += res.results[0].address_components[3].short_name;
      add += ",";
      add += res.results[0].address_components[5].short_name;
      setLocation(add);
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
  return (
    <div className="singleBar">
      <input className="sb1" placeholder="Search Groups"></input>
      <input
        className="sb2"
        placeholder={location}
        onChange={(e) => setLocation(e.target.value)}
      ></input>
      <button className="sb3">
        <FontAwesomeIcon icon={faMagnifyingGlass}></FontAwesomeIcon>
      </button>
    </div>
  );
}
export default SearchBar;
