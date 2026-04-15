require('dotenv').config();
const axios = require('axios');

/**
 * Sends a notification via Telegram.
 * 
 * @param {string} title - The title of the notification.
 * @param {string} body - The body message of the notification.
 * @returns {Promise<boolean>} True if sent successfully, false otherwise.
 */
async function sendNotification(title, body) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.error('Error: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing in .env');
        return false;
    }

    const message = `*${title}*\n${body}`;

    try {
        await axios.post(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            },
            { timeout: 5000 } // 5s timeout to prevent hanging
        );
        console.log(`[${new Date().toISOString()}] Telegram notification sent.`);
        return true;
    } catch (error) {
        if (error.response) {
            // Server responded with a status code outside 2xx range
            const status = error.response.status;
            const data = error.response.data;
            if (status === 401 || status === 403) {
                console.error('CRITICAL: Telegram Bot Token is invalid or unauthorized.');
            } else if (status === 400) {
                console.error('Bad Request: Chat ID might be incorrect or message format is wrong.');
            }
            console.error(`Telegram API Error [${status}]:`, JSON.stringify(data));
        } else if (error.request) {
            // Request was made but no response
            console.error('Network Error: No response received from Telegram API.');
        } else {
            // Setup error
            console.error('Error in request setup:', error.message);
        }
        return false;
    }
}

module.exports = { sendNotification };
