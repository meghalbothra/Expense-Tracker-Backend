const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const dotenv = require("dotenv");

dotenv.config();

// Register Controller
const registerController = async (req, res) => {
  try {
    const { Name, email, password, fcmToken } = req.body;
    const joinedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const insertQuery =
      "INSERT INTO users (`Name`, `email`, `password`, `joinedDate` ,`fcmToken`) VALUES (?, ?, ?, ?, ?)";
    const existingQuery = "SELECT * FROM users WHERE email = ?";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    connectDB.query(existingQuery, [email], (err, data) => {
      if (err) {
        console.error("Error checking existing user:", err);
        return res.status(500).send({
          success: false,
          message: "Internal Server Error",
          error: err,
        });
      }
      if (data.length > 0) {
        return res.status(409).send({
          success: false,
          message: "Email already exists",
        });
      } else {
        connectDB.query(
          insertQuery,
          [Name, email, hashedPassword, joinedDate, fcmToken],
          (err, data) => {
            if (err) {
              console.log("Error inserting user: ", err);
              return res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: err,
              });
            }

            const token = jwt.sign(
              {
                userId: data.insertId,
                email: email,
              },
              process.env.JWT_SECRET,
              { expiresIn: '1d' }
            );

            return res.status(201).send({
              success: true,
              message: "User registered successfully",
              token,
            });
          }
        );
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in Register API",
      error: error.message,
    });
  }
};

// Login Controller
const loginController = async (req, res) => {
  try {
    const { email, password, fcmToken } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";
    const [results] = await connectDB.promise().query(query, [email]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = results[0];
    console.log("fcmToken = " ,user.fcmToken);
    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        fcmToken :user.fcmToken
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      success: true,
      message: "Login Successfully",
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in Login API",
      error: error.message,
    });
  }
};

module.exports = { registerController, loginController };
