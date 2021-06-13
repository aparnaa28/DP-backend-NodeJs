const fs = require('fs');
const jwt = require('jsonwebtoken');

// openssl genrsa -out app.rsa 1024
var privateKEY = fs.readFileSync('keys/app.rsa');
// openssl rsa -in app.rsa -pubout > app.rsa.pub
var publicKEY = fs.readFileSync('keys/app.rsa.pub');

var JWTOptions = {
  algorithm: 'RS256'
};

let verifyAuthToken = (req, res, next) => {
  let token = req.headers['auth'];

  /*if (!token) {
    next();
  //  return res.status(401).json({ msg: 'No token, authorization denied' });
  }*/
  
  if (token) {
    jwt.verify(token, publicKEY, JWTOptions, (err, token) => {
      if (err) {
        return res.status(400).send({ error: 'Tampered JWT' });
      } else {
        req.userId = token.userId;
        next();
      }
    });
  } else {
    next();
  }
};

let generateAuthToken = userId => {
  try {
    token = jwt.sign({ userId }, privateKEY, JWTOptions);
    return token;
  } catch {
    return null;
  }
};

module.exports = {
  verifyAuthToken,
  generateAuthToken
};
