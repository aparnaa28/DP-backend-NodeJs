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

// @route   POST /view/view-report
// @desc    View report data
// @access  Private
route.post('/view-report', (req, res) => {
  var userId = req.userId;
  if (userId == null) {
    return res.status(400).send({ error: 'Not Logged In' });
  }

  if (req.body.report_id == null) {
    return res.status(400).send({ error: 'Bad request' });
  }

  Officers.findOne({ _id: userId }, function(err, officer) {
    if (err) {
      console.log(err);
    }

    if (officer.is_enabled == false) {
      return res.status(401).send({ error: 'Not allowed' });
    }

    if (officer.role == 0) {
      Reports.findOne(
        { _id: req.body.report_id, officer_id: officer._id },
        function(err, reports) {
          if (err) console.log(err);

          return res.send({ reports: reports });
        }
      );
    } else if (officer.role == 1) {
      Reports.findOne(
        { _id: req.body.report_id, police_station: officer.police_station },
        function(err, report) {
          if (err) console.log(err);

          return res.send({ report: report });
        }
      );
    } else if (officer.role == 2) {
      Reports.findOne(
        {
          _id: req.body.report_id,
          sub_division_code: officer.sub_division_code
        },
        function(err, reports) {
          if (err) console.log(err);

          return res.send({ reports: reports });
        }
      );
    } else if (officer.role == 3) {
      Reports.findOne(
        { _id: req.body.report_id, division_code: officer.division_code },
        function(err, reports) {
          if (err) console.log(err);

          return res.send({ reports: reports });
        }
      );
    } else {
      return res.status(401), send({ error: 'Bad request' });
    }
  });
});

// @route   POST /view/view-suspect
// @desc    View suspect data
// @access  Private
route.post('/view-suspect', (req, res) => {
  var userId = req.userId;
  if (userId == null) {
    return res.status(400).send({ error: 'Not Logged In' });
  }

  if (req.body.suspect_id == null) {
    return res.status(400).send({ error: 'Bad request' });
  }

  Officers.findOne({ _id: userId }, function(err, officer) {
    if (err) {
      console.log(err);
    }

    if (officer.is_enabled == false) {
      return res.status(401).send({ error: 'Not allowed' });
    }

    if (officer.role == 0) {
      Suspects.findOne(
        { _id: req.body.suspect_id, officer_id: officer._id },
        function(err, suspect) {
          if (err) console.log(err);

          return res.send({ suspect });
        }
      );
    } else if (officer.role == 1) {
      Suspects.findOne(
        { _id: req.body.suspect_id, police_station: officer.police_station },
        function(err, suspect) {
          if (err) console.log(err);

          return res.send({ suspect });
        }
      );
    } else if (officer.role == 2) {
      Suspects.findOne(
        {
          _id: req.body.suspect_id,
          sub_division_code: officer.sub_division_code
        },
        function(err, suspect) {
          if (err) console.log(err);

          return res.send({ suspect });
        }
      );
    } else if (officer.role == 3) {
      Suspects.findOne(
        { _id: req.body.suspect_id, division_code: officer.division_code },
        function(err, suspect) {
          if (err) console.log(err);

          return res.send({ suspect });
        }
      );
    } else {
      return res.status(401).send({ error: 'Bad request' });
    }
  });
});

// @route   POST /view/view-officer
// @desc    View officer data
// @access  Private

route.post('/view-officer', (req, res) => {
  var userId = req.userId;
  if (userId == null) {
    return res.status(400).send({ error: 'Not Logged In' });
  }

  if (req.body.officer_id == null) {
    return res.status(400).send({ error: 'Bad request' });
  }

  Officers.findOne({ _id: userId }, function(err, officer) {
    if (err) {
      console.log(err);
    }

    if (officer.is_enabled == false) {
      return res.status(401).send({ error: 'Not allowed' });
    }

    if (officer.role == 0) {
      return res.send({ err: 'Not allowed' });
    } else if (officer.role == 1) {
      Officers.findOne(
        {
          _id: req.body.officer_id,
          police_station: officer.police_station,
          role: 0
        },
        function(err, officer) {
          if (err) console.log(err);

          return res.send({ officer: officer });
        }
      );
    } else if (officer.role == 2) {
      Officers.findOne(
        {
          _id: req.body.officer_id,
          sub_division_code: officer.sub_division_code
        },
        function(err, officer) {
          if (err) console.log(err);

          return res.send({ officer: officer });
        }
      );
    } else if (officer.role == 3) {
      Officers.findOne(
        { _id: req.body.officer_id, division_code: officer.division_code },
        function(err, officer) {
          if (err) console.log(err);

          return res.send({ officer: officer });
        }
      );
    } else {
      return res.status(401).send({ error: 'Bad request' });
    }
  });
});

// @route   POST /view/officer-data
// @desc    View officer data
// @access  Private

route.post('/officer-data', (req, res) => {
  var userId = req.userId;
  if (userId == null) {
    return res.status(400).send({ error: 'Not Logged In' });
  }

  Officers.findOne({ _id: userId }, function(err, officer) {
    if (err) {
      console.log(err);
    }

    if (officer.is_enabled == false) {
      return res.status(401).send({ error: 'Not allowed' });
    }

    return res.send({ officer: officer });
  });
});

// @route   POST /view/remove-suspect
// @desc    View officer data
// @access  Private
route.post('/remove-suspect', (req, res) => {
  var userId = req.userId;
  if (userId == null) {
    return res.status(400).send({ error: 'Not Logged In' });
  }

  var suspect_id = req.body.id;

  if (suspect_id != null) {
    Reports.remove({ _id: suspect_id }, function(err, data) {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: 'Not found' });
      }
      return res.status(200).send({ msg: 'Removed suspects' });
    });
  } else {
    Reports.remove({}, function(err, data) {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: 'Not found' });
      }
      return res.status(200).send({ msg: 'Removed all suspects' });
    });
  }
});

// @route   POST /view/view-officer-data
// @desc    View officer data
// @access  Private

route.post('/view-officer-data', (req, res) => {
  try {
    var userId = req.userId;
    if (userId == null) {
      return res.status(400).send({ error: 'Not Logged In' });
    }

    if (req.body.officer_id == null) {
      return res.status(400).send({ error: 'Bad request' });
    } else {
      Officers.findOne({ _id: req.body.officer_id }, function(err, officer) {
        if (err) {
          console.log(err);
          return res.status(404).send({ msg: 'Not found' });
        }

        return res.status(200).send({ officer: officer });
      });
    }
  } catch (err) {
    return res.status(500).send({ msg: 'Server Error' });
  }
});

module.exports = route;
