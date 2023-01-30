import { useSelector } from "react-redux";
function Dashboard() {
  const user = useSelector((state) => state.session.user);
  return (
    <div>
      <h1>Welcome {user?.username}!</h1>
    </div>
  );
}

export default Dashboard;
