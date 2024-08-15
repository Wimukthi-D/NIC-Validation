const express = require("express");
const app = express();
const PORT = 3003;
const connection = require("./nicdb");
app.use(express.json());

app.post("/save", (req, res) => {
  const Numbers = req.body;
  console.log(Numbers);

  Numbers.forEach((Number) => {
    const nic = Number.nic;
    const birthday = Number.birthday;
    const gender = Number.gender;
    const age = Number.age;

    connection.query(
      "SELECT * FROM records WHERE nic = ?",
      [nic],
      (error, results) => {
        if (error) {
          console.log("An error occured:", error);
          return res.status(500).send("An error occured: " + error);
        }

        if (results && results.length > 0) {
          connection.query(
            "UPDATE records SET birthday = ?, gender = ?, age = ? WHERE nic = ?",
            [birthday, gender, age, nic],
            (error, results) => {
              if (error) {
                console.log("Error in UPDATE query:", error);
              } else {
                console.log("Record updated successfully");
              }
            }
          );
        } else {
          connection.query(
            "INSERT INTO records (nic, birthday, gender, age) VALUES (?, ?, ?, ?)",
            [nic, birthday, gender, age],
            (error, results) => {
              if (error) {
                console.log("Error in INSERT query:", error);
              } else {
                console.log("Record inserted successfully");
              }
            }
          );
        }
      }
    );
  });

  res.send("Data saved successfully");
});

app.get("/getRecordCount", (req, res) => {
  connection.query(
    "SELECT COUNT(CASE WHEN gender = 'male' THEN 1 END) AS male, COUNT(CASE WHEN gender = 'female' THEN 1 END) AS female FROM records",
    (error, results) => {
      if (error) {
        console.log("An error occured:", error);
        return res.status(500).send("An error occured: " + error);
      }

      res.json(results[0]);
    }
  );
});

app.get("/getYearRange", (req, res) => {
  connection.query(
    ` SELECT 
          FLOOR((YEAR(birthday) - 1900) / 10) * 10 + 1900 AS decade,
          COUNT(*) AS record_count
      FROM 
          records
      WHERE 
          YEAR(birthday) >= 1900
      GROUP BY 
          decade
      ORDER BY 
          decade;
  `,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

app.get("/getAgeGender", (req, res) => {});

app.listen(PORT, () => {
  console.log("NIC service running on port: " + PORT);
});
