import "./calender.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import * as searchActions from "../store/search";
import { Redirect } from "react-router-dom";
library.add(faArrowLeft, faArrowRight);
function Calender({ small = false, selectable = false, sendDate = null }) {
  const dispatch = useDispatch();
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [month, setMonth] = useState(null);
  const [days, setDays] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [redir, setRedir] = useState(null);
  //Object containing Months and 0 indexed numbers
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const toNum = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };
  const toMonth = {
    0: "January",
    1: "February",
    2: "March",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "August",
    8: "September",
    9: "October",
    10: "November",
    11: "December",
  };
  useEffect(() => {
    if (selectable) return;
    async function getGroupEvents() {
      const response = await dispatch(searchActions.getUserGroups());
      setGroups(response);
      let event = [];
      for (let i = 0; i < response.length; i++) {
        let groupEvents = await dispatch(
          searchActions.getGroupEvents(response[i].id)
        );
        event = [...event, ...groupEvents.Events];
      }
      setEvents(event);
    }
    getGroupEvents();
  }, []);
  useEffect(() => {
    if (selectable) return;
    async function getGroupEvents() {
      const response = await dispatch(searchActions.getUserGroups());
      setGroups(response);
      let event = [];
      for (let i = 0; i < response.length; i++) {
        let groupEvents = await dispatch(
          searchActions.getGroupEvents(response[i].id)
        );
        event = [...event, ...groupEvents.Events];
      }
      setEvents(event);
    }
    getGroupEvents();
  }, [month, year]);

  const date = new Date();
  const nextMonth = (e) => {
    e.preventDefault();
    let next = toNum[month] + 1;
    if (next > 11) {
      next = 0;
      setYear(year + 1);
    }
    setMonth(toMonth[next]);
  };
  const prevMonth = (e) => {
    e.preventDefault();
    //asd
    let prev = toNum[month] - 1;
    if (prev < 0) {
      prev = 11;
      setYear(year - 1);
    }
    setMonth(toMonth[prev]);
  };
  const daySelect = (e) => {
    let formattedDate = e.target.innerText + " " + month + " " + year;
    let date = new Date(formattedDate);
    if (!startDate) {
      setStartDate(formattedDate);
    } else if (!endDate) {
      new Date(startDate) < date
        ? setEndDate(formattedDate)
        : setStartDate(formattedDate);
    } else if (startDate && endDate) {
      setStartDate(formattedDate);
      setEndDate(null);
    }
  };
  const showEvent = (eventId, e) => {
    let oldZ = e.target.style.zIndex;
    e.target.style.zIndex = 100;
    e.target.addEventListener("mouseleave", () => {
      e.target.style.zIndex = oldZ;
      eventDiv.classList.remove("eventShow");
    });
    let eventDiv = document.getElementById("event" + eventId);
    eventDiv.classList.toggle("eventShow");
  };
  useEffect(() => {
    if (sendDate) {
      sendDate(startDate, endDate);
    }
  }, [startDate, endDate]);
  useEffect(() => {
    let cdate = date;
    if (month) cdate = new Date(date.getFullYear(), toNum[month], 1);
    if (!month) cdate = date;
    let months = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
      cdate
    );
    fillDays(cdate.getMonth(), year);
    setMonth(months);

    function fillDays(month, year) {
      let date = new Date(year, month, 1);
      let days = [];
      let buffer = date.getDay();
      for (let i = 0; i < buffer; i++) {
        days.push("");
      }
      while (date.getMonth() === month) {
        let hasEvent = false;
        if (events.length)
          for (let event of events) {
            let eventDate = new Date(event.startDate);
            if (eventDate.toDateString() === date.toDateString()) {
              days.push([date.getDate(), "eventStart", event["id"]]);
              hasEvent = true;
            }
          }
        if (!hasEvent) {
          let wordDate =
            date.getDate() +
            " " +
            toMonth[date.getMonth()] +
            " " +
            date.getFullYear();
          if (
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear() &&
            !selectable
          ) {
            days.push([date.getDate(), "today"]);
          } else if (wordDate === startDate) {
            days.push([date.getDate(), "start"]);
          } else if (wordDate === endDate) {
            days.push([date.getDate(), "end"]);
          } else if (date < new Date(endDate) && date > new Date(startDate)) {
            days.push([date.getDate(), "middle"]);
          } else {
            days.push(new Date(date).getDate());
          }
        }
        date.setDate(date.getDate() + 1);
      }
      setDays([...dayLabels, ...days]);

      return days;
    }
  }, [month, startDate, endDate, events]);
  const redirToEvent = (eventId) => {
    setRedir(<Redirect to={`/events/${eventId}`} />);
  };
  const renderEvent = (eventId) => {
    let event = events.find((event) => event.id === eventId);
    let startDate = new Date(event.startDate);
    let endDate = new Date(event.endDate);
    let startDateFormatted =
      startDate.getMonth() + 1 + "/" + startDate.getDate();
    let endDateFormatted = endDate.getMonth() + 1 + "/" + endDate.getDate();
    return (
      <div className="eventPopup" onMouseLeave={() => showEvent(eventId)}>
        <div>
          <h5>{event.name}</h5>
        </div>
        <div>
          {startDateFormatted} to {endDateFormatted}
        </div>
        <div>
          <button
            className="eventPopupButton"
            onClick={() => redirToEvent(event.id)}
          >
            Go To Event Page
          </button>
        </div>
      </div>
    );
  };
  return (
    <div className={!small ? "mainCal" : "mainCal small"}>
      {redir}
      <div className="mainCalDiv">
        <h3>
          {month} {year}
        </h3>
        <button onClick={prevMonth}>
          <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
        </button>
        <button onClick={nextMonth}>
          <FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon>
        </button>
      </div>
      <div className="calGrid">
        {days.map((day, index) =>
          dayLabels.includes(day) ? (
            <div className="dayLabel" onClick={selectable ? daySelect : null}>
              {day}
            </div>
          ) : day?.[1] ? (
            <div
              className={day[1]}
              style={{ zIndex: 99 - index }}
              onClick={selectable ? daySelect : null}
              {...(day[2] && { onMouseEnter: (e) => showEvent(day[2], e) })}
            >
              {day[0]}
              {day?.[2] && (
                <div>
                  <div className="eventHide" id={"event" + day[2]}>
                    {renderEvent(day[2])}
                  </div>
                  <div className="eventDot"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="day" onClick={selectable ? daySelect : null}>
              {day}
            </div>
          )
        )}
      </div>
    </div>
  );
}
export default Calender;
