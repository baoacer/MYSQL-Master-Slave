const mysql = require("mysql2");
const dotenv = require("dotenv");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "test",
  port: 8811,
});

pool.getConnection(function (err, connection) {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database!");
  connection.release();
});

const batchSize = 100000;
const totalSize = 10_000_000;

let currentId = 1;
console.time("::::::::::TIME:::::::::::");
const insertBatch = async () => {
  const values = [];
  for (let i = 0; i < batchSize && currentId <= totalSize; i++) {
    const name = `Name-${currentId}`;
    const age = currentId % 100;
    const address = `Address-${currentId}`;
    values.push([currentId, name, age, address]);
    currentId++;
  }

  if (!values.length) {
    console.timeEnd("::::::::::TIME:::::::::::");
    pool.end((err) => {
      if (err) {
        console.error("Error closing the connection:", err);
      } else {
        console.log("Connection closed.");
      }
    });
    return;
  }

  const sql = `INSERT INTO test_table (id, name, age, address) VALUES ?`;

  pool.query(sql, [values], async function (err, result) {
    if (err) {
      console.log(`Error inserting data::${err}`);
      return;
    }
    console.log(`Result::${result.affectedRows} rows inserted.`);
    await insertBatch();
  });
};

insertBatch().catch(console.error);
