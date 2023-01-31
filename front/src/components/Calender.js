import "./calender.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

import { useState, useEffect } from "react";

library.add(faArrowLeft, faArrowRight);
function Calender() {
  const [month, setMonth] = useState(null);
  const [days, setDays] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
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
        if (
          date.getDate() === new Date().getDate() &&
          date.getMonth() === new Date().getMonth() &&
          date.getFullYear() === new Date().getFullYear()
        ) {
          days.push([date.getDate(), "today"]);
        } else {
          days.push(new Date(date).getDate());
        }
        date.setDate(date.getDate() + 1);
      }
      setDays([...dayLabels, ...days]);
      return days;
    }
  }, [month]);
  return (
    <div className="mainCal">
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
            <div className="dayLabel">{day}</div>
          ) : day?.[1] ? (
            <div className={day[1]}>{day[0]}</div>
          ) : (
            <div className="day">{day}</div>
          )
        )}
      </div>
    </div>
  );
}
export default Calender;
