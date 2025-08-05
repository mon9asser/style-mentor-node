const mongoose = require('mongoose');


const aiPhraseSchema = mongoose.Schema({
    phrase: { type: String, required: true, unique: true },
    is_word: {type: Boolean, default: false},
    created_at:{ type: Date, default: Date.now }
});

const AIPhrase = mongoose.model('ai-phrases', aiPhraseSchema);
module.exports = {AIPhrase};
 