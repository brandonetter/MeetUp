import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faLocationArrow,
  faPeopleArrows,
  faUser,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import * as searchActions from "../store/search";
import { library } from "@fortawesome/fontawesome-svg-core";
import { useParams } from "react-router-dom";
library.add(
  faArrowLeft,
  faLocationArrow,
  faPeopleArrows,
  faUser,
  faMoneyBillWave
);
function EventPage() {
  const [redir, setRedir] = useState(null);
  const [event, setEvent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [venue, setVenue] = useState(null);
  const [current, setCurrent] = useState("About");
  const sessionUser = useSelector((state) => state.session.user);
  const dispatch = useDispatch();
  const params = useParams();
  const eventId = params.id;
  useEffect(() => {
    async function getGroup() {
      let event = await dispatch(searchActions.getEventById(eventId));
      console.log(event);
      let venue = await dispatch(searchActions.getVenueById(event.venueId));
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
  const renderPage = () => {
    switch (current) {
      case "About":
        return (
          <div className="groupPageAbout">
            <div className="groupPageAboutTitle">About</div>
            <div className="groupPageAboutContent">{event?.description}</div>
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
            <img></img>
          </div>

          <div className="groupPageGreetingCard">
            <div
              onClick={() => setRedir(<Redirect to="/dashboard"></Redirect>)}
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
                current == "Events"
                  ? "groupPageMenuButton selected"
                  : "groupPageMenuButton"
              }
              onClick={() => setCurrent("Events")}
            >
              Events
            </div>
            <div
              className={
                current == "Members"
                  ? "groupPageMenuButton selected"
                  : "groupPageMenuButton"
              }
              onClick={() => setCurrent("Members")}
            >
              Members
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
          <div className="groupPageMenuButton Join">Join Group</div>
        </div>
        <div className="groupPageMenuContent">{renderPage()}</div>
      </div>
    </>
  );
}
export default EventPage;
