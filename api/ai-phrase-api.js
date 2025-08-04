const express = require("express");
const sanitizeHtml = require("sanitize-html");

// models 
var {connectDB} = require("./../incs/connect");
var {AIPhrase} = require("./../incs/schema/ai-phrases");

var Phrase = express.Router();



/**
 * ==============================================  
 * Insert Data one record 
 * ==============================================
 * @phrase required field (string)
 * @is_word optional 
 * @is_update optional to allow update @is_word
 */
Phrase.post("/ai-phrases/insert", async (req, res) => {

    // => Build the response Object 
    var response = {
        is_error: true,
        message: "",
        data: {}
    };

    // => Check about required fields 
    if( ! req.body.phrase ) {
        response.message = "phrase field is required!";
        return res.send(response);
    }

    // => Sanitize and secure Data before touch database
    var phrase = sanitizeHtml(req.body.phrase, {
        allowedTags: [],
        allowedAttributes: {}
    });
    phrase = phrase.trim().toLocaleLowerCase();

    var is_updator = req.body.is_update ? req.body.is_update: false; 

    var isWord = req.body.is_word == undefined ? false: req.body.is_word; 
    if( isWord === 'true') {
        isWord = true; 
    } 
    
    if ( isWord === 'false') {
        isWord = false;
    }
    
    // => Connect to Database 
    await connectDB();

    // => Check if the data already exists so ignore it and return the current one 
    var findPhrase = await AIPhrase.findOne({phrase});
    if( findPhrase ) {

        if( is_updator ) {
            findPhrase.is_word = isWord;
            await findPhrase.save();
        }

        response.is_error = false;
        response.message = "is_word field updated successfully!";
        response.data = findPhrase;

        return res.send(response);
    }


    // => Insert the new Data
    try {
        var phraseData = await new AIPhrase({
            phrase,
            is_word: isWord
        })
        var saved = await phraseData.save();
        response.is_error = false;
        response.message = "Phrase or word saved successfully!";
        response.data = saved;
    } catch(e) {
        response.is_error = true;
        response.message = e.message;
        response.data = {};
    }

    // => Return the data 
    return res.send(response);
});


/**
 * ==============================================  
 * Insert Many fields 
 * ==============================================
 * @phrases required field (string) 
 */
Phrase.post("/ai-phrases/insert-many", async (req, res) => {
    
    // => Build the response Object
    var response = {
        is_error: true,
        message: "",
        data: []
    };

    // => Check about required fields 
    if(req.body.phrases === undefined) {
        response.message = "The phrases field is required!";
        return res.send(response);
    }
    var {phrases} = req.body;


    if( ! Array.isArray( phrases ) ) {
        response.message = "The phrases should be an array!";
        return res.send(response);
    }    

    // => Sanitize and secure Data before touch database
    var is_correct = true; 
    phrases = phrases.map(x => {
        
        if( x.is_word == undefined || x.phrase === undefined ) {
            is_correct = false; 
            return x;
        }

        if(x.is_word === 'false') {
            x.is_word = false;
        }
        
        if(x.is_word === 'true') {
            x.is_word = true;
        }

        x.phrase = sanitizeHtml(x.phrase, {
            allowedAttributes: {},
            allowedTags: []
        });
        
        return {
            updateOne: {
                filter: { phrase: x.phrase.toLowerCase().trim() },
                update: { $set: { is_word: x.is_word } },
                upsert: true
            }
        }
    });
    
    if( is_correct === false ) {
        response.is_error = true; 
        response.message = "Please make sure that the array has properies such as is_word and phrase!";
        return res.send(response);
    }

    try {
        
        // => Connect to Database
        await connectDB();

        // => Insert the new Data
        await AIPhrase.bulkWrite(phrases);

        // => build quiry
        response.is_error = false;
        response.message = "Array saved successfully!";
        response.data = [];

    } catch (e) {
        // => build quiry
        response.is_error = true;
        response.message = e.message;
        response.data = [];
    }
    

    // => Return the data
    return res.send(response);
});


/**
 * ==============================================  
 * Get data from ai phrases 
 * ==============================================
 * @id if exists so reterieve only one record
 * 
 * - If @id does not exist return all with
 *      @pagination { page_no, records_count, pages_counts, all_records_count }
 *      - if @pagination does not exist so do default one 
 * 
 */
Phrase.get("/ai-phrases/get", async (req, res) => {
    
    // check if id already exists then sanitize
    // -  case is exists so return only one object 
    // -  otherwise show message that the record does not exist 


    // check for pagination
    // - if it does exists so assign default 
    // - if yes so sanitize and secure it 

    // get the records based on pagination


});


/**
 * ==============================================  
 * Delete data from ai phrases by id or all
 * ==============================================
 * @id optional - if it does not exist so delete all data
 **/

Phrase.post("/ai-phrases/delete", async (req, res) => {
    // if the @id exists delete the record then return
    // otherwise delete all records  
});

module.exports = { Phrase };