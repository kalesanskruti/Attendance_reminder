const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const { getLectureStatus, schedule } = require('./schedule');

function runTest() {
    console.log('Testing Optimization Logic (15-min Polling)...');

    // Mock Date: 2026-01-29 (Thursday)
    const baseDate = '2026-01-29';

    // Test Case 1: 9:00 AM (CRON JOB START)
    // Should detect lecture, 0 minutes elapsed.
    const t1 = dayjs(`${baseDate} 09:00`, 'YYYY-MM-DD HH:mm');
    logResult('9:00 AM', getLectureStatus(t1), 0, 'Calendars 1 Daily Practice');

    // Test Case 2: 9:05 AM (Manual restart / late cron?)
    // Should detect lecture, 5 minutes elapsed.
    const t2 = dayjs(`${baseDate} 09:05`, 'YYYY-MM-DD HH:mm');
    logResult('9:05 AM', getLectureStatus(t2), 5, 'Calendars 1 Daily Practice');

    // Test Case 3: 9:15 AM (Next CRON + Start overlap?)
    // 9:15 is +15 minutes from 9:00 start.
    // Logic: diffMins <= 16. So it should still return the 9:00 lecture?
    // Wait, 9:15 is technically the end of the window.
    // If it returns 9:00 lecture, we might send "Urgent" if we missed it?
    // BUT 9:15 is inside the window [0, 16], so yes.
    // However, if we process it, minutesElapsed=15.
    // Urgent logic: if elapsed <= 16, send urgent.
    const t3 = dayjs(`${baseDate} 09:15`, 'YYYY-MM-DD HH:mm');
    logResult('9:15 AM', getLectureStatus(t3), 15, 'Calendars 1 Daily Practice');

    // Test Case 4: 11:15 AM (Lecture Start)
    const t4 = dayjs(`${baseDate} 11:15`, 'YYYY-MM-DD HH:mm');
    logResult('11:15 AM', getLectureStatus(t4), 0, 'Your React Journey');

    // Test Case 5: 11:30 AM (15 mins after 11:15)
    // Should detect 11:15 lecture with ~15 mins elapsed.
    const t5 = dayjs(`${baseDate} 11:30`, 'YYYY-MM-DD HH:mm');
    logResult('11:30 AM', getLectureStatus(t5), 15, 'Your React Journey');

    // Test Case 6: Outside Window (9:30 AM)
    const t6 = dayjs(`${baseDate} 09:30`, 'YYYY-MM-DD HH:mm');
    logResult('9:30 AM', getLectureStatus(t6), null, null);
}

function logResult(timeLabel, result, expectedMins, expectedName) {
    let pass = false;
    if (expectedMins === null) {
        pass = result === null;
    } else {
        // Allow floating point tolerance
        pass = result && Math.abs(result.minutesElapsed - expectedMins) < 0.1 && result.lecture.name === expectedName;
    }

    const icon = pass ? '✅' : '❌';
    const got = result ? `${result.minutesElapsed.toFixed(1)}m` : 'null';
    console.log(`${icon} [${timeLabel}] Expected: ${expectedMins}m - Got: ${got}`);
}

runTest();
