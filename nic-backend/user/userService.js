const express = require("express");
const app = express();
require("dotenv").config();
const PORT = 3002;
const connection = require("./userdb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
app.use(express.json());

const transporter = nodeMailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

app.post("/submit-email", async (req, res) => {
  const { email, otp } = req.body;
  console.log(req.body);
  if (!email || !otp) {
    return res.status(400).send("Missing required fields or attachment.");
  } else {
    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, rows) => {
        if (err) {
          console.error("Error querying MySQL database:", err);
          return res.status(500).send("Internal Server Error");
        }
        if (rows.length === 1) {
          const name = rows[0].firstname;
          var mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Your OTP for Password Reset",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #333333;">Password Reset Request</h2>
                        <p style="font-size: 16px; color: #666666;">Dear <strong>${name}</strong>,</p>
                        <p style="font-size: 16px; color: #666666;">We received a request to reset your password. Use the OTP below to complete the process. This OTP is valid for the next 10 minutes.</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <p style="font-size: 22px; color: #333333; letter-spacing: 2px; font-weight: bold;">${otp}</p>
                        </div>
                        <p style="font-size: 16px; color: #666666;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
                    </div>
                    <div style="text-align: center; font-size: 14px; color: #999999; margin-top: 20px;">
                        <p>&copy; ${new Date().getFullYear()} All rights reserved.</p>
                    </div>
                </div>
            `,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              return res.status(500).send("Error sending email.");
            } else {
              console.log("Email sent: " + info.response);
              return res.status(200).send("Email sent successfully.");
            }
          });
        } else {
          return res.status(401).json({ error: "Invalid email" });
        }
      }
    );
  }
});

app.post("/register", (req, res) => {
  const { username, password, firstname, lastname, email } = req.body;
  console.log(req.body);

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

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
          connection.query(
            "INSERT INTO users (`firstname`, `lastname`, `username`, `email`, `password`) VALUES (?, ?, ?, ?, ?)",
            [firstname, lastname, username, email, hashedPassword],
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

app.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  console.log("Request received:", req.body);

  try {
    connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, rows) => {
        if (err) {
          console.error("Error querying MySQL database:", err);
          return res.status(500).send("Internal Server Error");
        }

        if (rows.length === 1) {
          try {
            const hashedPassword = rows[0].password;
            const result = await bcrypt.compare(password, hashedPassword);

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

              return res.json({ token: token });
            } else {
              console.log("Invalid password for user:", username);
              return res
                .status(401)
                .json({ error: "Invalid username or password" });
            }
          } catch (bcryptError) {
            console.error("Error comparing passwords:", bcryptError);
            return res.status(500).send("Internal Server Error");
          }
        } else {
          console.log("No user found with username:", username);
          return res
            .status(401)
            .json({ error: "Invalid username or password" });
        }
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/reset-pw", (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    connection.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email],
      (err, result) => {
        if (err) {
          console.error("Error updating password:", err);
          res.status(500).send("Internal Server Error");
          return;
        } else {
          res.status(200).json({ message: "Password updated successfully" });
        }
      }
    );
  });
});

app.listen(PORT, () => {
  console.log("User service running on port: " + PORT);
});
