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
import Login from "./components/login";
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import { useSelector } from "react-redux";
function App() {
  const sessionUser = useSelector((state) => state.session.user);
  const history = useHistory();
  const [redir, setRedir] = useState("");
  useEffect(() => {
    if (sessionUser) {
      console.log("wooo");
      // history.push("/dashboard");
      setRedir(<Redirect to="/dashboard"></Redirect>);
      // window.history.pushState({}, null, "/dashboard");
    } else {
      setRedir(<Redirect to="/"></Redirect>);
    }
  }, [sessionUser]);

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
      </Switch>
    </BrowserRouter>
  );
}

export default App;
