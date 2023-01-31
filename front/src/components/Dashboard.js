import { useSelector } from "react-redux";
import "./dashboard.css";
import Calender from "./Calender";
import GroupDisplay from "./GroupDisplay";
function Dashboard() {
  const user = useSelector((state) => state.session.user);
  return (
    <div className="mainDash">
      <h1>Welcome, {user?.username}👋</h1>
      <div className="content">
        <div>
          <h3 className="dashTitle">Events From Your Groups</h3>
          <Calender />
        </div>
        <div>
          <GroupDisplay />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
