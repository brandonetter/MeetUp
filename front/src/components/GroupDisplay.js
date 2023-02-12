import { useState, useEffect } from "react";
import placeholder from "../images/placeholder.png";
import placeholder2 from "../images/placeholder2.png";
import placeholder3 from "../images/placeholder3.png";
import loadingIm from "../images/loading.gif";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import * as searchActions from "../store/search";
import { useDispatch, useSelector, useStore } from "react-redux";
import { GoogleMap, useJSApiLoader } from "@react-google-maps/api";
import "./GroupDisplay.css";
import GroupCard from "./GroupCard";
function GroupDisplay() {
  const dispatch = useDispatch();
  const location = useSelector((state) => state.search);
  const store = useStore();
  const [loc, setLoc] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortedResults, setSortedResults] = useState([]);
  const [finalResults, setFinalResults] = useState([]);
  useEffect(() => {
    setFinalResults([]);
    async function sortedRes() {
      const tempRest = results?.map(async (result) => {
        return {
          ...result,
          distance: await getDistance(result.city + ", " + result.state),
        };
      });
      //sort tempRest by distance
      let tt;
      if (tempRest?.length) tt = [...tempRest];
      setSortedResults(tt);
    }
    sortedRes();
    //call getDistance on each result's city, state
  }, [results]);
  useEffect(() => {
    async function waitSort() {
      let res = [];
      if (!sortedResults?.length) return;
      for await (let r of sortedResults) {
        if (r.distance) {
          if (r.distance.includes(",")) {
            r.distance = r.distance.split(",")[0] + r.distance.split(",")[1];
          }
          if (r.distance.includes("km") || r.distance.includes("m")) {
            r.distance = r.distance.split(" ")[0];
            r.distance = r.distance * 0.621371;
            r.distance = r.distance.toFixed(2);
          }
        }
        res.push(r);
        //sort res by distance
      }
      res = res.sort((a, b) => Number(a.distance) - Number(b.distance));

      setFinalResults(res);
    }
    waitSort();
  }, [sortedResults]);
  async function getDistance(location) {
    return new Promise((resolve, reject) => {
      var origin1 = loc + ", USA";
      var destinationA = location;
      const service = new window.google.maps.DistanceMatrixService();
      function callback(response, status) {
        let distance = 0;
        if (status == "OK") {
          var origins = response.originAddresses;

          for (var i = 0; i < origins.length; i++) {
            var results = response.rows[i].elements;
            for (var j = 0; j < results.length; j++) {
              var element = results[j];
              distance = element?.distance?.text;
            }
          }
          resolve(distance);
        }
      }
      service.getDistanceMatrix(
        {
          origins: [origin1],
          destinations: [destinationA],
          travelMode: "DRIVING",
        },
        callback
      );
    });
  }
  useEffect(() => {
    store.subscribe(() => {
      let state = store.getState();
      setLoading(true);
      setLoc(state.search.location);
      let preRes = state.search.results?.Groups;
      // get state from location 'city,ST'
      let stateFromLoc = state.search.location.split(",")?.[1];
      let cityFromLoc = state.search.location.split(",")?.[0];
      if (stateFromLoc === undefined) stateFromLoc = state.search.location;
      if (cityFromLoc === undefined) cityFromLoc = state.search.location;
      //filter preRes to only include groups that have the same state or city
      stateFromLoc = stateFromLoc.toUpperCase();
      stateFromLoc = stateFromLoc.trim();
      if (state.search.location !== "") {
        // if (preRes) {
        //   preRes = preRes.filter((group) => {
        //     let searchLoc = group.city + ", " + group.state;
        //     return group.state === stateFromLoc || group.city === cityFromLoc;
        //   });
        // }
      } else {
        //setLoc("Anywhere");
      }
      setResults(preRes);
      clearTimeout(timeoutInt);
      timeoutInt = setTimeout(() => {
        setLoading(false);
      }, 500);
    });
  }, []);
  let timeoutInt = 0;

  const loadingCards = () => {
    let cards = [];
    for (let i = 0; i < 3; i++) {
      cards.push(
        <div>
          <div className="groupCard">
            <div className="groupCardImage">
              <img src={loadingIm} />
            </div>
            <div className="groupCardHeader">
              <div className="groupCardTitle">Loading...</div>
              <div className="groupCardLocation">Loading...</div>

              <div className="groupCardDescription">Loading...</div>
              <div className="groupCardMembers">Loading ...</div>
            </div>
          </div>
        </div>
      );
    }
    return cards;
  };

  const genCard = (group) => {
    const img = group?.preview
      ? "imagebin/" + group?.preview
      : [placeholder, placeholder2, placeholder3][~~(Math.random() * 3)];
    return <GroupCard img={img} group={group} location={loc} />;
  };

  useEffect(() => {
    async function getGroups() {
      dispatch(searchActions.getAllGroups());
    }
    getGroups();
  }, [loc]);

  return (
    <div>
      <h3 className="groupDisplayHeader">
        Groups Near {loc ? loc : "Anywhere"}
      </h3>

      {loading && loadingCards()}
      {!loading && finalResults?.map((group) => <div>{genCard(group)}</div>)}
    </div>
  );
}
export default GroupDisplay;
