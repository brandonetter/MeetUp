import { useEffect } from "react";
import Header from "./components/header";

import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Login from "./components/login";
import Landing from "./components/Landing";
function App() {
  return (
    <BrowserRouter>
      <Header />
      <Switch>
        <Route path="/" exact>
          <Landing />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
