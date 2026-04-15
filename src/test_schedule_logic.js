const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const { getNotificationEvent, schedule } = require('./schedule');

function runTest() {
    console.log('Testing Schedule Logic...');

    // Mock Date: 2026-01-29 (Thursday)
    const baseDate = '2026-01-29';

    // Test Case 1: 9:00 AM (Start of first lecture)
    const t1 = dayjs(`${baseDate} 09:00`, 'YYYY-MM-DD HH:mm');
    logResult('9:00 AM', getNotificationEvent(t1), 'start', 'Calendars 1 Daily Practice');

    // Test Case 2: 9:04 AM (Still Start Phase)
    const t2 = dayjs(`${baseDate} 09:04`, 'YYYY-MM-DD HH:mm');
    logResult('9:04 AM', getNotificationEvent(t2), 'start', 'Calendars 1 Daily Practice');

    // Test Case 3: 9:06 AM (Gap)
    const t3 = dayjs(`${baseDate} 09:06`, 'YYYY-MM-DD HH:mm');
    logResult('9:06 AM', getNotificationEvent(t3), null, null);

    // Test Case 4: 9:10 AM (Urgent Phase)
    const t4 = dayjs(`${baseDate} 09:10`, 'YYYY-MM-DD HH:mm');
    logResult('9:10 AM', getNotificationEvent(t4), 'urgent', 'Calendars 1 Daily Practice');

    // Test Case 5: 9:15 AM (Last minute of Urgent Phase depending on implementation)
    // My implementation: < 15 mins (open upper bound) or <= 15?
    // Code says: before(urgentWindowEnd) where end is Start+15. 
    // dayjs.before is exclusive by default? dayjs doc says default is exclusive.
    // Let's check 9:14
    const t5 = dayjs(`${baseDate} 09:14`, 'YYYY-MM-DD HH:mm');
    logResult('9:14 AM', getNotificationEvent(t5), 'urgent', 'Calendars 1 Daily Practice');

    // Test Case 6: Weekend (Saturday)
    const t6 = dayjs('2026-01-31 09:00', 'YYYY-MM-DD HH:mm');
    logResult('Saturday 9:00 AM', getNotificationEvent(t6), null, null);
}

function logResult(timeLabel, result, expectedType, expectedName) {
    let pass = false;
    if (expectedType === null) {
        pass = result === null;
    } else {
        pass = result && result.type === expectedType && result.lecture.name === expectedName;
    }

    const icon = pass ? '✅' : '❌';
    console.log(`${icon} [${timeLabel}] Expected: ${expectedType} - Got: ${result ? result.type : 'null'}`);
    if (!pass && result) {
        console.log('   got lecture:', result.lecture.name);
    }
}

runTest();
