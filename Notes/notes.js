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

//////////////////////////////////////////////////////////////////////////

const extractNicInfo = (nic) => {
  if (!nic || (nic.length !== 10 && nic.length !== 12)) {
    return { birthday: "Invalid NIC", gender: "N/A", age: "N/A" };
  }

  let birthYear, dayOfYear, gender, age;
  const currentYear = dayjs().year();

  if (nic.length === 10) {
    // Old format:
    birthYear = parseInt(nic.substring(0, 2), 10) + 1900;
    dayOfYear = parseInt(nic.substring(2, 5), 10);
    gender = dayOfYear > 500 ? "Female" : "Male";
    dayOfYear = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;
  } else if (nic.length === 12) {
    // New format:
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

//////////////////////////////////////////
const express = require("express");
const dayjs = require("dayjs");
const app = express();
app.use(express.json());

const extractNicInfo = (nic) => {
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

app.post("/nic/validate", (req, res) => {
  const data = req.body;

  const result = data.map((fileData) => {
    const { fileName, data: records } = fileData;

    const validatedRecords = records.map((record) => {
      const { nic, ...otherFields } = record;
      const nicInfo = extractNicInfo(nic);

      return {
        ...otherFields,
        nic,
        ...nicInfo,
      };
    });

    return {
      fileName,
      records: validatedRecords,
    };
  });

  // Store the result in your database or perform any necessary operation
  console.log(result);

  res.status(200).json({ result });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
