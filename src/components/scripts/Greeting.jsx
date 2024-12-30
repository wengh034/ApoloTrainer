import React, { useState, useEffect } from 'react';

const GreetingOne = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = (hours) => {
    if (hours >= 0 && hours < 3) {
      return 'Buenas noches';
    } else if (hours >= 3 && hours < 12) {
      return 'Buenos días';
    } else if (hours >= 12 && hours < 18) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  };

  const formatDate = (date) => {
    const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const dayOfWeek = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayOfWeek}, ${day} de ${month} del ${year}`;
  };

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  const hours = dateTime.getHours();
  const greeting = getGreeting(hours);
  const formattedDate = formatDate(dateTime);
  const formattedTime = formatTime(dateTime);

  return (
    <div className='greeting' style={{color:'#ccc',marginRight:'1em'}}>
      {/* <h4 style={{fontWeight:'normal'}}>{greeting}</h4> */}
      <p style={{fontWeight:'normal', fontSize:'smaller', margin:'0'}}>{formattedDate}</p>
      {/* <p>{formattedTime}</p> */}
    </div>
  );
};

export default GreetingOne;
