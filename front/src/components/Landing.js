import "./Landing.css";
import landingImage from "../images/landing.svg";
import one from "../images/friends1.png";
import two from "../images/friends2.png";
import three from "../images/friends3.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

library.add(faArrowRight);
function Landing() {
  return (
    <div className="main">
      <div className="headerCenter">
        <div>
          <h1>The people platform—Where interests become friendships</h1>
          <span>
            Whatever your interest, from hiking and reading to networking and
            skill sharing, there are thousands of people who share it on Meetup.
            Events are happening every day—log in to join the fun.
          </span>
        </div>
        <img src={landingImage} alt="friends"></img>
      </div>
      <div className="imageHolder">
        <div>
          <img src={one}></img>
          <h3>Explore</h3>
        </div>
        <div>
          <img src={two}></img>
          <h3>Meet</h3>
        </div>
        <div>
          <img src={three}></img>
          <h3>Party</h3>
        </div>
      </div>
    </div>
  );
}
export default Landing;
