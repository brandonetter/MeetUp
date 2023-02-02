import { library } from "@fortawesome/fontawesome-svg-core";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
library.add(faCircleXmark, faUpRightAndDownLeftFromCenter);
function GroupCard({ img, group }) {
  const [expand, setExpand] = useState(false);
  const toggleExpand = () => {
    setExpand(true);
  };
  const closeExpand = (e) => {
    e.stopPropagation();
    setExpand(false);
  };

  return (
    <div className={expand ? "dimmer" : ""}>
      <div
        className={expand ? "groupCard expand" : "groupCard"}
        onClick={toggleExpand}
      >
        <div className="groupCardImage">
          <img src={img} />
        </div>

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
