const mongoose = require("mongoose");

const classroomGraphSchema = new mongoose.Schema({
  graph: mongoose.Schema.Types.Mixed,
});

module.exports = mongoose.model("ClassroomGraph", classroomGraphSchema);
