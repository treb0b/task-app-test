import app from "./app.mjs";

const port = process.env.PORT || 3000;

// start server on a given port
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
