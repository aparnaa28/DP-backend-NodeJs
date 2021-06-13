const express = require('express');
const mongoose = require('mongoose');
const request = require('request');
const Officers = require('../../models/officers');
const Reports = require('../../models/reports');
const Suspects = require('../../models/suspects');
const MobileAuthSessions = require('../../models/mobile_auth_sessions');
const verifyAuthToken = require('../../middleware/auth').verifyAuthToken;
const generateAuthToken = require('../../middleware/auth').generateAuthToken;
const route = express.Router();

// @route   POST /verify/send-otp
// @desc    To send OTP
// @access  Private
route.post('/send-otp', (req, res) => {
  var userId = req.userId;
  if (userId != null) {
    return res.status(400).send({ error: 'Already Logged In' });
  }
  console.log('3');
  const phone_number = req.body.phone_number;
  console.log('4');
  Officers.find({ phone_number: phone_number }, (err, foundOfficer) => {
    if (foundOfficer.length <= 0) {
      console.log('5');
      return res.status(400).send({ error: 'User Not Found' });
    } else if (err) {
      console.log('6');
      return res
        .status(500)
        .send({ error: 'Internal Server Error. Please try again later.' });
    } else {
      console.log('7');
      //  Previous url "http://2factor.in/API/V1/f9844255-eb94-11e9-b828-0200cd936042/SMS/"
      const URL =
        'http://2factor.in/API/V1/2b16b638-0ab5-11ea-9fa5-0200cd936042/SMS/' +
        phone_number +
        '/AUTOGEN';
      const options = {
        method: 'GET',
        url: URL,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        form: {}
      };

      request(options, function(error, response, body) {
        console.log('8');
        if (error) {
          return res
            .status(500)
            .send({ error: 'Internal Server Error. Please try again later.' });
        } else if (response.statusCode != 200) {
          var obj = JSON.parse(body);
          return res.status(500).send({ error: obj['Details'] });
        } else {
          var obj = JSON.parse(body);
          console.log('9');
          var session_id = obj['Details'];
          var mobileAuthSession = new MobileAuthSessions({
            phone_number: phone_number,
            session_id: session_id
          });
          mobileAuthSession.save(err => {
            if (err) {
              console.log('10');
              return res.status(500).send({ error: err });
            } else {
              console.log('11');
              return res.status(200).send({ session_id: session_id });
            }
          });
        }
      });
    }
  });
});

// @route   POST /verify/verify-otp
// @desc    To verify OTP
// @access  Private
route.post('/verify-otp', (req, res) => {
  var userId = req.userId;
  if (userId != null) {
    return res.status(400).send({ error: 'Already Logged In' });
  }

  const session_id = req.body.session_id;
  const otp = req.body.otp;

  var p1 = new Promise(function(resolve, reject) {
    MobileAuthSessions.find(
      { session_id: session_id },
      (err, mobileAuthSessions) => {
        if (mobileAuthSessions.length <= 0) {
          console.log('12');
          reject('Session not found');
        } else if (err) {
          console.log('13');
          reject('Internal Server Error.');
        }
        resolve(mobileAuthSessions[0].phone_number);
      }
    );
  });

  var p2 = new Promise(function(resolve, reject) {
    const URL =
      'http://2factor.in/API/V1/2b16b638-0ab5-11ea-9fa5-0200cd936042/SMS/VERIFY/' +
      session_id +
      '/' +
      otp;
    const options = {
      method: 'GET',
      url: URL,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      form: {}
    };
    console.log('15');

    request(options, function(error, response, body) {
      console.log('16');
      var obj = JSON.parse(body);
      if (error) {
        console.log('17');
        reject('Internal Server Error. Please try again later.');
      } else if (response.statusCode != 200) {
        console.log('18');
        reject(obj['Details']);
      }
      console.log('19');
      resolve();
    });
  });

  Promise.all([p1, p2])
    .then(results => {
      console.log(results[0]);
      console.log('20');
      return new Promise(function(resolve, reject) {
        Officers.find({ phone_number: results[0] }, (err, officers) => {
          console.log(officers);
          console.log('21');
          if (err) {
            console.log('22');
            return reject('Internal Server Error. Please try again later.');
          } else if (officers.length <= 0) {
            console.log('23');
            return reject('User Not Found');
          }
          console.log('24');
          return resolve(officers[0].id);
        });
      });
    })
    .then(result => {
      console.log('25');
      token = generateAuthToken(result);
      res.status(200).send({ auth: token });
    })
    .catch(err => {
      console.log('26');
      res.status(500).send({ error: err });
    });
});
module.exports = route;
