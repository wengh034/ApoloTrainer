import React from 'react';

const YearSelector = ({ years, selectedYear, onYearChange }) => {
  return (
    <select value={selectedYear} onChange={e => onYearChange(e.target.value)}>
      <option value="">Todos</option>
      {years.map(year => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
  );
};

export default YearSelector;
