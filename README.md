# College Attendance Reminder System

A robust, automated Node.js application designed to send timely notifications for college lectures. This system ensures students never miss a lecture by sending reminders 10 minutes before the start of a session via Telegram.

## 🚀 Features
- **Automated Scheduling**: Runs 24/7 using `node-cron` to check for upcoming lectures.
- **Smart Reminders**: Sends notifications exactly when needed (10-15 minute window).
- **Duplicate Prevention**: intelligent state management ensures you only get one reminder per lecture.
- **Telegram Integration**: Uses the Telegram Bot API for instant, reliable alerts.
- **Robust Error Handling**: Graceful degradation and error logging to ensure system stability.
- **Secure**: Sensitive configuration uses environment variables.

## 🛠️ Technology Stack
- **Runtime**: Node.js
- **Scheduling**: `node-cron`
- **Time Management**: `dayjs`
- **Networking**: `axios`
- **Notifications**: Telegram Bot API

## 📋 Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Your Telegram Chat ID

## ⚙️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd college-attendance-reminder
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    TELEGRAM_BOT_TOKEN=your_bot_token_here
    TELEGRAM_CHAT_ID=your_chat_id_here
    ```

4.  **Run the Application**
    ```bash
    npm start
    ```

## 🛡️ Security
This project follows security best practices:
- **Secrets Management**: `.env` is git-ignored to prevent credential leaks.
- **Error Masking**: Sensitive tokens are scrubbed from error logs.
- **Input Validation**: Schedule data is validated before processing.

## 📝 License
This project is licensed under the MIT License.
