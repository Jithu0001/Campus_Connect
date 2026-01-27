const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const adminRouter = require('./Routers/adminRoute')
const studentRouter = require('./Routers/studentRoute')
const hodRouter = require('./Routers/hodRoute')
require("dotenv").config({ path: "file.env" });
const escalation = require('./Jobs/escalationJob')
const app = express();
app.use(express.json());
app.use(cors())

mongoose
  .connect("mongodb://localhost:27017/Campus_Connect")
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.log(err));

  app.use(adminRouter)
  app.use(studentRouter)
  app.use(hodRouter);
  escalation()
app.get('/', (req, res) => {
  res.send('Server is running!!Complaint Management System.');
});

const port = process.env.PORT || 8000

app.listen(port, () => console.log(`Listening to port ${port}`));

