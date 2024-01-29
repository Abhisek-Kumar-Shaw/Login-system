const express = require("express");
const rateLimit = require("express-rate-limit");
const winston = require("winston");
const app = express.Router();
const path = require("path");
const cors = require("cors");
app.use(cors());
express().set("view engine", "ejs");
express().set("views", path.resolve("../views/index"));
var nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const User = require("../model/userDetails");
const Otp = require("../model/opt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = 
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Define the timestamp format
    winston.format.json()
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

app.post("/social", async (req, res) => {
  const { fname, email, password } = req.body;

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let Password = "";

  for (let i = 0; i < 13; i++) {
    Password += characters[Math.floor(Math.random() * characters.length)];
  }
  try {
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.json({ status: "User Exists", user:oldUser });
    }
    await User.create({
      fname,
      userType:"User",
      email,
      password: Password,
    });
    res.send({ status: "ok" });
  } catch (error) {
    logger.error("/social", {
      test: error,
    });
    res.send({ status: "error" });
  }
});

app.post("/register", async (req, res) => {
  const { fname, lname, email, password, userType } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.json({ error: "User Exists" });
    }
    await User.create({
      fname,
      lname,
      email,
      password: encryptedPassword,
      userType,
    });
    res.send({ status: "ok" });
  } catch (error) {
    logger.error("/register", {
      test: error.message,
    });
    res.send({ status: "error" });
  }
});

app.post("/editProfile", async (req, res) => {
  const { fname, lname, email, userType } = req.body;

  try {
    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      return res.json({ status: "User Not Exists!!" });
    } else {
      await User.updateMany({
        fname,
        lname,
        userType,
      });
      res.send({ status: "ok" });
    }
  } catch (error) {
    logger.error("/editProfile", {
      test: error,
    });
    res.send({ status: "error" });
  }
});

app.post("/verifyOtp", async (req, res) => {
  const { otp, token } = req.body;
  try {
    const verifiedOtp = await Otp.findOne({ otp });
    if (!verifiedOtp) {
      return res.json({ error: "Invalid Otp" });
    } else {
      return res.json({ status: "ok", data: token });
    }
  } catch (error) {
    logger.error("/verifyOtp", {
      test: error,
    });
  }
});

// const loginAttempts = {};

// const loginLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 5, // 5 attempts per windowMs
//   message: "Your IP is blocked for 10 minute. Retry after 10 minute.",
// });

// app.post("/login-user", loginLimiter, async (req, res) => {
//   const { email, password, otp } = req.body;
//   const Email = email;
//   const clientIp = req.ip;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.json({ error: "User Not found" });
//     }

//     const attempts = loginAttempts[clientIp] || 0;

//     if (await bcrypt.compare(password, user.password)) {
//       const token = jwt.sign({ email: user.email, user: user }, JWT_SECRET, {
//         expiresIn: "15m",
//       });

//       // Reset login attempts on successful login
//       loginAttempts[clientIp] = 0;

//       //  existing code

//       if (res.status(201)) {
//         //otp verification
//         const fourDigitotp = Math.floor(1000 + Math.random() * 9000).toString();
//         const newOtp = new Otp({ otp: fourDigitotp });
//         await newOtp.save();

//         var transporter = nodemailer.createTransport({
//           service: "gmail",
//           auth: {
//             user: "amit.kumar.aaensatech@gmail.com",
//             pass: "svsnlkzwjhmejmyl",
//           },
//         });

//         var mailOptions = {
//           from: "amit.kumar.aaensatech@gmail.com",
//           to: Email,
//           subject: "Otp Verification",
//           text: fourDigitotp,
//         };

//         transporter.sendMail(mailOptions, function (error, info) {
//           if (error) {
//             logger.error("/login-user", {
//               test: error.message,
//             });
//             console.log(error);
//           } else {
//             console.log("Email sent: " + info.response);
//           }
//         });

//         console.log(fourDigitotp);

//         return res.json({ status: "ok", data: token });
//       } else {
//         return res.json({ error: "error" });
//       }
//     } else {
//       // Increment login attempts locally
//       loginAttempts[clientIp] = attempts + 1;
//       console.log(`IP ${clientIp} has failed login attempts.`);

//       return res.json({ status: "error", error: "Invalid Password" });
//     }
//   } catch (error) {
//     logger.error("/login-user", {
//       test: error.message,
//     });
//     console.error(error);
//     res.json({ status: "error", error: "Internal Server Error" });
//   }
// });


app.post("/login-user", async (req, res) => {
  const { email, password, otp } = req.body;
  const Email = email;
  

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ error: "User Not found" });
    }

   

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ email: user.email, user: user }, JWT_SECRET, {
        expiresIn: "15m",
      });


      if (res.status(201)) {
        //otp verification
        const fourDigitotp = Math.floor(1000 + Math.random() * 9000).toString();
        const newOtp = new Otp({ otp: fourDigitotp });
        await newOtp.save();

        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "amit.kumar.aaensatech@gmail.com",
            pass: "svsnlkzwjhmejmyl",
          },
        });

        var mailOptions = {
          from: "amit.kumar.aaensatech@gmail.com",
          to: Email,
          subject: "Otp Verification",
          text: fourDigitotp,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            logger.error("/login-user", {
              test: error.message,
            });
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });

        console.log(fourDigitotp);

        return res.json({ status: "ok", data: token });
      } else {
        return res.json({ error: "error" });
      }
    } 
  } catch (error) {
    logger.error("/login-user", {
      test: error.message,
    });
    console.error(error); 
    res.json({ status: "error", error: "Internal Server Error" });
  }
});

app.post("/userData", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET, (err, res) => {
      if (err) {
        return "token expired";
      }
      return res;
    });
    console.log(user);
    if (user == "token expired") {
      return res.send({ status: "error", data: "token expired" });
    }

    const useremail = user.email;
    User.findOne({ email: useremail }).then((data) => {
      res.send({ status: "ok", data: data });
    });
    logger
      .error("/userData", {
        test: "successful pass",
      })
      .catch((error) => {
        logger.error("/userData", {
          test: error,
        });
        res.send({ status: "error", data: error });
      });
  } catch (error) {
    logger.error("/userData", {
      test: error,
    });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      return res.json({ status: "User Not Exists!!" });
    }
    const secret = JWT_SECRET + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "5m",
    });
    const link = `http://localhost:5000/reset-password/${oldUser._id}/${token}`;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amit.kumar.aaensatech@gmail.com",
        pass: "svsnlkzwjhmejmyl",
      },
    });

    var mailOptions = {
      from: "amit.kumar.aaensatech@gmail.com",
      to: email,
      subject: "Password Reset",
      text: link,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        logger.error("//forgot-password", {
          test: error,
        });
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        return res.json({ status: "Link sent to Register Email" });
      }
    });
    console.log(link);
  } catch (error) {
    logger.error("//forgot-password", {
      test: error,
    });
  }
});

app.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  console.log(req.params);
  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    res.render("../views/index.ejs", {
      email: verify.email,
      status: "Not Verified",
    });
  } catch (error) {
    logger.error("/reset-password/:id/:token", {
      test: error,
    });
    console.log(error);
    res.send("Not Verified");
  }
});

app.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
    );

    res.render("../views/index.ejs", {
      email: verify.email,
      status: "verified",
    });
  } catch (error) {
    logger.error("/reset-password/:id/:token", {
      test: error,
    });
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
});

module.exports = app;
