import mongoose from "mongoose";

const connectionURL = process.env.MONGODB_URL;
// const databaseName = "task-app-api";
// const connectionString = `${connectionURL}/${databaseName}`;
const connectionString = connectionURL;

// mongodb process needs to be up&running before kicking off mongoose
// useNewUrlParser and useCreateIndex no longer need to be explicitly set
// they're set to true by default in mongoose 6
const db = mongoose.connect(connectionString);

export default db;
