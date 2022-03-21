// import express from "express";
const express = require("express");
// import db from "./db/mongoose.mjs"; // this ensures that mongoose runs, we're not necessarily grabbing sth from mongoose
const db = require("./db/mongoose.mjs");
// import multer from "multer";
// import {
// 	userCreate,
// 	userDeleteAccount,
// 	userProfile,
// 	userLogout,
// 	userLogoutAll,
// 	userUpdateOwn,
// 	userUploadAvatar,
// 	userDeleteAvatar,
// 	userProfileAvatar,
// } from "./routers/user.mjs";
const {
	userCreate,
	userDeleteAccount,
	userProfile,
	userLogout,
	userLogoutAll,
	userUpdateOwn,
	userUploadAvatar,
	userDeleteAvatar,
	userProfileAvatar,
} = require("./routers/user.mjs");

// import {
// 	taskCreate,
// 	taskFindAll,
// 	taskFindOne,
// 	taskUpdateOwn,
// 	taskDeleteOne,
// } from "./routers/task.mjs";
const {
	taskCreate,
	taskFindAll,
	taskFindOne,
	taskUpdateOwn,
	taskDeleteOne,
} = require("./routers/task.mjs");

const app = express();

// middleware function in between request and running route handler
// app.use((req, res, next) => {
// console.log(req.method, req.path);
// next();

// if (req.method === "GET") {
// 	res.send("GET requests are disabled");
// } else {
// only when next() is called, the execution proceeds to the route handler
// 	next();
// }

// res.status(503).send("service temporarily unavailable");
// });

// define paths and Express config
// const publicDirectoryPath = path.join(__dirname, "../public"); // static files
app.use(express.json()); // express will automatically parse incoming JSON

// register user api endpoints/routes
app.use(userCreate);
app.use(userDeleteAccount);
app.use(userProfile);
app.use(userLogout);
app.use(userLogoutAll);
app.use(userUpdateOwn);
app.use(userUploadAvatar);
app.use(userDeleteAvatar);
app.use(userProfileAvatar);

// register task api endpoints/routes
app.use(taskCreate);
app.use(taskDeleteOne);
app.use(taskFindAll);
app.use(taskFindOne);
app.use(taskUpdateOwn);

//
// Without middleware: new request -> run route handler
//
// With middleware: new request -> do something -> run route handler
//

// // add upload folder
// const upload = multer({
// 	dest: "images",
// });

// // register multer middleware
// app.post("/upload", upload.single("upload"), (req, res) => {
// 	res.send();
// });

// export default app;
module.exports = app;
