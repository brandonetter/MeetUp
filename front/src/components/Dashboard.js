import { useSelector } from "react-redux";
import "./dashboard.css";
import Calender from "./Calender";
function Dashboard() {
  const user = useSelector((state) => state.session.user);
  return (
    <div className="mainDash">
      <h1>Welcome {user?.username}!👋🏼 </h1>
      <div className="content">
        <div>
          <Calender />
        </div>
        <div>Hello</div>
      </div>
    </div>
  );
}

export default Dashboard;
