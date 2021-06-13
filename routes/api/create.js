const express = require('express');
const mongoose = require('mongoose');
const request = require('request');
const Officers = require('../../models/officers');
const Reports = require('../../models/reports');
const Suspects = require('../../models/suspects');
const Regions = require('../../models/regions');
const MobileAuthSessions = require('../../models/mobile_auth_sessions');
const verifyAuthToken = require('../../middleware/auth').verifyAuthToken;
const generateAuthToken = require('../../middleware/auth').generateAuthToken;
const route = express.Router();
const multer = require('multer');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');

// if (!fs.existsSync('./public')) {
//   fs.mkdirSync('./public');
//   if (!fs.existsSync('./public/images')) {
//     fs.mkdirSync('./public/images');
//   }
// }

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      uuid.v4() + '_' + file.fieldname + '_' + path.extname(file.originalname)
    );
  }
});
const upload = multer({ storage: storage });

// @route   POST /create/create-report
// @desc    Create officer report
// @access  Private

route.post(
  '/create-report',
  upload.single('suspect_image_byte'),
  (req, res) => {
    console.log('Api called : /create/create-report');
    var userId = req.userId;
    if (userId == null) {
      return res.status(400).send({ error: 'Not Logged In' });
    }
    // var file_data = JSON.parse();
    // var body = {
    //   file: req.file.buffer,
    //   type: req.body.type
    // };

    // console.log("buffer:", req.file.buffer.toString("base64"));
    // if (req.file != null) {
    //   console.log('File : ', req.file);
    // }

    // return res.json({ file: req.file });

    let reportModel = Reports.find();
    var json_data = req.body.json_data;
    var parsed_data = JSON.parse(json_data);
    console.log('Data : ', parsed_data);

    var suspect_image_byte = null;

    if (req.file != null) {
      suspect_image_byte = req.headers.host + '/images/' + req.file.filename;
    }

    var suspect_id = parsed_data.suspect_id;
    var longitude = parsed_data.longitude;
    var latitude = parsed_data.latitude;
    var is_found = parsed_data.is_found;
    var sub_division_code = parsed_data.sub_division_code;
    var division_code = parsed_data.division_code;

    var personal_details = parsed_data.personal_details;
    var address_details = parsed_data.address_details;
    var employment_details = parsed_data.employment_details;
    var possession_details = parsed_data.possession_details;

    console.log('suspect_id Data : ', suspect_id);
    console.log('longitude Data : ', longitude);
    console.log('personal_details Data : ', personal_details);
    console.log('address_details Data : ', address_details);
    console.log('employment_details Data : ', employment_details);
    console.log('possession_details Data : ', possession_details);
    const report = {};

    // Add Suspect_Image in report
    report.suspect_image_byte = suspect_image_byte;

    //report.created_at = Date.now(),
    report.suspect_id = suspect_id;
    report.longitude = longitude;
    report.latitude = latitude;
    report.is_found = is_found;
    //personal details

    report.personal_details = {};

    report.personal_details.name = personal_details.name;
    report.personal_details.parentage = personal_details.parentage;
    report.personal_details.release_date = personal_details.release_date;
    report.personal_details.jail = personal_details.jail;
    report.personal_details.fir_no = personal_details.fir_no;
    report.personal_details.under_section = personal_details.under_section;
    report.personal_details.dated = personal_details.dated;
    report.personal_details.police_station = personal_details.police_station;
    report.personal_details.advocate_name = personal_details.advocate_name;
    report.personal_details.advocate_contact =
      personal_details.advocate_contact;
    report.personal_details.surety_name = personal_details.surety_name;
    report.personal_details.surety_contact = personal_details.surety_contact;
    report.personal_details.aadhar_number = personal_details.aadhar_number;
    report.personal_details.type = personal_details.type;
    report.personal_details.category = personal_details.category;
    report.personal_details.beat_number = personal_details.beat_number;
    report.personal_details.phone_number = personal_details.phone_number;
    report.personal_details.status = personal_details.status;

    //address details
    report.address_details = {};

    report.address_details.address = address_details.address;
    report.address_details.resident_police_station =
      address_details.resident_police_station;
    report.address_details.city = address_details.city;
    report.address_details.state = address_details.state;
    report.address_details.is_rented = address_details.is_rented;
    report.address_details.landlord_name = address_details.landlord_name;
    report.address_details.landlord_contact = address_details.landlord_contact;
    report.address_details.landlord_address = address_details.landlord_address;

    //employment details
    report.employment_details = [];

    report.employment_details = employment_details;

    //possession details
    report.possession_details = [];

    report.possession_details = possession_details;

    Officers.findOne({ _id: req.userId }, (err, officer) => {
      if (err) {
        console.log(err);
        return res.status(400).send({ err: 'Officer not exist' });
      }

      if (officer.is_enabled == false) {
        return res.status(400).send({ err: 'Officer not allowed' });
      }

      report.officer_id = officer._id;
      report.police_station = officer.police_station;
      report.sub_division_code = officer.sub_division_code;
      report.division_code = officer.division_code;

      if (officer.role == 0) {
        report.type = 1;
      } else {
        report.type = 0;
      }

      var p1 = new Promise(function(resolve, reject) {
        Reports.find({ suspect_id: suspect_id }, (err, reportIn) => {
          //previous report

          if (err) {
            console.log(err);
            reject('Internal server error');
          } else {
            console.log('reportIn : ', reportIn);
            resolve({ reportIn });
            console.log('reportIn2');
          }
        });
      });

      //change subdivision to subdivision code
      var p2 = new Promise(function(resolve, reject) {
        Suspects.findOne({ _id: suspect_id }, (err, suspect) => {
          if (err) {
            console.log(err);
            reject('Internal server error');
          } else if (
            officer.role == 0 &&
            new String(suspect.officer_id).valueOf() !=
              new String(officer._id).valueOf()
          ) {
            reject('Not allowed: officer not matching');
          } else if (
            officer.role == 1 &&
            suspect.police_station != officer.police_station
          ) {
            reject('Not allowed: Role 1 not matching');
          } else if (
            officer.role == 2 &&
            suspect.sub_division_code != officer.sub_division_code
          ) {
            reject('Not allowed: Role 2 not matching');
          } else if (
            officer.role == 3 &&
            suspect.division_code != officer.division_code
          ) {
            reject('Not allowed: Role 3 not matching');
          } else {
            resolve({ suspect });
          }
        });
      });
      var p3 = new Promise(function(resolve, reject) {
        Regions.findOne(
          { police_station: personal_details.police_station },
          (err, region) => {
            //region

            if (err) {
              console.log(err);
              reject('Internal server error');
            } else if (region.length == 0) {
              reject('Region not found');
            } else {
              resolve({ region });
            }
          }
        );
      });
      console.log('successful >>> 1');
      Promise.all([p1, p2, p3])
        .then(values => {
          // console.log(values);
          var flag = 0;

          console.log('successful >>> 2');

          if (values[0].reportIn != null && values[0].reportIn.length > 0) {
            console.log('personal_details.fir_no : ', personal_details.fir_no);
            console.log(
              'values[0].reportIn[0].personal_details.fir_no : ',
              values[0].reportIn[0].personal_details.fir_no
            );
            console.log(
              'personal_details.phone_number : ',
              personal_details.phone_number
            );
            console.log(
              'values[0].reportIn[0].personal_details.phone_number : ',
              values[0].reportIn[0].personal_details.phone_number
            );
            console.log(' address_details.address : ', address_details.address);
            console.log(
              'values[0].reportIn[0].address_details.address : ',
              values[0].reportIn[0].address_details.address
            );
            console.log(
              'personal_details.under_section : ',
              personal_details.under_section
            );
            console.log(
              'values[0].reportIn[0].personal_details.under_section : ',
              values[0].reportIn[0].personal_details.under_section
            );
            console.log(
              'personal_details.category : ',
              personal_details.category
            );
            console.log(
              'values[0].reportIn[0].personal_details.category : ',
              values[0].reportIn[0].personal_details.category
            );
            console.log('personal_details.type : ', personal_details.type);
            console.log(
              'values[0].reportIn[0].personal_details.type : ',
              values[0].reportIn[0].personal_details.type
            );
            console.log(
              'personal_details.police_station : ',
              personal_details.police_station
            );
            console.log(
              'values[0].reportIn[0].personal_details.police_station : ',
              values[0].reportIn[0].personal_details.police_station
            );
            console.log('personal_details.status : ', personal_details.status);
            console.log(
              'values[0].reportIn[0].personal_details.status : ',
              values[0].reportIn[0].personal_details.status
            );

            if (
              personal_details.fir_no !=
                values[0].reportIn[0].personal_details.fir_no ||
              personal_details.name !=
                values[0].reportIn[0].personal_details.name ||
              personal_details.phone_number !=
                values[0].reportIn[0].personal_details.phone_number ||
              address_details.address !=
                values[0].reportIn[0].address_details.address ||
              personal_details.under_section !=
                values[0].reportIn[0].personal_details.under_section ||
              personal_details.category !=
                values[0].reportIn[0].personal_details.category ||
              personal_details.type !=
                values[0].reportIn[0].personal_details.type ||
              personal_details.police_station !=
                values[0].reportIn[0].personal_details.police_station ||
              personal_details.status !=
                values[0].reportIn[0].personal_details.status
            ) {
              console.log('major data change');
              flag = 1;
              report.subtype = 2;
            } else {
              console.log('minor data change');
              flag = 1;
              report.subtype = 1;
            }
          }

          if (flag != 1) {
            console.log('no data change');
            report.subtype = 0;
          }

          if (report.subtype != 0) {
            console.log('changing in suspect data');
            var updatedSuspect = {};
            updatedSuspect.parentage = personal_details.parentage;
            updatedSuspect.dated = personal_details.dated;
            updatedSuspect.under_section = personal_details.under_section;
            updatedSuspect.release_date = personal_details.release_date;
            updatedSuspect.police_station = values[2].region.police_station;
            updatedSuspect.sub_division = values[2].region.sub_division;
            updatedSuspect.sub_division_code =
              values[2].region.sub_division_code;
            updatedSuspect.division_code = values[2].region.division_code;
            updatedSuspect.division = values[2].region.division;
            updatedSuspect.name = personal_details.name;
            updatedSuspect.address = address_details.address;
            updatedSuspect.category = personal_details.category;
            updatedSuspect.type = personal_details.type;
            updatedSuspect.fir_no = personal_details.fir_no;
            updatedSuspect.status = personal_details.status;
            updatedSuspect.state = address_details.state;
            updatedSuspect.Phone_no = personal_details.phone_number;
            updatedSuspect.officer_id =
              personal_details.police_station !=
              values[0].reportIn[0].personal_details.police_station
                ? null
                : officer._id;
          }

          //saving new report in database

          console.log('creating report');
          reportModel = new Reports(report);

          // console.log("successful >>> " + reportModel);
          reportModel.save();

          if (updatedSuspect) {
            Suspects.findOneAndUpdate(
              { _id: suspect_id },
              updatedSuspect,
              (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(result);
                }
              }
            );
            // console.log("successful updatedSuspect >>> " + updatedSuspect) ;
          }
          var updatedSuspectUpdate = {};
          updatedSuspectUpdate.last_visited = Date().toString();
          Suspects.findOneAndUpdate(
            { _id: suspect_id },
            updatedSuspectUpdate,
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                console.log(result);
              }
            }
          );
          res.status(200).json({ msg: 'successfully report created' });
          //then
        })
        .catch(error => {
          res.send({ err: error });
        });
    });
  }
);

