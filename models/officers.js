var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  police_station: { type: String },
  sub_division: { type: String, default: null },
  division: { type: String, default: null },
  sub_division_code: { type: String, default: null },
  division_code: { type: String, default: null },
  is_enabled: { type: Boolean, default: true },
  role: { type: Number, required: true },
  belt_number: { type: String },
  rank: { type: String },
  pis_number: { type: String, default: null },
  phone_number: { type: String, required: true },
  name: { type: String, required: true },
  ps_code: {
    type: String,
    ref: 'Regions.ps_code',
    default: null
  }
});

module.exports = mongoose.model('Officers', schema);
