import { library } from "@fortawesome/fontawesome-svg-core";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as searchActions from "../store/search";
import { useDispatch } from "react-redux";
import { Redirect } from "react-router-dom";

import {
  GoogleMap,
  useJSApiLoader,
  DistanceMatrixService,
} from "@react-google-maps/api";
import {
  faCircleXmark,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
import GMap from "./GMap";
library.add(faCircleXmark, faUpRightAndDownLeftFromCenter);
function GroupCard({ img, group, location }) {
  const dispatch = useDispatch();
  const [redir, setRedir] = useState(null);
  const [expand, setExpand] = useState(false);
  const [distance, setDistance] = useState(0);
  const [coords, setCoords] = useState([0, 0]);
  async function getLatLngFromAddress() {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${group.city},${group.state}&key=AIzaSyDdrCHNzGnQUz1HQOwfA7jZZsIjo7ZHvOY`
    );
    const data = await res.json();
    if (!data || data.status === "ZERO_RESULTS") {
      throw new Error("Could not find location for the specified address.");
    }
    const coordinates = data.results[0].geometry.location;
    setCoords([coordinates.lat, coordinates.lng]);
    return coordinates;
  }
  const toggleExpand = () => {
    setExpand(true);
  };
  const closeExpand = (e) => {
    e.stopPropagation();
    setExpand(false);
  };
  useEffect(() => {
    getLatLngFromAddress();
    if (!expand) return;
    const groupFullInfo = async () => {
      const res = await dispatch(searchActions.getGroupById(group.id));
      console.log(res);
    };
    groupFullInfo();
  }, [expand]);

  return (
    <div className={expand ? "dimmer" : ""}>
      {redir}
      <div
        className={expand ? "groupCard expand" : "groupCard"}
        onClick={toggleExpand}
      >
        <div className="groupCardImage">
          <img src={img} />
        </div>

        {/* {location && (
          <DistanceMatrixService
            options={{
              destinations: [group?.city + "," + group?.state],
              origins: [location],
              travelMode: "DRIVING",
            }}
            // callback={(response) => {
            //   // let distance = response.rows[0].elements[0].distance.text;
            //   // console.log(distance);
            //   //remove comma
            //   if (distance.includes(",")) {
            //     distance = distance.split(",")[0] + distance.split(",")[1];
            //   }
            //   //convert to miles
            //   if (distance.includes("km")) {
            //     distance = distance.split(" ")[0];
            //     distance = distance * 0.621371;
            //     distance = distance.toFixed(2);
            //     distance = distance + " mi";
            //   }

            //   setDistance(distance);
            // }}
          />
        )} */}

        <div className="groupCardHeader">
          <div className="groupCardTitle">{group?.name}</div>
          <div className="groupCardLocation">
            {group?.city},{group?.state}
          </div>

          <div className="groupCardDescription">{group?.about}</div>
          <div className="groupCardMembers">{group?.numMembers} Members</div>
          {!expand && <div className="distance">{group?.distance + " mi"}</div>}
        </div>
        {expand ? (
          <>
            <div className="xButton groupX" onClick={closeExpand}>
              <FontAwesomeIcon icon={faCircleXmark} />
            </div>
          </>
        ) : (
          <div className="groupOpen">
            <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
          </div>
        )}
        {expand && (
          <div className="map">
            <GMap markerPosition={coords} />
          </div>
        )}
        {expand && (
          <button
            className="groupPageButton"
            onClick={() => {
              setRedir(<Redirect to={`/groups/${group.id}`} />);
            }}
          >
            Go To Group Page
          </button>
        )}
      </div>
    </div>
  );
}
export default GroupCard;