// @route   POST /create/test
// @desc    To test image buffer
// @access  Private
route.post('/test', upload.single('suspect_image_byte'), (req, res) => {
  var userId = req.userId;
  if (userId == null) {
    return res.status(400).send({ error: 'Not Logged In' });
  }

  console.log(
    'storage location is ',
    req.headers.host + '/images/' + req.file.filename
  );
  // return res.send(req.file);
  // // var file_data = JSON.parse();
  // var body = {
  //   file: req.file.buffer,
  //   type: req.body.type
  // };

  console.log('file: ', req.file);

  return res.json({ msg: req.file });

  // var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
  // if (file.indexOf(dir + path.sep) !== 0) {
  //   return res.status(403).end('Forbidden');
  // }
  // var file = req.file.path;
  // var type = mime[path.extname(file).slice(1)] || 'image/jpeg';
  // var s = fs.createReadStream(file);
  // res.status(200).send({ data: s.path });
  // s.on('open', function(chunk) {
  //   var pleaseBeAJSObject = JSON.parse(chunk);

  //   // res.set('Content-Type', type);
  //   res.status(200).send({ data: pleaseBeAJSObject });
  // });
  // s.on('error', function() {
  //   res.set('Content-Type', 'text/plain');
  //   res.status(404).end('Not found');
  // });
});

// @route   POST /create/upload-suspect-image
// @desc    upload-suspect-image in suspect table
// @access  Private
route.post(
  '/upload-suspect-image',
  upload.single('suspect_image_byte'),
  (req, res) => {
    var userId = req.userId;
    if (userId == null) {
      return res.status(400).send({ error: 'Not Logged In' });
    }
    var suspect_id = req.body.suspect_id;
    if (suspect_id == null) {
      return res.status(400).send({ error: 'Please send suspect id' });
    }

    var suspect_image_byte = null;

    if (req.file != null) {
      suspect_image_byte = req.headers.host + '/images/' + req.file.filename;
    }

    var updatedSuspect = {};
    updatedSuspect.suspect_image_byte = suspect_image_byte;
    //
    if (updatedSuspect) {
      Suspects.findOneAndUpdate(
        { _id: suspect_id },
        updatedSuspect,
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(401).send({ error: 'No able to add photo' });
          } else {
            console.log(result);
            res.status(200).json({ msg: 'successfully image added' });
          }
        }
      );
    }
  }
);

module.exports = route;
