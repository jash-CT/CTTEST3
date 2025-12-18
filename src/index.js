const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Import the express app (routes and middleware are set up in src/app.js)
const app = require('./app');

const PORT = process.env.PORT || 3000;

// Start the server only after DB connection
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start server due to DB error', err);
    process.exit(1);
  });
