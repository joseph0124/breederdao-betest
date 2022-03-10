const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.pluralize(null);


const ClassSchema = new Schema({
    id: {
        type: String
    },
    name: {
        type: String
    },
    stage: {
        type: String
    },
    class: {
        type: String
    },
    price: {
        type: Number
    }
});

module.exports = {
    Beast: mongoose.model('beast_class', ClassSchema),
    Aquatic: mongoose.model('aquatic_class', ClassSchema),
    Plant: mongoose.model('plant_class', ClassSchema),
    Bird: mongoose.model('bird_class', ClassSchema),
    Bug: mongoose.model('bug_class', ClassSchema),
    Reptile: mongoose.model('reptile_class', ClassSchema),
    Mech: mongoose.model('mech_class', ClassSchema),
    Dawn: mongoose.model('dawn_class', ClassSchema),
    Dusk: mongoose.model('dusk_class', ClassSchema),
};