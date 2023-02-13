import { useSelector } from "react-redux";
import "./dashboard.css";
import Calender from "./Calender";
import GroupDisplay from "./GroupDisplay";
import MyGroups from "./MyGroups";
import MyEvents from "./MyEvents";
function Dashboard() {
  const user = useSelector((state) => state.session.user);
  return (
    <div className="mainDash">
      <h1>Welcome, {user?.username}👋</h1>
      <div className="content">
        <div className="leftBar">
          <h3 className="dashTitle">Your Upcoming Events</h3>
          <Calender />
          <MyGroups />
          <MyEvents />
        </div>
        <div className="rightBar">
          <GroupDisplay />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
