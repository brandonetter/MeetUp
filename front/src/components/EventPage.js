import React, { useState, useEffect } from "react";
import ImageCar from "./ImageCar";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MemberCard from "./MemberCard";
import {
  faArrowLeft,
  faLocationArrow,
  faPeopleArrows,
  faUser,
  faInfoCircle,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import * as searchActions from "../store/search";
import * as sessionActions from "../store/session";
import { library } from "@fortawesome/fontawesome-svg-core";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import loadingImage from "../images/loading.svg";
import placeHolderImage from "../images/placeholder.png";
library.add(
  faArrowLeft,
  faLocationArrow,
  faPeopleArrows,
  faUser,
  faMoneyBillWave,
  faInfoCircle
);
function EventPage() {
  const [redir, setRedir] = useState(null);
  const [event, setEvent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [venue, setVenue] = useState(null);
  const [current, setCurrent] = useState("About");
  const [eventImages, setEventImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [ourStatus, setOurStatus] = useState(null);
  const sessionUser = useSelector((state) => state.session.user);
  const dispatch = useDispatch();
  const navigate = useHistory();
  const params = useParams();
  const eventId = params.id;
  const isAdminToolTip = (opacity) => {
    let div = document.getElementById("isAdminToolTip");
    div.style.opacity = opacity;
  };

  useEffect(() => {
    async function getGroup() {
      let event = await dispatch(searchActions.getEventById(eventId));
      console.log(event);
      setOurStatus(event.ourStatus);
      let venue = await dispatch(searchActions.getVenueById(event.venueId));
      let eventImages = await dispatch(searchActions.getEventImages(eventId));
      let hasPreview = false;
      for (let im of eventImages) {
        if (im.preview) {
          hasPreview = true;
          setPreview("/imagebin/" + im.url);
        }
      }
      if (!hasPreview) {
        setPreview(placeHolderImage);
      }
      setEventImages(eventImages);
      console.log(eventImages);
      setVenue(venue);
      setEvent(event);
      //   setOrganizer(group.Organizer);
      //   for (let im of group.GroupImages) {
      //     if (im.preview) {
      //       setPreview("/imagebin/" + im.url);
      //     }
      //   }

      if (sessionUser?.id === event?.organizerId && sessionUser.id) {
        setIsAdmin(true);
      }
    }
    getGroup();
  }, [dispatch, eventId, sessionUser]);
  useEffect(() => {
    async function fetchCurrent() {
      if (current === "Attendees") {
        let attendees = await dispatch(
          searchActions.getEventAttendees(eventId)
        );
        console.log(attendees.Attendees);
        setAttendees(attendees.Attendees);
      }
    }
    fetchCurrent();
  }, [current]);
  const deleteEvent = async () => {
    await dispatch(searchActions.deleteEvent(eventId));
    setRedir(<Redirect to="/dashboard"></Redirect>);
  };
  const updateEvent = async (e) => {
    e.preventDefault();

    let eventData = {
      name: e.target[0].value,
      description: e.target[1].value,
      price: e.target[2].value,
      capacity: e.target[3].value,
      startDate: e.target[4].value,
      endDate: e.target[5].value,
      type: e.target[6].value,
    };
    await dispatch(searchActions.updateEvent(eventData, eventId));
    navigate.go(0);
  };
  const addImage = async (e) => {
    e.preventDefault();
    let image = e.target[0].files[0];

    let im = await dispatch(sessionActions.uploadImage(image));
    if (im.url) {
      let formData = {
        url: im.url,
        preview: e.target[1].checked,
      };
      let imagesUpload = await dispatch(
        searchActions.addEventImage(formData, eventId)
      );
      console.log(imagesUpload);
    }
    // navigate.go(0);
  };
  const renderPage = () => {
    switch (current) {
      case "About":
        return (
          <div className="groupPageAbout">
            <div className="groupPageAboutTitle">
              <h1>About This Event</h1>
            </div>
            <div className="groupPageMenuContent">{event?.description}</div>
          </div>
        );
      case "Attendees":
        return (
          <div className="groupPageAbout">
            <div className="groupPageMenuContent">
              <h1>Attendees</h1>
            </div>

            <div className="memberCardHolder">
              {attendees.map((m) => (
                <div key={m.id}>
                  <MemberCard member={m} />
                </div>
              ))}
            </div>
          </div>
        );
      case "Photos":
        return (
          <div className="groupPageAbout">
            <div className="groupPageMenuContent">
              <h4>Photos</h4>
            </div>
            <div className="groupPagePhotos">
              <ImageCar eventImages={eventImages} />
            </div>
          </div>
        );

      case "Admin":
        return (
          <div className="groupPageAdminPanel">
            {redir}
            <h3>Admin Panel</h3>
            <button onClick={() => setCurrent("Update")}>Update Event</button>
            <button onClick={deleteEvent}>Delete Event</button>
            <button onClick={() => setCurrent("Add Image")}>Add Image</button>
          </div>
        );
      case "Add Image":
        return (
          <div className="groupPageAdminPanel">
            {redir}
            <h3>Add Image</h3>
            <form onSubmit={addImage}>
              <label>Image</label>
              <input type="file" name="image"></input>
              <label>Image Preview</label>
              <input type="checkbox" name="preview"></input>
              <button type="submit">Add Image</button>
            </form>
          </div>
        );

      case "Update":
        return (
          <div>
            {redir}
            <form onSubmit={updateEvent}>
              <label>Event Name</label>
              <input type="text" name="name" placeholder={event.name}></input>
              <label>Event Description</label>
              <textarea
                style={{ display: "block" }}
                type="text"
                placeholder={event.description}
              ></textarea>
              <label>Event Price</label>
              <input type="text" placeholder={event.price}></input>
              <label>Event Capacity</label>
              <input type="text" placeholder={event.capacity}></input>
              <label>Event Date</label>
              <input type="text" placeholder={event.startDate}></input>
              <input type="text" placeholder={event.endDate}></input>
              <label>Event Type</label>
              <select type="text" value={event.type}>
                <option value={"In-Person"}>In Person</option>
                <option value={"Online"}>Online</option>
              </select>

              <button>Update Group</button>
            </form>
          </div>
        );
    }
  };
  return (
    <>
      {redir}

      <div className="groupPageContent">
        <div className="groupPageGreet">
          <div className="groupPagePreviewImage">
            <img
              src={preview ? preview : loadingImage}
              className={preview ? "" : "loadingImage"}
            ></img>
          </div>

          <div className="groupPageGreetingCard">
            {!event && <img src={loadingImage} className="loadingImage"></img>}
            {event && (
              <>
                <div
                  onClick={() =>
                    setRedir(<Redirect to="/dashboard"></Redirect>)
                  }
                  className="groupPageBackButton"
                >
                  <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
                </div>
                <div className="groupPageName">{event?.name} </div>
                <div className="groupPageMiscInfo">
                  <div className="groupPageLocation">
                    <FontAwesomeIcon icon={faLocationArrow}></FontAwesomeIcon>
                    {venue?.city + ", " + venue?.state}
                  </div>

                  <div className="groupPageMemberCount">
                    <FontAwesomeIcon icon={faPeopleArrows}></FontAwesomeIcon>
                    {event?.numAttending} / {event?.capacity} attending
                  </div>
                  <div className="groupPageOrganizer">
                    <FontAwesomeIcon icon={faMoneyBillWave}></FontAwesomeIcon>
                    {event?.price}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="groupPageBorder"></div>
        <div className="groupPageMenuBar">
          <div className="groupPageMenu">
            <div
              className={
                current == "About"
                  ? "groupPageMenuButton selected"
                  : "groupPageMenuButton"
              }
              onClick={() => setCurrent("About")}
            >
              About
            </div>

            <div
              className={
                current == "Members"
                  ? "groupPageMenuButton selected"
                  : "groupPageMenuButton"
              }
              onClick={() => setCurrent("Attendees")}
            >
              Attendees
            </div>
            <div
              className={
                current == "Photos"
                  ? "groupPageMenuButton selected"
                  : "groupPageMenuButton"
              }
              onClick={() => setCurrent("Photos")}
            >
              Photos
            </div>
            {isAdmin && (
              <div
                className={
                  current == "Admin"
                    ? "groupPageMenuButton selected"
                    : "groupPageMenuButton"
                }
                onClick={() => setCurrent("Admin")}
              >
                Admin
              </div>
            )}
          </div>
          <div className="isAdminToolTip" id="isAdminToolTip">
            <FontAwesomeIcon icon={faInfoCircle}></FontAwesomeIcon>
            <div className="isAdminToolTipText">
              You are the organizer of this event, You're already Joined!
            </div>
          </div>
          {isAdmin ? (
            <div
              className="groupPageMenuButton JoinDisabled"
              onMouseOver={() => isAdminToolTip("1")}
              onMouseOut={() => isAdminToolTip("0")}
            >
              Join Event
            </div>
          ) : ourStatus === "member" ? (
            <div className="groupPageMenuButton Leave">Leave Event</div>
          ) : (
            <div className="groupPageMenuButton Join">Join Event</div>
          )}
        </div>
        <div className="groupPageMenuContent">{renderPage()}</div>
      </div>
    </>
  );
}
export default EventPage;
