// utils.cjs

function getFormattedDateTime() {
  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // La hora '0' debe ser '12'
  const formattedTime = `${hours}:${minutes} ${ampm}`;
  return `${formattedDate} / ${formattedTime}`;
}

function getNextMonthDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    date.setMonth(date.getMonth() + 1);
    return formatDate(date);
  } catch (error) {
    throw new Error('Failed to get next month date: ' + error.message);
  }
}

function getPreviousMonthDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    date.setMonth(date.getMonth() - 1);
    return formatDate(date);
  } catch (error) {
    throw new Error('Failed to get previous month date: ' + error.message);
  }
}

function formatDate(date) {
  try {
    return date.toISOString().split('T')[0];
  } catch (error) {
    throw new Error('Failed to format date: ' + error.message);
  }
}

module.exports = {
  getFormattedDateTime,
  getNextMonthDate,
  getPreviousMonthDate
};
