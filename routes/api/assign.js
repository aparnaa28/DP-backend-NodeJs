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

// @route   POST /assign/assign-officer
// @desc    To assign an officer
// @access  Private
route.post('/assign-officer', (req, res) => {
  var userId = req.userId;
  if (userId == null) {
    return res.status(400).send({ error: 'Not Logged In' });
  }

  if (req.body.suspect_id == null || req.body.officer_id == null) {
    return res.status(400).send('Bad request');
  }

  console.log('reached 0');
  var p1 = new Promise(function(resolve, reject) {
    Officers.findOne({ _id: userId }, (err, user) => {
      if (err) {
        console.log(err);
        reject('Internal server error');
      } else {
        resolve({ user });
      }
    });
  });

  console.log('reached 1');
  var p2 = new Promise(function(resolve, reject) {
    Officers.findOne({ _id: req.body.officer_id }, (err, officer) => {
      if (err) {
        console.log(err);
        reject('Internal server error');
      } else {
        resolve({ officer });
      }
    });
  });

  console.log('reached 2');
  var p3 = new Promise(function(resolve, reject) {
    Suspects.findOne({ _id: req.body.suspect_id }, (err, suspect) => {
      // console.log(suspects);

      if (err) {
        console.log(err);
        reject('Internal server error');
      } else {
        resolve({ suspect });
      }
    });
  });

  console.log('reached 3');
  Promise.all([p1, p2, p3])
    .then(values => {
      console.log(values);

      console.log('reached 4');
      if (values[0].user.is_enabled == false || values[0].user.role == 0) {
        return res.status(400).send({ err: 'Not allowed' });
      }

      if (
        values[1].officer.police_station != values[2].suspect.police_station
      ) {
        return res.status(400).send({ err: 'Not allowed' });
      }

      if (
        values[0].user.role == 1 &&
        values[1].officer.police_station != values[0].user.police_station
      ) {
        return res.status(400).send({ err: 'Not allowed' });
      }

      if (
        values[0].user.role == 2 &&
        values[1].officer.sub_division_code != values[0].user.sub_division_code
      ) {
        return res.status(400).send({ err: 'Not allowed' });
      }

      if (
        values[0].user.role == 3 &&
        values[1].officer.division_code != values[0].user.division_code
      ) {
        return res.status(400).send({ err: 'Not allowed' });
      }

      if (values[1].officer.role > 0) {
        return res
          .status(400)
          .send({ err: 'You cannot tag suspect to this officer' });
      }

      // if (values[2].suspect.officer_id != null) {
      //   return res.status(400).send({ err: 'Not allowed' });
      // }
      //
      console.log('reached 5');

      var updatedSuspectUpdate = {};
      updatedSuspectUpdate.officer_id = req.body.officer_id;
      Suspects.findOneAndUpdate(
        { _id: req.body.suspect_id },
        updatedSuspectUpdate,
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).send({ err: 'Server error' });
          } else {
            console.log(result);
            return res.status(200).send({ msg: 'Successfully Assigned' });
          }
        }
      );

      console.log('reached 6');
    })
    .catch(error => {
      res.send({ err: error });
    });
});

module.exports = route;
