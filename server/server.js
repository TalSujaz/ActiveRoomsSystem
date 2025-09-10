// server.js
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js'; // Make sure your app file is also ESM (use .js extension)
import express from 'express';
import bodyParser from 'body-parser';

const PORT = process.env.PORT || 3001;

// If you need to apply JSON/body parsing in server
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// If using body-parser separately
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});