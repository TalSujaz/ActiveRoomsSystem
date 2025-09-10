const apiRoutes = require('./routes/api');
const cors = require('cors'); 
const express = require('express');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: true, 
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api', apiRoutes);

module.exports = app;
