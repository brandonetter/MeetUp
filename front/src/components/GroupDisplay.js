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
function GroupDisplay() {
  const dispatch = useDispatch();
  const location = useSelector((state) => state.search);
  const store = useStore();
  const [loc, setLoc] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  let timeoutInt = 0;
  store.subscribe(() => {
    let state = store.getState();
    setLoading(true);
    setLoc(state.search.location);
    setResults(state.search.results?.Groups);
    clearTimeout(timeoutInt);
    timeoutInt = setTimeout(() => {
      setLoading(false);
    }, 700);
  });
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
    return (
      <div className="groupCard">
        <div className="groupCardImage">
          <img src={img} />
        </div>
        <div className="groupCardHeader">
          <div className="groupCardTitle">{group?.name}</div>
          <div className="groupCardLocation">
            {group?.city},{group?.state}
          </div>

          <div className="groupCardDescription">{group?.about}</div>
          <div className="groupCardMembers">{group?.numMembers} Members</div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    async function getGroups() {
      dispatch(searchActions.getAllGroups());
    }
    getGroups();
  }, [loc]);

  return (
    <div>
      <h3 className="groupDisplayHeader">Groups Near {loc}</h3>
      {loading && loadingCards()}

      {!loading && results?.map((group) => <div>{genCard(group)}</div>)}
    </div>
  );
}
export default GroupDisplay;
