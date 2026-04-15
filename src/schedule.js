const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

/**
 * @typedef {Object} ScheduleItem
 * @property {string} name - The name of the lecture or session.
 * @property {string} startTime - Start time in HH:mm 24-hour format.
 * @property {string} type - Type of session (e.g., 'lecture').
 */

/**
 * Fixed daily schedule of lectures.
 * @type {ScheduleItem[]}
 */
const schedule = [
  {
    name: 'Calendars 1 Daily Practice',
    startTime: '09:00',
    type: 'lecture'
  },
  {
    name: 'Zero Fill Matrix | Part - 1 (Self Learning)',
    startTime: '10:00',
    type: 'lecture'
  },
  {
    name: 'Your React Journey',
    startTime: '11:15',
    type: 'lecture'
  }
];

/**
 * Checks if current time is within a lecture's critical window (0 to 15 mins after start).
 * 
 * @param {dayjs.Dayjs} currentTime 
 * @returns {Object|null} { lecture, minutesElapsed, lectureStart } or null
 */
function getLectureStatus(currentTime) {
  // Only run on weekdays (Mon=1 to Fri=5)
  // 0 is Sunday, 6 is Saturday
  const day = currentTime.day();
  if (day === 0 || day === 6) {
    return null;
  }

  for (const session of schedule) {
    // Parse start time for *today*
    const [statsHour, startMinute] = session.startTime.split(':').map(Number);
    const lectureStart = currentTime.hour(statsHour).minute(startMinute).second(0).millisecond(0);

    // Check if we are in the [Start, Start + 15 mins] window
    // We allow a small buffer before start (e.g. -1 min) just in case cron fires slightly early
    const diffMins = currentTime.diff(lectureStart, 'minute', true); // Floating point diff

    if (diffMins >= -0.5 && diffMins <= 16) {
      return {
        lecture: session,
        minutesElapsed: diffMins,
        lectureStart: lectureStart
      };
    }
  }
  return null;
}

module.exports = { schedule, getLectureStatus };
