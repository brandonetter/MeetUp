import * as searchActions from "../store/search";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
function MyEvents() {
  const [groups, setGroups] = useState([]);
  const [groupEvents, setGroupEvents] = useState([]);
  const dispatch = useDispatch();
  useEffect(() => {
    async function getGroups() {
      const response = await dispatch(searchActions.getUserGroups());
      setGroups(response);
    }
    getGroups();
  }, []);
  useEffect(() => {
    async function getEvents() {
      let groupEvents = [];
      for (let i = 0; i < groups.length; i++) {
        const response = await dispatch(
          searchActions.getGroupEvents(groups[i].id)
        );
        groupEvents = [...groupEvents, ...response.Events];
      }
      console.log(groupEvents);
      setGroupEvents(groupEvents);
    }
    getEvents();
  }, [groups]);
  const renderEvents = () => {
    const groupIdToName = {};
    const groupIdEvents = {};
    groups.forEach((group) => {
      groupIdToName[group.id] = group.name;
    });
    groupEvents.forEach((event) => {
      if (groupIdEvents[event.groupId]) {
        groupIdEvents[event.groupId].push(event);
      } else {
        groupIdEvents[event.groupId] = [event];
      }
    });
    return Object.keys(groupIdEvents).map((groupId) => {
      return (
        <div key={groupId}>
          <h4>{groupIdToName[groupId]}</h4>
          <ul>
            {groupIdEvents[groupId].map((event) => (
              <li key={event.id}>{event.name}</li>
            ))}
          </ul>
        </div>
      );
    });
  };
  return (
    <div>
      <h3>Your Events</h3>
      <ul>{renderEvents()}</ul>
    </div>
  );
}
export default MyEvents;
