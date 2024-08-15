const express = require("express");
const app = express();
const PORT = 3002;
const connection = require("./userdb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
app.use(express.json());

app.post("/register", (req, res) => {
  // Register a new user
  const { username, password, firstName, lastName, email } = req.body;
  console.log(req.body);
  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Check if username, NIC, email, and phone number already exist
    connection.query(
      "SELECT * FROM users WHERE username = ? OR email = ? ",
      [username, email],
      (err, rows) => {
        if (err) {
          console.error("Error querying MySQL database:", err);
          res.status(500).send("Internal Server Error");
          return;
        }

        if (rows.length > 0) {
          const existingFields = rows[0];
          let errors = {};

          if (existingFields.username === username) {
            errors.username = "Username already exists";
          }
          if (existingFields.email === email) {
            errors.email = "Email already exists";
          }
          res.status(400).json({ error: "Fields already exist", errors });
          return;
        } else {
          // Insert new user into database with hashed password

          connection.query(
            "INSERT INTO users (`firstName`, `lastname`, `username`, `email`, `password`) VALUES (?, ?, ?, ?, ?)",
            [firstName, lastname, username, email, hashedPassword],
            (err, result) => {
              if (err) {
                console.error("Error inserting into MySQL database:", err);
                res.status(500).send("Internal Server Error");
                return;
              } else {
                res.status(201).json({
                  message: "User registered successfully",
                  UserId: result.insertId,
                });
              }
            }
          );
        }
      }
    );
  });
});

app.post("/login", (req, res, next) => {
  const { username, password } = req.body;
  console.log(req.body);

  try {
    connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, rows) => {
        if (err) {
          console.error("Error querying MySQL database:", err);
          res.status(500).send("Internal Server Error");
          return;
        }

        if (rows.length == 1) {
          const hashedPassword = rows[0].password; // Get the hashed password from the database
          const result = await bcrypt.compare(password, hashedPassword); // Compare the hashed password with the password sent by the user

          if (result) {
            const { userID, firstname, email } = rows[0];
            const token = jwt.sign(
              {
                auth: true,
                id: userID,
                firstname: firstname,
                email: email,
              },
              "JWTSecret",
              { expiresIn: "24h" }
            );

            res.json({ token: token });
          } else {
            res.status(401).json({ error: "Invalid username or password" });
          }
        } else {
          res.status(401).json({ error: "Invalid username or password" });
        }
      }
    );
  } catch (err) {
    console.error("Error querying MySQL database:", err);
    next(err);
  }
});

app.listen(PORT, () => {
  console.log("User service running on port: " + PORT);
});
