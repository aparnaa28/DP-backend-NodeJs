var mongoose = require('mongoose');
var reports = require('./reports');
var Schema = mongoose.Schema;

var d = Date();
var a = d.toString();
var schema = new Schema({
  created_at: { type: Date, required: true, default: a },
  updated_at: { type: Date, required: true, default: a },
  last_visited: { type: Date, required: true, default: a },
  suspect_image_byte: { type: String, default: null },
  release_type: { type: String, default: null }, // subtype of type with data : jail release , bail release
  parentage: { type: String, default: null },
  dated: { type: Date, default: null },
  release_date: { type: Date, default: null },
  officer_id: { type: Schema.Types.ObjectId, ref: 'Officers', default: null },
  under_section: { type: String, default: null },
  police_station: { type: String, required: true, default: null },
  sub_division: { type: String, default: null },
  division: { type: String, default: null },
  sub_division_code: { type: String, default: null },
  division_code: { type: String, default: null },
  name: { type: String },
  address: { type: String },
  category: { type: String }, // Crime head
  type: { type: Number, required: true }, // 0 = History Sheeter, 1 = Jail/Bail, 2=jail Bail
  fir_no: { type: String },
  status: { type: Number, required: true }, // 0=unknown, 1=in_jail, 2=onbail, 3=on payroll, 4=extorned
  state: { type: String, default: null },
  Phone_no: { type: String, default: null },
  father_name: { type: String, default: null },
  aadhar_card_no: { type: String, default: null },
  source_of_living: { type: String, default: null },
  work_place_contact_no: { type: String, default: null }
});

module.exports = mongoose.model('Suspects', schema);
