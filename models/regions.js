var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  ps_code: { type: String, required: true, unique: true },
  police_station: { type: String, required: true },
  sub_division_code: { type: String, required: true },
  sub_division: { type: String, required: true },
  division_code: { type: String, required: true },
  division: { type: String, required: true }
});

module.exports = mongoose.model('Regions', schema);
