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

  if (!nic) {
    return {
      nic: "Empty Record",
      birthday: "",
      gender: "",
      age: "",
      isValid: false,
    };
  } else if (nic.length !== 10 && nic.length !== 12) {
    return {
      birthday: "Invalid NIC",
      gender: "Incorrect Length",
      age: "",
      isValid: false,
    };
  } else if (nic.length === 10 && !/^\d.*v$/i.test(nic)) {
    return {
      birthday: "Invalid NIC",
      gender: "Invalid Format",
      age: "",
      isValid: false,
    };
  } else if (nic.length === 12 && !/^\d+$/.test(nic)) {
    return {
      birthday: "Invalid NIC",
      gender: "Invalid Format",
      age: "",
      isValid: false,
    };
  }

  let birthYear, dayOfYear, gender, age;
  const currentYear = dayjs().year();

  if (nic.length === 10) {
    birthYear = parseInt(nic.substring(0, 2), 10) + 1900;
    dayOfYear = parseInt(nic.substring(2, 5), 10);
    if (
      (dayOfYear < 500 && dayOfYear > 366) ||
      (dayOfYear < 999 && dayOfYear > 866)
    ) {
      return {
        birthday: "Invalid NIC",
        gender: "Invalid birthyear format",
        age: "",
        isValid: false,
      };
    }
    gender = dayOfYear > 500 ? "Female" : "Male";
    dayOfYear = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;
  } else if (nic.length === 12) {
    birthYear = parseInt(nic.substring(0, 4), 10);
    dayOfYear = parseInt(nic.substring(4, 7), 10);
    if (
      (dayOfYear < 500 && dayOfYear > 366) ||
      (dayOfYear < 999 && dayOfYear > 866)
    ) {
      return {
        birthday: "Invalid NIC",
        gender: "Invalid birthyear format",
        age: "",
        isValid: false,
      };
    }
    gender = dayOfYear > 500 ? "Female" : "Male";
    dayOfYear = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;
  }

  const birthDate = dayjs(`${birthYear}-01-01`).add(dayOfYear - 1, "day");
  age = currentYear - birthDate.year();

  if (age < 17) {
    return {
      birthday: "Invalid NIC",
      gender: "Underage",
      age: "",
      isValid: false,
    };
  }
  return {
    birthday: birthDate.format("YYYY-MM-DD"),
    gender,
    age,
    isValid: true,
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

      if (!nicInfo.isValid) {
        // If NIC is invalid, resolve immediately without inserting into the database
        return Promise.resolve({
          nic,
          ...nicInfo,
          exist: false,
          error: "Invalid NIC",
        });
      }

      return new Promise((resolve) => {
        const checkQuery = `SELECT nic FROM records WHERE nic = ?`;
        connection.query(checkQuery, [nic], (err, results) => {
          if (err) {
            console.error("Error checking database:", err);
            resolve({
              nic,
              ...nicInfo,
              exist: false,
              error: "Database error",
            });
            return;
          }

          if (results.length > 0) {
            // NIC already exists
            resolve({
              nic,
              ...nicInfo,
              exist: true,
            });
          } else {
            // NIC doesn't exist, insert it
            const insertQuery = `INSERT INTO records (nic, birthday, gender, age) VALUES (?, ?, ?, ?)`;
            connection.query(
              insertQuery,
              [nic, nicInfo.birthday, nicInfo.gender, nicInfo.age],
              (err, result) => {
                if (err) {
                  console.error("Error saving data to database:", err);
                  resolve({
                    nic,
                    ...nicInfo,
                    exist: false,
                    error: "Database error",
                  });
                  return;
                }
                console.log("Record inserted:", result.insertId);
                resolve({
                  nic,
                  ...nicInfo,
                  exist: false,
                });
              }
            );
          }
        });
      });
    });

    return {
      fileName,
      records: Promise.all(validatedRecords),
    };
  });

  // Wait for all database operations to complete
  Promise.all(result.map((file) => file.records)).then((records) => {
    res.status(200).json({
      message: "Data validated, saved, and processed successfully",
      result: result.map((file, index) => ({
        fileName: file.fileName,
        records: records[index],
      })),
    });
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

app.get("/getAllRecords", (req, res) => {
  connection.query(
    `SELECT nic, DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday, age, gender 
  FROM records`,
    (error, results) => {
      if (error) {
        console.log("An error occured:", error);
        return res.status(500).send("An error occured: " + error);
      }
      res.json(results);
    }
  );
});

app.post("/getRecordsByFile", (req, res) => {
  const data = req.body;
  console.log("Received data:", data);

  const nics = data.map((record) => record.nic);
  console.log("Extracted NICs:", nics);

  if (nics.length === 0) {
    return res.status(400).send("No NICs provided");
  }

  // Construct the query with a placeholder for each NIC
  const placeholders = nics.map(() => "?").join(", ");
  const query = `SELECT nic, DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday, age, gender FROM records WHERE nic IN (${placeholders})`;

  connection.query(query, nics, (error, results) => {
    if (error) {
      console.log("An error occurred:", error);
      return res.status(500).send("An error occurred: " + error);
    }
    console.log("Results:", results);
    res.json(results);
  });
});

app.put("/updateAge", (req, res) => {
  connection.query("SELECT nic, birthday FROM records", (error, results) => {
    if (error) {
      console.log("An error occurred:", error);
      return res.status(500).send("An error occurred: " + error);
    }
    const updates = results.map((record) => {
      const nic = record.nic;
      const birthday = record.birthday;
      const newAge = dayjs().diff(birthday, "year");
      return { nic, newAge };
    });

    if (updates.length === 0) {
      return res.status(200).send("No records to update");
    }

    let updateQuery = "UPDATE records SET age = CASE";
    const nics = [];

    updates.forEach(({ nic, newAge }) => {
      updateQuery += ` WHEN nic = ? THEN ?`;
      nics.push(nic, newAge);
    });

    updateQuery += " ELSE age END WHERE nic IN (";
    updateQuery += updates.map(({ nic }) => "?").join(", ");
    updateQuery += ")";

    connection.query(
      updateQuery,
      [...nics, ...updates.map(({ nic }) => nic)],
      (error, result) => {
        if (error) {
          console.log("Error in bulk UPDATE query:", error);
          return res
            .status(500)
            .send("An error occurred while updating records: " + error);
        }

        console.log("Records updated successfully:", result.affectedRows);
        res.status(200).send("Ages updated successfully");
      }
    );
  });
});

app.listen(PORT, () => {
  console.log("NIC service running on port: " + PORT);
});
