import * as searchActions from "../store/search";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import "./myEvents.css";
import loadingImage from "../images/loading.svg";
import { Redirect } from "react-router-dom";
function MyGroups() {
  const [groups, setGroups] = useState([]);
  const [redir, setRedir] = useState("");
  const [loaded, setLoaded] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    async function getGroups() {
      const response = await dispatch(searchActions.getUserGroups());
      setGroups(response);
      setTimeout(() => {
        setLoaded(true);
      }, 200);

    }
    getGroups();
  }, []);
  return (
    <div>
      <h3>Your Groups</h3>
      {redir}
      {groups.length === 0 && loaded == false && (
        <img className="loadingImage" src={loadingImage} alt="loading" />
      )}
      {loaded && groups.length === 0 && (
        <div className="noGroups">
          <h3>You are not a member of any groups</h3>
        </div>
      )}
      <ul>
        {groups.map((group) => (
          <li
            className="myEventListItem"
            key={group.id}
            onClick={() => setRedir(<Redirect to={`/groups/${group.id}`} />)}
          >
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default MyGroups;
