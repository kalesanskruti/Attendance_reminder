const cron = require('node-cron');
const dayjs = require('dayjs');
const { getLectureStatus } = require('./schedule');
const { sendNotification } = require('./notifier');

// State to track sent reminders to prevent duplicates
// Format: { "YYYY-MM-DD": { "Lecture Name": true } }
const sentReminders = {};

console.log('College Attendance Reminder System Started');
console.log('Waiting for lecture windows...');

// Cleanup old history daily at midnight
// Cleanup old history daily at midnight
cron.schedule('0 0 * * *', () => {
    const today = dayjs().format('YYYY-MM-DD');
    // Keep only today's history or reset completely
    // Simple reset is enough as we only care about current day's lectures
    for (const date in sentReminders) {
        if (date !== today) {
            delete sentReminders[date];
        }
    }
    console.log(`[${new Date().toISOString()}] Daily cleanup completed.`);
});

async function checkAndNotify() {
    const now = dayjs();
    const todayKey = now.format('YYYY-MM-DD');
    const timeString = now.format('HH:mm');

    console.log(`[${timeString}] Checking schedule...`);

    const status = getLectureStatus(now);

    if (status) {
        const { lecture, minutesElapsed, lectureStart } = status;

        // Initialize state
        if (!sentReminders[todayKey]) {
            sentReminders[todayKey] = {};
        }
        if (!sentReminders[todayKey][lecture.name]) {
            sentReminders[todayKey][lecture.name] = { start: false, urgent: false };
        }

        const lectureState = sentReminders[todayKey][lecture.name];

        // 1. Start Notification (Immediate if not sent)
        if (!lectureState.start) {
            console.log(`Triggering 'Start' reminder for: ${lecture.name}`);
            const title = `Class Started: ${lecture.name}`;
            const message = `The lecture has started.\nPlease mark your attendance now.`;

            const success = await sendNotification(title, message);
            if (success) {
                lectureState.start = true;
            }
        }

        // 2. Urgent Notification Logic (Dynamic Scheduling)
        // Urgent is due at Start + 10 mins

        if (!lectureState.urgent) {
            const urgentTime = lectureStart.add(10, 'minute');
            const diffMs = urgentTime.diff(now);

            if (diffMs > 0) {
                // Future: Schedule timeout
                // Only schedule if not already pending? 
                // Simple approach: we rely on this check running once per 15 min.
                // If we are at min 0, we schedule for min 10.
                console.log(`Scheduling urgent reminder in ${(diffMs / 1000 / 60).toFixed(1)} minutes.`);
                setTimeout(async () => {
                    console.log(`Executing scheduled urgent reminder for: ${lecture.name}`);
                    // Re-check state to be safe (though closure captures it, referencing object property is safer)
                    if (!sentReminders[todayKey][lecture.name].urgent) {
                        const title = `URGENT: ${lecture.name}`;
                        const message = `You have 5 minutes left to mark attendance.\nMissing this may cost attendance marks.`;
                        const success = await sendNotification(title, message);
                        if (success) {
                            sentReminders[todayKey][lecture.name].urgent = true;
                        }
                    }
                }, diffMs);
            } else {
                // Past/Now: We are late or exactly on time (e.g. script started at 9:11)
                // Send immediately if within reasonable window (e.g. < 16 mins elapsed)
                if (minutesElapsed <= 16) {
                    console.log(`Triggering 'Urgent' reminder immediately for: ${lecture.name}`);
                    const title = `URGENT: ${lecture.name}`;
                    const message = `You have 5 minutes left to mark attendance.\nMissing this may cost attendance marks.`;
                    const success = await sendNotification(title, message);
                    if (success) {
                        lectureState.urgent = true;
                    }
                }
            }
        }
    }
}

// Run immediately on start (to recover if started mid-lecture)
checkAndNotify();

// Run every 15 minutes (0, 15, 30, 45)
const task = cron.schedule('*/15 * * * *', checkAndNotify);

// Graceful Shutdown
function handleShutdown(signal) {
    console.log(`\n${signal} received. Shutting down College Attendance Reminder System...`);
    task.stop();
    console.log('Scheduler stopped. Goodbye!');
    process.exit(0);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
