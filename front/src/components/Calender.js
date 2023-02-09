import "./calender.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

import { useState, useEffect } from "react";

library.add(faArrowLeft, faArrowRight);
function Calender({ small = false, selectable = false, sendDate = null }) {
  const [month, setMonth] = useState(null);
  const [days, setDays] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
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

  const date = new Date();
  const nextMonth = () => {
    let next = toNum[month] + 1;
    if (next > 11) {
      next = 0;
      setYear(year + 1);
    }
    setMonth(toMonth[next]);
  };
  const prevMonth = () => {
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
        let wordDate =
          date.getDate() +
          " " +
          toMonth[date.getMonth()] +
          " " +
          date.getFullYear();
        console.log(wordDate, startDate, endDate);
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
        date.setDate(date.getDate() + 1);
      }
      setDays([...dayLabels, ...days]);
      return days;
    }
  }, [month, startDate, endDate]);
  return (
    <div className={!small ? "mainCal" : "mainCal small"}>
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
        {days.map((day) =>
          dayLabels.includes(day) ? (
            <div className="dayLabel" onClick={selectable ? daySelect : null}>
              {day}
            </div>
          ) : day?.[1] ? (
            <div className={day[1]} onClick={selectable ? daySelect : null}>
              {day[0]}
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
