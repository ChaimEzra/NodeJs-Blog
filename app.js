require("dotenv").config();

const express = require("express");
const expressLayout = require("express-ejs-layouts");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");

const connectDB = require("./server/config/db.js");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB

connectDB();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "keybord cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    //cookie: {maxAge: newDate (Date.now() +(3600000))}
  })
);

app.use(express.static("public"));

//Template Engine
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.use("/", require("./server/routes/main.js"));
app.use("/", require("./server/routes/admin.js"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`app listening on port http://0.0.0.0${PORT}`);
});
