var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var PeersSchema = new Schema({
  createdAt: { type: Date, expires: 86400, default: Date.now()},
  address: { type: String, default: "", index: true },
  port: { type: String, default: "" },
  protocol: { type: String, default: "" },
  version: { type: String, default: "" },
  latitude: {type: mongoose.Decimal128 },
  longitude: {type: mongoose.Decimal128 },
  city: {type: String, default: "" },
  regionname: {type: String, default: "" }, 
  country: { type: String, default: "" },
  country_code: { type: String, default: "" }
});

module.exports = mongoose.model('Peers', PeersSchema);
