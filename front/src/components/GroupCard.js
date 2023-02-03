import { library } from "@fortawesome/fontawesome-svg-core";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as searchActions from "../store/search";
import { useDispatch } from "react-redux";

import {
  GoogleMap,
  useJSApiLoader,
  DistanceMatrixService,
} from "@react-google-maps/api";
import {
  faCircleXmark,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
library.add(faCircleXmark, faUpRightAndDownLeftFromCenter);
function GroupCard({ img, group, location }) {
  const dispatch = useDispatch();
  const [expand, setExpand] = useState(false);
  const [distance, setDistance] = useState(0);
  const toggleExpand = () => {
    setExpand(true);
  };
  const closeExpand = (e) => {
    e.stopPropagation();
    setExpand(false);
  };
  useEffect(() => {
    if (!expand) return;
    const groupFullInfo = async () => {
      const res = await dispatch(searchActions.getGroupById(group.id));
      console.log(res);
    };
    groupFullInfo();
  }, [expand]);

  return (
    <div className={expand ? "dimmer" : ""}>
      <div
        className={expand ? "groupCard expand" : "groupCard"}
        onClick={toggleExpand}
      >
        <div className="groupCardImage">
          <img src={img} />
        </div>
        {location && (
          <DistanceMatrixService
            options={{
              destinations: [group?.city + "," + group?.state],
              origins: [location],
              travelMode: "DRIVING",
            }}
            callback={(response) => {
              let distance = response.rows[0].elements[0].distance.text;
              console.log(distance);
              //remove comma
              if (distance.includes(",")) {
                distance = distance.split(",")[0] + distance.split(",")[1];
              }
              //convert to miles
              if (distance.includes("km")) {
                distance = distance.split(" ")[0];
                distance = distance * 0.621371;
                distance = distance.toFixed(2);
                distance = distance + " mi";
              }

              setDistance(distance);
            }}
          />
        )}
        {expand && distance}
        <div className="groupCardHeader">
          <div className="groupCardTitle">{group?.name}</div>
          <div className="groupCardLocation">
            {group?.city},{group?.state}
          </div>

          <div className="groupCardDescription">{group?.about}</div>
          <div className="groupCardMembers">{group?.numMembers} Members</div>
        </div>
        {expand ? (
          <div className="xButton groupX" onClick={closeExpand}>
            <FontAwesomeIcon icon={faCircleXmark} />
          </div>
        ) : (
          <div className="groupOpen">
            <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
          </div>
        )}
      </div>
    </div>
  );
}
export default GroupCard;
