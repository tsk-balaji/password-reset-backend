require("dotenv").config();
const express = require("express");
const initialise_Mongo_Connectivity = require("./database/connection.mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// CORS options
const corsOptions = {
  origin: "https://password-reset-tsk.netlify.app",
  optionsSuccessStatus: 200, // For legacy browser support
};

// Apply CORS middleware with options
app.use(cors(corsOptions));

// Connect to MongoDB
initialise_Mongo_Connectivity();

// Middleware for parsing JSON
app.use(bodyParser.json());

// Routes
app.use("/", require("./pages/forgotpassword/forgotpassword.controller"));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("WebService is Live on port:", PORT);
});
