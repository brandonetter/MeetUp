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
  if (eventImages.length === 0) return <b>No Images</b>;
  return (
    <>
      {eventImages.map((image) => (
        <div
          style={{ display: "none" }}
          className="imageCarImage"
          key={image.id}
        >
          <img
            src={`../imageBin/${image.url}`}
            style={{ display: "none" }}
            alt="eventImage"
          />
        </div>
      ))}
      <div className="ImageCar">
        <div className="previousImage" onClick={previousImage}>
          <FontAwesomeIcon icon="arrow-left" />
        </div>
        <div className="currentImage">
          <img
            className="imageCarImage"
            src={`../imageBin/${eventImages[currentImage]?.url}`}
            alt="eventImage"
          />
        </div>
        <div className="nextImage" onClick={nextImage}>
          <FontAwesomeIcon icon="arrow-right" />
        </div>
      </div>
    </>
  );
}
export default ImageCar;
