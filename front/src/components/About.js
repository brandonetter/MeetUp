import "./about.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faQuestion as faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
library.add(faQuestionCircle);

function About() {
  const [showTimer, setShowTimer] = useState(0);
  const setShow = () => {
    clearTimeout(showTimer);
    const aboutBar = document.querySelector(".AboutBar");
    aboutBar.classList.add("AboutShow");
  };
  const startHideTimer = () => {
    const aboutBar = document.querySelector(".AboutBar");
    let tid = setTimeout(() => {
      aboutBar.classList.remove("AboutShow");
    }, 2000);
    setShowTimer(tid);
  };

  return (
    <div className="AboutBar" onMouseOver={setShow} onMouseOut={startHideTimer}>
      <FontAwesomeIcon icon={faQuestionCircle}></FontAwesomeIcon>
      <div className="aboutText">
        <h3 className="aboutText">Made By: Brandon Etter</h3>
      </div>
      <div className="aboutText">
        <h3 className="aboutText">
          All The Links: <a href="https://github.com/brandonetter">GitHub</a>{" "}
        </h3>
      </div>
    </div>
  );
}
export default About;
