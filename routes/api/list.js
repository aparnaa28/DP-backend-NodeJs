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

// @route   POST /list/list-reports
// @desc    To get list of all reports
// @access  Private
route.post('/list-reports', (req, res) => {
  var userId = req.userId;
  if (userId == null) {
    return res.status(400).send({ error: 'Log in first' });
  }

  Officers.findOne({ _id: userId }, function(err, officer) {
    if (err) {
      console.log(err);
    }

    if (officer.is_enabled == false) {
      return res.status(401).send({ error: 'not allowed' });
    }

    if (req.body.suspect_id == null) {
      if (officer.role == 0) {
        Reports.find({ officer_id: officer._id }, function(err, reports) {
          if (err) {
            console.log(err);
          }

          return res.send({ reports: reports });
        });
      } else if (officer.role == 1) {
        Reports.find({ police_station: officer.police_station }, function(
          err,
          reports
        ) {
          if (err) {
            console.log(err);
          }

          return res.send({ reports: reports });
        });
      } else if (officer.role == 2) {
        Reports.find({ sub_division_code: officer.sub_division_code }, function(
          err,
          reports
        ) {
          if (err) {
            console.log(err);
          }

          return res.send({ reports: reports });
        });
      } else {
        Reports.find({ division_code: officer.division_code }, function(
          err,
          reports
        ) {
          if (err) {
            console.log(err);
          }

          return res.send({ reports: reports });
        });
      }
    } else {
      if (officer.role == 0) {
        Reports.find(
          { officer_id: officer._id, suspect_id: req.body.suspect_id },
          function(err, reports) {
            if (err) {
              console.log(err);
            }

            return res.send({ reports: reports });
          }
        );
      } else if (officer.role == 1) {
        Reports.find(
          {
            police_station: officer.police_station,
            suspect_id: req.body.suspect_id
          },
          function(err, reports) {
            if (err) {
              console.log(err);
            }

            return res.send({ reports: reports });
          }
        );
      } else if (officer.role == 2) {
        Reports.find(
          {
            sub_division_code: officer.sub_division_code,
            suspect_id: req.body.suspect_id
          },
          function(err, reports) {
            if (err) {
              console.log(err);
            }

            return res.send({ reports: reports });
          }
        );
      } else {
        Reports.find(
          {
            division_code: officer.division_code,
            suspect_id: req.body.suspect_id
          },
          function(err, reports) {
            if (err) {
              console.log(err);
            }

            return res.send({ reports: reports });
          }
        );
      }
    }
  });
});

// @route   POST /list/list-officers
// @desc    To get list of all officers
// @access  Private
route.post('/list-officers', (req, res) => {
  var userId = req.userId;
  if (userId == null) {
    return res.status(400).send({ error: 'Not Logged In' });
  }

  Officers.findOne({ _id: userId }, (err, officer) => {
    if (err) console.log(err);

    if (officer.is_enabled == false) {
      return res.status(401).send({ error: 'Not allowed' });
    }

    if (officer.role == 0) {
      return res.status(401).send({ error: 'Not allowed' });
    } else if (officer.role == 1) {
      Officers.find(
        { police_station: officer.police_station },
        {},
        { sort: { name: 1 } },
        (err, officers) => {
          if (err) console.log(err);

          return res.send({ officers });
        }
      );
    } else if (officer.role == 2) {
      if (req.body.police_station == null) {
        Officers.find(
          { sub_division_code: officer.sub_division_code },
          {},
          { sort: { name: 1 } },
          (err, officers) => {
            if (err) console.log(err);

            return res.send({ officers });
          }
        );
      } else {
        Officers.find(
          {
            sub_division_code: officer.sub_division_code,
            police_station: req.body.police_station
          },
          {},
          { sort: { name: 1 } },
          (err, officers) => {
            if (err) console.log(err);

            return res.send({ officers });
          }
        );
      }
    } else if (officer.role == 3) {
      if (req.body.police_station == null) {
        Officers.find(
          { division: officer.division },
          {},
          { sort: { name: 1 } },
          (err, officers) => {
            if (err) console.log(err);

            return res.send({ officers });
          }
        );
      } else {
        Officers.find(
          {
            division_code: officer.division_code,
            police_station: req.body.police_station
          },
          {},
          { sort: { name: 1 } },
          (err, officers) => {
            if (err) console.log(err);

            return res.send({ officers });
          }
        );
      }
    } else {
      return res.status(400).send({ error: 'Bad request' });
    }
  });
});

// @route   GET /list/list-suspects
// @desc    To get list of all suspects
// @access  Private
route.get('/list-suspects', (req, res) => {
  var userId = req.userId;
  if (userId == null) {
    return res.status(400).send({ error: 'Not Logged In' });
  }

  Officers.findOne({ _id: userId }, (err, officer) => {
    if (err) console.log(err);

    console.log(officer);

    if (officer.is_enabled == false) {
      return res.status(401).send({ error: 'Not allowed' });
    }

    if (officer.role == 0) {
      Suspects.find({ officer_id: officer._id }, (err, suspects) => {
        if (err) console.log(err);

        res.send({ suspects });
      });
    } else if (officer.role == 1) {
      Suspects.find(
        { police_station: officer.police_station },
        (err, suspects) => {
          if (err) console.log(err);

          res.send({ suspects });
        }
      );
    } else if (officer.role == 2) {
      Suspects.find(
        { sub_division_code: officer.sub_division_code },
        (err, suspects) => {
          if (err) console.log(err);

          res.send({ suspects });
        }
      );
    } else if (officer.role == 3) {
      Suspects.find(
        { division_code: officer.division_code },
        (err, suspects) => {
          if (err) console.log(err);

          res.send({ suspects });
        }
      );
    } else {
      return res.status(400).send({ error: 'Bad request' });
    }
  });
});
module.exports = route;
