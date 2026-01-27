const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "file.env" });
const secretKey = process.env.SECRET_KEY;

function authStudent(req, res, next) {
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.json({"message" : 'Unauthorized!!'})
  const token = authHeader && authHeader.split(" ")[1];
  try {
    const user =jwt.verify(token, secretKey);
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    res.json({'errmsg' : 'Invalid Token', 'message' : "Invalid User! Please Login again..."})

  }
}
function authHod(req, res, next) {
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.json({"message" : 'Unauthorized!!'})
  const token = authHeader && authHeader.split(" ")[1];
  try {
    const user =jwt.verify(token, secretKey);
    req.user = user;

    next();
  } catch (err) {
    console.log(err);
    res.json({'errmsg' : 'Invalid Token', 'message' : "Invalid User! Please Login again..."})

  }
}function authAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.json({"message" : 'Unauthorized!!'})
  const token = authHeader && authHeader.split(" ")[1];
  try {
    const user =jwt.verify(token, secretKey);
    req.user = user;

    next();
  } catch (err) {
    console.log(err);
    res.json({'errmsg' : 'Invalid Token', 'message' : "Invalid User! Please Login again..."})

  }
}
module.exports ={
    authStudent,
    authHod,
    authAdmin
}