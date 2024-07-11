const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const setupDatabase = require('./config/databaseSetup')
const connectDB = require('./config/db')

dotenv.config();

setupDatabase()

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use("/api/v1/auth",require('./routes/authRoutes'))


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
