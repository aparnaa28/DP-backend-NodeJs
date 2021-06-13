const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const request = require('request');
const connectDB = require('./config/db');
const Officers = require('./models/officers');
const Reports = require('./models/reports');
const Suspects = require('./models/suspects');
const MobileAuthSessions = require('./models/mobile_auth_sessions');
const verifyAuthToken = require('./middleware/auth').verifyAuthToken;
const generateAuthToken = require('./middleware/auth').generateAuthToken;
const app = express();
const path = require('path');

console.log('Initializing System');

// Connecting Database
connectDB();

// Attaching basic app condtions
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// process.env.PWD = process.cwd();
// app.use(express.static(path.join(process.env.PWD, 'public')));

// Init middleware
app.use(verifyAuthToken);

// Testing Purpose Only
app.get('/', (req, res) => {
  return res.status(200).json({ msg: 'API running' });
});

// Define routes
app.use('/verify', require('./routes/api/otp'));
app.use('/list', require('./routes/api/list'));
app.use('/view', require('./routes/api/view'));
app.use('/assign', require('./routes/api/assign'));
app.use('/upload', require('./routes/api/upload'));
app.use('/create', require('./routes/api/create'));

// Dummy data

var d = Date();
a = d.toString();

/*Officers.findByIdAndUpdate("5daef592158dcf46e6486b11",{role:0},(err,doc)=>{
  if(err)
  console.log(err);

  else
  console.log("Ok");
})*/

/*Suspects.insertMany({
    created_at:a,
    updated_at:a,
    parentage:"fgh",
    dated:a,
    under_section:"criminal",
    release_date:a,
    police_station:"Paharganj",
    sub_division:"West",
    division: "North-west",
    sub_division_code:0,
    division_code: 1,
    name:"Mohit",
    address:"Ashok Vihar",
    officer_id:"5daef4a3e8518946180ff71d",
    category:1,          
    type:0,               // 0 = History Sheeter, 1 = Jail/Bail, 2=jail Bail
    last_visited:a,
    fir_no:"200.100.507.234",
    status:2,            // 0=unknown, 1=in_jail, 2=onbail, 3=on payroll, 4=extorned
    city:"Delhi",                         
    state:1,
    Phone_no:"9971052233",

})*/

/*{
  "session_id": "b155c756-06d3-41c2-8379-a5cea041bf15",
  "otp":"420560"
}eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGFlZjU5MjE1OGRjZjQ2ZTY0ODZiMTEiLCJpYXQiOjE1NzE5MzU2ODh9.AW0xnnUGnxj_kBhSZfzsveI_tL8jl5fdl_ytIdCyinmHXVszP3bopjglBnrtj12Bfwbct4KWZcY0VI7hXuMFTG4tEnDCGEIG9zkdjQI9KamxJU9oMSNnDh20Xyl1XoFYKC6f8cuaW6GPq72SQlx94BWKVRm7_WwunSj5i9ScKus */

/*Officers.insertMany({
  police_station:"Ashok Vihar",
  sub_division: null,
  division: null,
  sub_division_code: null,
  division_code: 1,
  is_enabled: true,
  role: 3,
  belt_number: "abc",
  rank: "ACP",
  pis_number: "def",
  phone_number: 8368671015,
  name: "Fortknight-2",
  ps_code: null
})*/
/*Suspects.insertMany({
    created_at:a,
    updated_at:a,
    parentage:"def",
    dated:a,
    under_section:"def",
    release_date:2017-10-15,
    police_station:"Paharganj",
    sub_division:null,
    division: null,
    sub_division_code:null,
    division_code:"1",
    name:"Rohit",
    address:"Rohini",
    officer_id:"5daef592158dcf46e6486b11",
    category:1,          
    type:0,               // 0 = History Sheeter, 1 = Jail/Bail, 2=jail Bail
    last_visited:a,
    fir_no:"12345",
    status:1,            // 0=unknown, 1=in_jail, 2=onbail, 3=on payroll, 4=extorned
    city:"Delhi",                         
    state:21,
    Phone_no:"9971052233",
})*/

/*Reports.insertMany({
  created_at:a,
  suspect_id:"5db1ec5d31adcf31ccdfbd3f",
  police_station:"Keshav Puram",
  sub_division:null,
  division:null,
  sub_division_code:"5",
  division_code:"1",
  longitude:123,
  latitude:98,
  officer_id:"5daef592158dcf46e6486b11",
  type:0,           // -1 = creation_report, 0 = admin_report, 1 = field_report
  subtype:1,        // 0 = non suspect data updated, 1 = suspect data updated, 2 = critical suspect data updated
  is_found:true,       

  personal_details:{            
      name:"Ankur",      
      parentage:"abc",
      release_date:a,
      jail:"mnh",
      fir_no:"200.187.334",
      under_section:"abc",
      dated:a,
      police_station:"Paharganj",
      advocate_name:"sahil",
      advocate_contact:"8754332278",
      surety_name:"Sahil",
      surety_contact:"7654398622",
      aadhar_number:"123900097633",
      type:1,         // 0 = History Sheeter, 1 = Jail/Bail
      category:2,     //values to be finalised later
      beat_number:"ps01",
      phone_number:"987654098",
      status:1
  },
  employment_details:[{
      is_employed:false,
  }],
  address_details:{
      address:"Paschim Vihar",
      resident_police_station:"Paschim Vihar",
      city:"Delhi",
      state:26,
      is_rented:false,
  },
  possession_details:[{
      posession_description:"Car",
      posession_identifier:"Number plate"
  }]
})
*/
// Setting up port
app.listen(process.env.PORT || 8080, () => {
  console.log('server started on port 8080');
});
