import "./imageCar.css";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
library.add(faArrowLeft, faArrowRight);
function ImageCar({ eventImages }) {
  const [currentImage, setCurrentImage] = useState(0);
  const previousImage = () => {
    if (currentImage === 0) {
      setCurrentImage(eventImages.length - 1);
    } else {
      setCurrentImage(currentImage - 1);
    }
  };
  const nextImage = () => {
    if (currentImage === eventImages.length - 1) {
      setCurrentImage(0);
    } else {
      setCurrentImage(currentImage + 1);
    }
  };

  return (
    <div className="ImageCar">
      <div className="previousImage" onClick={previousImage}>
        <FontAwesomeIcon icon="arrow-left" />
      </div>
      <div className="currentImage">
        <img
          className="imageCarImage"
          src={`../imageBin/${eventImages[currentImage].url}`}
          alt="eventImage"
        />
      </div>
      <div className="nextImage" onClick={nextImage}>
        <FontAwesomeIcon icon="arrow-right" />
      </div>
    </div>
  );
}
export default ImageCar;
