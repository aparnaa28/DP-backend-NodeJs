const express = require('express');
const mongoose = require('mongoose');
const request = require('request');
const Officers = require('../../models/officers');
const Reports = require('../../models/reports');
const Region = require('../../models/regions');
const Suspects = require('../../models/suspects');
const MobileAuthSessions = require('../../models/mobile_auth_sessions');
const verifyAuthToken = require('../../middleware/auth').verifyAuthToken;
const generateAuthToken = require('../../middleware/auth').generateAuthToken;
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './fileStorage/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

const xlsx = require('xlsx');
const route = express.Router();

// @route   POST /upload/officer
// @desc    View officer data
// @access  Private

route.post('/officer', upload.single('officerData'), async (req, res) => {
  try {
    var userId = req.userId;
    if (userId == null) {
      return res.status(400).send({ error: 'Not Logged In' });
    }

    await Officers.findOne({ _id: userId }, function(err, officer) {
      if (err) {
        console.log(err);
        return res.status(500).send({ error: 'Database error' });
      }
      if (officer.is_enabled == false) {
        return res.status(401).send({ error: 'Not allowed' });
      }
      if (officer.role == 0) {
        return res.send({ err: 'Not allowed' });
      } else if (officer.role == 1 || officer.role == 2 || officer.role == 3) {
        uploadingFile(req.file, res);
      } else {
        return res.status(401), send({ error: 'Bad request' });
      }
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send({ error: 'Server error' });
  }
});

let uploadingFile = async (file, res) => {
  try {
    console.log('Upload Function Started');
    if (file) {
      var actualfile = file;
      var wb = xlsx.readFile('./fileStorage/' + actualfile.filename, {
        cellDates: true
      });
      var sheetArray = wb.SheetNames;
      var ws = wb.Sheets[sheetArray[0]];
      var data = xlsx.utils.sheet_to_json(ws);
      const dataArray = [];
      res.status(200).json({ msg: 'uploaded successfully' });
      // return res.status(200).json({ data: data });
      let officerEntry = await Officers.find();
      let regionEntries = await Region.find();
      let checkEntry = officerEntry;
      let count;
      console.log('data >> ' + checkEntry);
      console.log('data >> length >> ' + checkEntry.length);
      console.log('data >> name >> ' + checkEntry[0].name);

      for (let i = 0; i < data.length; i++) {
        let child = data[i];

        switch (child['Mobile App Role']) {
          case 'TAGGING OFFICER':
            count = 0;
            checkEntry.forEach(element => {
              if (
                element.phone_number == child['Conta No.'] &&
                element.pis_number == child['PIS No.']
              ) {
                count++;
              }
            });

            if (count <= 0) {
              console.log('Creating new entry');
              saveData(child, officerEntry, 0, dataArray, regionEntries);
            }
            break;
          case 'SHO':
            count = 0;
            checkEntry.forEach(element => {
              if (
                element.phone_number == child['Conta No.'] &&
                element.pis_number == child['PIS No.']
              ) {
                count++;
              }
            });

            if (count <= 0) {
              console.log('Creating new entry');
              saveData(child, officerEntry, 1, dataArray, regionEntries);
            }
            break;
          case 'DCP':
            count = 0;
            checkEntry.forEach(element => {
              if (
                element.phone_number == child['Conta No.'] &&
                element.sub_division_code == child['Sub Division Code'] &&
                element.division_code == child['Divison Code']
              ) {
                count++;
              }
            });

            if (count <= 0) {
              console.log('Creating new entry');
              saveData(child, officerEntry, 3, dataArray, regionEntries);
            }

            break;
          case 'ACP':
            count = 0;
            checkEntry.forEach(element => {
              if (
                element.phone_number == child['Conta No.'] &&
                element.division_code == child['Divison Code']
              ) {
                count++;
              }
            });

            if (count <= 0) {
              console.log('Creating new entry');
              saveData(child, officerEntry, 2, dataArray, regionEntries);
            }
            break;

          default:
            console.log('Invalid role');
            break;
        }
      }

      // return res.status(200).send({ data: dataArray });
    } else {
      return res.status(404).send({ error: 'Send a valid file' });
    }
  } catch (error) {
    console.error(err.message);
    return res.status(500).send({ error: 'Error storing file' });
  }
};

let saveData = function(child, officerEntry, role, dataArray, regionEntries) {
  try {
    const officerData = {};
    if (child['Name']) officerData.name = child['Name'];
    if (child['Conta No.']) officerData.phone_number = child['Conta No.'];
    if (child['PIS No.']) officerData.pis_number = child['PIS No.'];
    if (child['Rank']) officerData.rank = child['Rank'];
    if (child['Belt No.']) officerData.belt_number = child['Belt No.'];
    officerData.role = role;

    // console.log('psCode >>> ' + child['PS Code']);
    if (parseInt(child['PS Code'], 10) >= 0) {
      regionEntries.forEach(element => {
        if (element.ps_code == child['PS Code']) {
          // console.log('equal pscode >>> ' + element.ps_code);
          officerData.ps_code = child['PS Code'];
          officerData.division = element.division;
          officerData.sub_division = element.sub_division;
          officerData.police_station = element.police_station;
          officerData.sub_division_code = element.sub_division_code;
          officerData.division_code = element.division_code;
        }
      });
    } else {
      // console.log('>>>> value less');
      officerData.ps_code = child['PS Code'];
      officerData.sub_division_code = child['Sub Division Code'];
      officerData.division_code = child['Divison Code'];
    }
    officerEntry = new Officers(officerData);
    dataArray.push(officerEntry);

    officerEntry.save();
    console.log('SAVE VALUE');
  } catch (error) {
    console.log('error VALUE' + error);
  }
};

// @route   POST /upload/region
// @desc    View officer data
// @access  Private
route.post('/region', upload.single('regionData'), async (req, res) => {
  try {
    if (req.file) {
      var actualfile = req.file;

      var wb = xlsx.readFile('./fileStorage/' + actualfile.filename, {
        cellDates: true
      });
      // console.log(actualfile);
      // console.log(wb.SheetNames);
      var sheetArray = wb.SheetNames;
      var ws = wb.Sheets[sheetArray[0]];
      // console.log(ws);

      let data = xlsx.utils.sheet_to_json(ws);
      // console.log(data);

      for (let i = 0; i < data.length; i++) {
        let child = data[i];
        const regionData = {};
        if (child['PS NAME']) regionData.police_station = child['PS NAME'];
        if (child['PS CODE']) regionData.ps_code = child['PS CODE'];
        if (child['SUB DIVISION NAME'])
          regionData.sub_division = child['SUB DIVISION NAME'];
        if (child['SUB DIVISION CODE'])
          regionData.sub_division_code = child['SUB DIVISION CODE'];
        if (child['DIVISION NAME'])
          regionData.division = child['DIVISION NAME'];
        if (child['DIVISION CODE'])
          regionData.division_code = child['DIVISION CODE'];

        let storeData = await Region.findOne({ ps_code: child['PS CODE'] });
        if (!storeData) {
          storeData = new Region(regionData);
          await storeData.save();
          console.log(child);
        }
      }

      res.status(200).json({ msg: 'successfully officer working' });
    } else {
      return res.status(404).send('Send a valid file');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /upload/suspect
// @desc    View officer data
// @access  Private //

route.post('/suspect', upload.single('suspectData'), async (req, res) => {
  try {
    var userId = req.userId;
    if (userId == null) {
      return res.status(400).send({ error: 'Not Logged In' });
    }

    await Officers.findOne({ _id: userId }, function(err, officer) {
      if (err) {
        console.log(err);
        return res.status(500).send({ error: 'Database error' });
      }
      if (officer.is_enabled == false) {
        return res.status(401).send({ error: 'Not allowed' });
      }
      if (officer.role == 0) {
        return res.send({ err: 'Not allowed' });
      } else if (officer.role == 1 || officer.role == 2 || officer.role == 3) {
        uploadingFileSuspect(req.file, res);
      } else {
        return res.status(401), send({ error: 'Bad request' });
      }
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send({ error: 'Server error' });
  }
});

let uploadingFileSuspect = async (file, res) => {
  try {
    console.log('Upload Function Started');
    if (file) {
      var actualfile = file;
      var wb = xlsx.readFile('./fileStorage/' + actualfile.filename, {
        cellDates: true
      });
      var sheetArray = wb.SheetNames;
      var ws = wb.Sheets[sheetArray[0]];
      var data = xlsx.utils.sheet_to_json(ws);
      const dataArray = [];
      res.status(200).json({ msg: 'uploaded successfully' });
      // return res.status(200).json({ data: data });
      let suspectEntry = await Suspects.find();
      let regionEntries = await Region.find();
      let checkEntry = suspectEntry;
      let count;
      console.log('data >> ' + checkEntry);
      console.log('data >> length >> ' + checkEntry.length);
      console.log('data >> name >> ' + checkEntry[0].name);

      for (let i = 0; i < data.length; i++) {
        let child = data[i];

        count = 0;

        checkEntry.forEach(element => {
          if (
            element.fir_no == child['FIR NO.'] &&
            element.name == child['NAME']
          ) {
            count++;
          }
        });

        if (count <= 0) {
          console.log('Creating new entry');
          saveDataSuspect(child, suspectEntry, dataArray, regionEntries);
        }
      }

      // return res.status(200).json({ msg: 'uploaded successfully' });
      // return res.status(200).send({ data: dataArray });
    } else {
      return res.status(404).send({ error: 'Send a valid file' });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).send({ error: 'Error storing file' });
  }
};

let saveDataSuspect = function(child, suspectEntry, dataArray, regionEntries) {
  try {
    const suspectData = {};
    if (child['NAME']) suspectData.name = child['NAME'];
    if (child['FATHER NAME']) suspectData.father_name = child['FATHER NAME'];
    if (child['ADDRESS']) suspectData.address = child['ADDRESS'];
    if (child['STATE']) suspectData.state = child['STATE'];
    if (child['AADHAR CARD NO.'])
      suspectData.aadhar_card_no = child['AADHAR CARD NO.'];
    if (child['MOBILE NO.']) suspectData.Phone_no = child['MOBILE NO.'];
    if (child['FIR NO.']) suspectData.fir_no = child['FIR NO.'];
    if (child['U/S']) suspectData.under_section = child['U/S'];
    if (child['CRIME HEAD']) suspectData.category = child['CRIME HEAD'];
    if (child['RELEASE TYPE']) suspectData.release_type = child['RELEASE TYPE'];
    if (child['SOURCE OF LIVING'])
      suspectData.source_of_living = child['SOURCE OF LIVING'];
    if (child['WORK PLACE CONTACT NO.'])
      suspectData.work_place_contact_no = child['WORK PLACE CONTACT NO.'];
    suspectData.status = 0;
    suspectData.type = 1;

    if (child['DATE OF RELEASE']) {
      var parts = child['DATE OF RELEASE'].split('.');
      var dateEntry = new Date(parts[2], parts[1] - 1, parts[0]).setUTCHours(
        24,
        0,
        0,
        0
      );

      suspectData.release_date = dateEntry;
    }

    // console.log('psCode >>> ' + child['PS Code']);
    if (parseInt(child['PS CODE'], 10) >= 0) {
      regionEntries.forEach(element => {
        if (element.ps_code == child['PS CODE']) {
          // console.log('equal pscode >>> ' + element.ps_code);
          suspectData.division = element.division;
          suspectData.sub_division = element.sub_division;
          suspectData.police_station = element.police_station;
          suspectData.sub_division_code = element.sub_division_code;
          suspectData.division_code = element.division_code;
        }
      });
    } else {
      // console.log('>>>> value less');
      if (child['SUB DIVISION'])
        suspectData.sub_division = child['SUB DIVISION'];
    }
    suspectEntry = new Suspects(suspectData);
    dataArray.push(suspectEntry);

    suspectEntry.save();
    console.log('SAVE VALUE');
  } catch (error) {
    console.log('error VALUE' + error);
  }
};

module.exports = route;
