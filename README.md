
Built by https://www.blackbox.ai

---

# Bloxsfruit Ticketing System

## Project Overview
The **Bloxsfruit Ticketing System** is a web application built with Node.js and MongoDB, designed to facilitate the management of support tickets through integration with Discord. Users can create, manage, and respond to tickets in an intuitive dashboard. The application leverages Passport.js for user authentication and provides a user-friendly interface using EJS and Tailwind CSS.

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```
2. **Navigate to the project directory**:
   ```bash
   cd bloxsfruit-ticket-system
   ```
3. **Install the dependencies**:
   ```bash
   npm install
   ```
4. **Create a `.env` file** in the project root and add the following variables:
   ```plaintext
   MONGO_URI=<your_mongodb_connection_string>
   SESSION_SECRET=<your_session_secret>
   ticket_web=<your_ticket_web_url>
   ```
   Replace `<your_mongodb_connection_string>`, `<your_session_secret>`, and `<your_ticket_web_url>` with your actual configurations.

5. **Run the application**:
   ```bash
   npm start
   ```

## Usage
Once the application is running, navigate to `http://localhost:8083` in your browser. Here you can:
- Register and log in using Discord.
- Create new tickets.
- Manage existing tickets from the dashboard.
- Assign tickets to staff and communicate through messages.

## Features
- **User Authentication**: Secure login using Discord OAuth via Passport.js.
- **Dashboard**: View and manage tickets in a user-friendly interface.
- **Ticket Creation**: Users can quickly create new tickets specifying the relevant details.
- **Staff Management**: Staff members can view and update the status of tickets.
- **Real-time Notifications**: Users receive notifications via Discord when actions are taken on their tickets.
- **Responsive Design**: Built with Tailwind CSS for a modern, responsive UI.

## Dependencies
The project is built using several key libraries. The main dependencies are listed in `package.json`:
- `discord.js`: ^14.19.3
- `dot`: ^1.1.3
- `dotenv`: ^16.4.5
- `ejs`: ^3.1.10
- `env`: ^0.0.2
- `express`: ^4.21.2
- `express-session`: ^1.18.0
- `mongodb`: ^6.17.0
- `mongoose`: ^8.15.1
- `passport`: ^0.7.0
- `passport-discord`: ^0.1.4
- `tailwindcss`: ^3.4.3

## Project Structure
```
.
├── app.js                   # Main application file
├── package.json             # Project metadata and dependencies
├── package-lock.json        # Exact version lock for dependencies
├── tailwind.config.js       # Configuration for Tailwind CSS
├── models                   # Directory for Mongoose models
│   ├── Ticket.js            # Ticket model
│   └── User.js              # User model
├── routes                   # Directory for routing
│   ├── auth.js              # Authentication routes
│   ├── api.js               # API routes
│   └── tickets.js           # Ticket management routes
├── views                    # EJS views for rendering
│   ├── dashboard.ejs        # Dashboard view
│   ├── index.ejs            # Home page view
│   ├── new-ticket.ejs       # New ticket form view
│   └── staff-dashboard.ejs   # Staff dashboard view
├── public                   # Static files directory
│   ├── css                  # CSS files, including Tailwind output
│   └── js                   # JavaScript files
└── .env                     # Environment configuration file
```

## Contributing
Contributions are welcome! If you have any suggestions or improvements, feel free to create an issue or submit a pull request.

## License
This project is licensed under the [MIT License](LICENSE).