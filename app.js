const express = require('express');
const dotEnv = require("dotenv");
const fileUpload = require("express-fileupload");
const path = require('path')
const { connectMonggose } = require("./config/db");

const {errorHandler} = require('./middlewares/errors');
const {setHeaders} = require("./middlewares/headers");
const patientRoutes = require("./routes/patient");
const doctorRoutes = require("./routes/doctor");
const expertiseRoutes = require('./routes/expertise')

//* Load Config
dotEnv.config({ path: "./config/config.env" });

//* Database connection
// connectDB();
connectMonggose()
//* Initial Server
const app = express();

//* BodyPaser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(setHeaders);

//* File Upload Middleware
app.use(fileUpload());

//* Static Folder
app.use(express.static(path.join(__dirname, "public")));

const api = process.env.API_URL
//* Routes
app.use(`${api}/patients` , patientRoutes);
app.use(`${api}/doctors` , doctorRoutes);
app.use(`${api}/expertises` , expertiseRoutes);


//* Error Controller
app.use(errorHandler)

const PORT = process.env.PORT || 4200;
app.listen(PORT, () =>
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
);
