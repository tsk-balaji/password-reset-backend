require("dotenv").config();
const express = require("express");
const initialise_Mongo_Connectivity = require("./database/connection.mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");

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
