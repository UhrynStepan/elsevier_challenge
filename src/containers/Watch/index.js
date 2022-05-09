import React, { useState, useRef, useEffect, useCallback } from 'react';
import cx from 'classnames';
import moment from 'moment';
import TimezoneSelect from 'react-timezone-select';

import { SingleDatePicker } from 'react-dates';

import { setTimePeriod } from '../../actions';
import { useDispatch, useSelector } from 'react-redux';

import 'react-dates/initialize';
import 'moment-timezone';
import 'react-dates/lib/css/_datepicker.css';
import './index.css';

export const Watch = () => {
  const INTL_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [date, setDate] = useState(moment());
  const [selectedTimezone, setSelectedTimezone] = useState(INTL_TIME_ZONE);
  const [focused, setFocused] = useState(false);

  const timeRef = useRef(null);
  const autoResetRef = useRef(null);
  const dispatch = useDispatch();
  const timePeriod = useSelector(state => state.timePeriod);

  const autoTickDate = useCallback((d) => {
    if (timeRef.current) {
      clearInterval(timeRef.current);
      timeRef.current = null;
    }

    timeRef.current = setInterval(() => {
      setDate(moment(d || moment()).tz(INTL_TIME_ZONE));
    }, 1000);
  }, [INTL_TIME_ZONE]);

  const handleResetDate = useCallback(() => {
    setDate(moment());
    setSelectedTimezone(INTL_TIME_ZONE);

    if (timePeriod !== 'present') {
      dispatch(setTimePeriod('present'));
    }

    autoTickDate();
  }, [INTL_TIME_ZONE, autoTickDate, dispatch, timePeriod]);

  const autoReset = useCallback(() => {
    if (autoResetRef.current) {
      clearTimeout(autoResetRef.current);
      autoResetRef.current = null;
    }

    autoResetRef.current = setTimeout(handleResetDate, 15000);
  }, [handleResetDate]);

  const handleTimezoneChange = useCallback((e) => {
    setSelectedTimezone(e.value);

    autoReset();
  }, [autoReset]);

  const handleDateChange = useCallback((newDate) => {
    let timePeriod = 'present';

    if (moment(newDate).isBefore(new Date())) {
      timePeriod = 'past';
    } else if (moment(newDate).isAfter(new Date())) {
      timePeriod = 'future';
    }

    setDate(newDate);
    dispatch(setTimePeriod(timePeriod));

    autoTickDate(newDate);
    autoReset();
  }, [autoReset, autoTickDate, dispatch]);

  const handleFocusChange = useCallback(() => setFocused(!focused), [focused]);

  useEffect(() => {
    autoTickDate();

    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
      if (autoResetRef.current) {
        clearInterval(autoResetRef.current);
      }
    };
  }, []);

  return (
   <div className={cx('pageInner', timePeriod)}>
     <div className="watchInner">
       <TimezoneSelect
        value={selectedTimezone}
        onChange={handleTimezoneChange}
        className="timezoneDD"
       />
       <div className="timeBlock">
         <span className="time">
           {
             moment(date).tz(selectedTimezone).format('LTS')
           }
         </span>
         <div className="datePicker">
           <SingleDatePicker
            date={date || null}
            onDateChange={handleDateChange}
            focused={focused}
            onFocusChange={handleFocusChange}
            numberOfMonths={1}
            displayFormat={() => 'DD/MM/YYYY'}
            isOutsideRange={() => false}
           />
         </div>
       </div>
       <button
        onClick={handleResetDate}
        className="resetBtn"
       >
         Reset
       </button>
     </div>
   </div>
  );
};

export default Watch;
