import { useEffect, useState } from "react";
import Header from "./components/header";

import {
  BrowserRouter,
  Link,
  Route,
  Switch,
  Redirect,
  useHistory,
} from "react-router-dom";
import Landing from "./components/Landing";
import GroupPage from "./components/GroupPage";
import EventPage from "./components/EventPage";
import Dashboard from "./components/Dashboard";
import { useSelector } from "react-redux";
function App() {
  const sessionUser = useSelector((state) => state.session.user);
  const history = useHistory();
  const [redir, setRedir] = useState("");
  // useEffect(() => {
  //   if (!sessionUser) {
  //     setRedir(<Redirect to="/"></Redirect>);
  //   }
  // }, [sessionUser]);

  return (
    <BrowserRouter>
      {redir}
      <Header />
      <Switch>
        <Route path="/" exact>
          <Landing />
        </Route>
        <Route path="/dashboard">
          <Dashboard></Dashboard>
        </Route>
        <Route path="/groups/:groupId">
          <GroupPage />
        </Route>
        <Route path="/events/:id">
          <EventPage />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
