var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var d = Date();
var a = d.toString();
var reports = new Schema({
  suspect_image_byte: { type: String, default: null },
  created_at: { type: Date, default: a },
  suspect_id: { type: Schema.Types.ObjectId, ref: 'Suspects', required: true },
  police_station: { type: String },
  sub_division: { type: String, default: null },
  division: { type: String, default: null },
  sub_division_code: { type: String, default: null },
  division_code: { type: String, default: null },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  officer_id: { type: Schema.Types.ObjectId, ref: 'Officers', required: true },
  type: { type: Number, required: true }, // -1 = creation_report, 0 = admin_report, 1 = field_report
  subtype: { type: Number, required: true }, // 0 = non suspect data updated, 1 = suspect data updated, 2 = critical suspect data updated
  is_found: { type: Boolean, required: true, default: true },

  personal_details: {
    name: { type: String },
    parentage: { type: String },
    release_date: { type: Date },
    jail: { type: String },
    fir_no: { type: String },
    under_section: { type: String },
    dated: { type: Date },
    police_station: { type: String, required: true },
    advocate_name: { type: String },
    advocate_contact: { type: String },
    surety_name: { type: String },
    surety_contact: { type: String },
    aadhar_number: { type: String },
    type: { type: Number, required: true }, // 0 = History Sheeter, 1 = Jail/Bail
    category: { type: String }, //values to be finalised later
    beat_number: { type: String },
    phone_number: { type: String, required: true },
    status: { type: Number, required: true }
  },
  employment_details: [
    {
      is_employed: { type: Boolean, required: true },
      employment_description: { type: String },
      employer_name: { type: String },
      employer_contact: { type: String },
      work_address: { type: String }
    }
  ],
  address_details: {
    address: { type: String },
    resident_police_station: { type: String },
    city: { type: String },
    state: { type: String },
    is_rented: { type: Boolean },
    landlord_name: { type: String },
    landlord_contact: { type: String },
    landlord_address: { type: String }
  },
  possession_details: [
    {
      posession_description: { type: String, required: true },
      posession_identifier: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model('Reports', reports);
