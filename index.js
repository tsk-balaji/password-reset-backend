require("dotenv").config();
const express = require("express");
const initialise_Mongo_Connectivity = require("./database/connection.mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");


const corsOptions = {
  origin: "https://password-reset-tsk.netlify.app",
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://password-reset-tsk.netlify.app"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});



// Connect to MongoDB
initialise_Mongo_Connectivity();

const app = express();

app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3000; // Change the port number here

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log("WebService is Live on port :", PORT);
});

app.use("/", require("./pages/forgotpassword/forgotpassword.controller"));
