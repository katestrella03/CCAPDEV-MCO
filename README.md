# CCAPDEV-MCO Web Application

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd <repo-folder>
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up MongoDB**
   - Make sure MongoDB is running locally on `mongodb://127.0.0.1:27017/mco_db` (or update the connection string in `config/db.js` if needed).
4. **Seed the database with sample data**
   ```bash
   node seed/seedData.js
   ```
5. **Run the application**
   ```bash
   node app.js
   ```
6. **Access the app**
   - Open your browser and go to [http://localhost:3000](http://localhost:3000)

## Project Structure
- `app.js` - Main application entry point
- `config/` - Database configuration
- `models/` - Mongoose models
- `public/` - Static assets (CSS, JS)
- `seed/` - Database seeding scripts
- `views/` - EJS templates

## Notes
- For deployment, see the deployment section in this README (to be added).
- For About page and dependencies, see the About page in the app (to be added).
