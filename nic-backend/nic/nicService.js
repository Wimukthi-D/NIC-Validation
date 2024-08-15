const express = require("express");
const app = express();
const PORT = 3003;
const connection = require("./nicdb");
app.use(express.json());
const dayjs = require("dayjs");

const extractNicInfo = (nic) => {
  // Ensure NIC is treated as a string
  if (typeof nic !== "string") {
    nic = String(nic);
  }

  if (!nic || (nic.length !== 10 && nic.length !== 12)) {
    return { birthday: "Invalid NIC", gender: "N/A", age: "N/A" };
  }

  let birthYear, dayOfYear, gender, age;
  const currentYear = dayjs().year();

  if (nic.length === 10) {
    birthYear = parseInt(nic.substring(0, 2), 10) + 1900;
    dayOfYear = parseInt(nic.substring(2, 5), 10);
    gender = dayOfYear > 500 ? "Female" : "Male";
    dayOfYear = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;
  } else if (nic.length === 12) {
    birthYear = parseInt(nic.substring(0, 4), 10);
    dayOfYear = parseInt(nic.substring(4, 7), 10);
    gender = dayOfYear > 500 ? "Female" : "Male";
    dayOfYear = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;
  }

  const birthDate = dayjs(`${birthYear}-01-01`).add(dayOfYear - 1, "day");
  age = currentYear - birthDate.year();

  return {
    birthday: birthDate.format("YYYY-MM-DD"),
    gender,
    age,
  };
};

app.post("/validate", (req, res) => {
  const data = req.body;

  const result = data.map((fileData) => {
    const { fileName, data: records } = fileData;

    const validatedRecords = records.map((record) => {
      const nicKey = Object.keys(record)[0];
      const nic = record[nicKey];
      const nicInfo = extractNicInfo(nic);

      const query = `INSERT INTO records ( nic, birthday, gender, age) VALUES ( ?, ?, ?, ?)`;
      connection.query(
        query,
        [nic, nicInfo.birthday, nicInfo.gender, nicInfo.age],
        (err, result) => {
          if (err) {
            console.error("Error saving data to database:", err);
            return;
          }
          console.log("Record inserted:", result.insertId);
        }
      );

      return {
        nic,
        ...nicInfo,
      };
    });

    return {
      fileName,
      records: validatedRecords,
    };
  });

  console.log("Processed Data:", result);

  res.status(200).json({
    message: "Data validated, saved, and processed successfully",
    result,
  });
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
