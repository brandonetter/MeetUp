import * as searchActions from "../store/search";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import "./myEvents.css";
import loadingImage from "../images/loading.svg";
function MyGroups() {
  const [groups, setGroups] = useState([]);
  const dispatch = useDispatch();
  useEffect(() => {
    async function getGroups() {
      const response = await dispatch(searchActions.getUserGroups());
      setGroups(response);
    }
    getGroups();
  }, []);
  return (
    <div>
      <h3>Your Groups</h3>
      {groups.length === 0 && (
        <img className="loadingImage" src={loadingImage} alt="loading" />
      )}

      <ul>
        {groups.map((group) => (
          <li className="myEventListItem" key={group.id}>
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default MyGroups;
