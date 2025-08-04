const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    phrase: { type: String, required: true, unique: true },
    is_word: {type: Boolean, default: false},
    created_at:{ type: Date, default: Date.now }
});

const AIPhrase = mongoose.model('Ai-phrases', userSchema);
module.exports = {AIPhrase};
 