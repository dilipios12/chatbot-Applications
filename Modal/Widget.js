const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema({
  widgetId: { type: String, unique: true, required: true },
  welcome: String,
  color: String,
  overviewColor: String,
  show: Boolean,
  position: String,
  fontSize: String,
  fontFamily: String,
  propertyName: String,
  propertyUrl: String,
  status: String,
  forwardEmail: String,
  chatHeader: String,
  showImage: Boolean,
  imageUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Widget', widgetSchema);
