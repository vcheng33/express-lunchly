"use strict";

/** Database for lunchly */

const { Client } = require("pg");

const DB_URI = process.env.NODE_ENV === "test"
? "postgresql:///diogobotelho:password@localhost/lunchly_test"
: "postgresql://diogobotelho:password@localhost/lunchly";

let db = new Client({
  connectionString: DB_URI,
});

db.connect();


module.exports = db;
