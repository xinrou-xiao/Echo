const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.API_SERVER_PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/echoDB")
  .then(() => console.log("Mongo connected"))
  .catch(err => console.error("mongo connection failed:", err));

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const userRouter = require('./routes/user');
app.use('/api/user', userRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
