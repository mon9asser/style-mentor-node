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
    if( ! req.body?.phrase ) {
        response.message = "phrase field is required!";
        return res.send(response);
    }

    // => Sanitize and secure Data before touch database
    var phrase = sanitizeHtml(req.body.phrase, {
        allowedTags: [],
        allowedAttributes: {}
    });
    phrase = phrase.trim().toLocaleLowerCase();

    var is_updator = req.body.is_update ? req.body?.is_update: false; 

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
 * - If @id does not exist (null) return all with
 *      @pagination { page_number, records_per_page, pages_counts, all_records_count }
 *      - if @pagination does not exist so do default one 
 * 
 */
Phrase.post("/ai-phrases/get", async (req, res) => {
   
    var response = {
        is_error: true,
        message: '',
        data: {}
    };

    // connect to database 
    await connectDB();

    // Check if ?id exists
    if (req.query.id) {
        

        try {
            var finder = await AIPhrase.findOne({ _id: sanitizeHtml(req.query.id, {
                allowedAttributes: {},
                allowedTags: []
            })});
             
            if (finder) {
                response.is_error = false;
                response.message = "AI phrase fetched successfully.";
                response.data = finder;
            } else {
                response.message = "AI phrase does not exist.";
                response.data = {};
            }
        } catch (err) {
            response.message = err.message;
        }

        return res.send(response);
    }

    

    var paging = req.body?.pagination;
    if( ! paging ) {
        response.is_error = true;
        response.message = "The `pagination` is required!";
        return res.send(response);
    }

    if( !paging?.page_number || !paging?.records_per_page ) {
        response.is_error = true;
        response.message = "The `records_per_page` and `page_number` are required inside `pagination` object!";
        return res.send(response);
    }

    // Needed givens 
    var all_records_count = await AIPhrase.countDocuments({});
    var pageNumber = paging.page_number;
    var recordsPerPage = paging.records_per_page;
    var numberOfPages = 1;
    if( all_records_count <= recordsPerPage ) {
        numberOfPages = 1;
    } else {
        numberOfPages = Math.ceil(all_records_count / recordsPerPage);
    }
    
    if(pageNumber > numberOfPages) {
        pageNumber = numberOfPages;
    } 

    if( pageNumber <= 0 ) {
        pageNumber = 1;
    } 

    var pagingObject = {
        current_page: isNaN(parseInt(pageNumber))? 1: parseInt(pageNumber),
        records_per_page: isNaN(parseInt(recordsPerPage))? 1: parseInt(recordsPerPage),
        all_records_count: isNaN(parseInt(all_records_count))? 0: parseInt(all_records_count),
        number_of_pages: isNaN(parseInt(numberOfPages)? 0: parseInt(numberOfPages))
    }
    if( ! pagingObject.all_records_count ) {
        pagingObject.all_records_count = 0;
    }
    if( ! pagingObject.number_of_pages ) {
        pagingObject.number_of_pages = 0;
    }
    
    try {
        var documents = await AIPhrase.find({})
        .skip((pagingObject.current_page - 1) * pagingObject.records_per_page)
        .limit(pagingObject.records_per_page);
    
        // get the records based on pagination
        response.data['paging'] = pagingObject;
        response.data['data'] = documents;
        response.is_error = false;
        response.message = "All records are fetched correctly!";
    } catch (error) {
         response.is_error = true;
         response.message = error.message;
    }
     
   
    return res.send(response);

});



/**
 * ==============================================  
 * Update many records by ids
 * ==============================================
 * @records an array has _id (required) + [is_word (optional) + phrase (optional)]
 **/
Phrase.post("/ai-phrases/update-many", async (req, res) => {
    const response = {
        message: '',
        is_error: true, 
        data: []
    };

    // 1. Validate records field
    const inputRecords = req.body?.records;

    if (!inputRecords) {
        response.message = "The `records` field is required!";
        return res.send(response);
    }

    if (!Array.isArray(inputRecords)) {
        response.message = "The `records` must be an array!";
        return res.send(response);
    }

    // 2. Validate & sanitize each record
    let isValid = true;

    const operations = inputRecords.map(x => {
        if (!x._id || (!('is_word' in x) && !('phrase' in x))) {
            isValid = false;
            return null; // skip
        }

        // Prepare update fields
        const updateFields = {};

        if ('is_word' in x) {
            updateFields.is_word = (x.is_word === 'true' || x.is_word === true);
        }

        if ('phrase' in x && typeof x.phrase === 'string') {
            updateFields.phrase = sanitizeHtml(x.phrase, {
                allowedAttributes: {},
                allowedClasses: []
            });
        }

        return {
            updateOne: {
                filter: { _id: x._id },
                update: { $set: updateFields }
            }
        };
    }).filter(op => op); // Remove nulls

    if (!isValid || operations.length === 0) {
        response.message = "Each item in the records array must include `_id` and either an `is_word` or `phrase` field to proceed.";
        return res.send(response);
    }

    try {
        await connectDB();

        const result = await AIPhrase.bulkWrite(operations);

        if (result && result.modifiedCount > 0) {
            response.is_error = false;
            response.message = `Updated ${result.modifiedCount} of ${result.matchedCount} matched records.`;
        } else {
            response.message = 'No records were updated.';
        }
    } catch (error) {
        response.message = error.message;
    }

    return res.send(response);
});



/**
 * ==============================================  
 * Delete data from ai phrases by id or all
 * ==============================================
 * @id optional - if it does not exist so delete all data
 * @delete_all integer
 **/

Phrase.post("/ai-phrases/delete", async (req, res) => {
    
    var response = {
        message: "",
        is_error: true,
        data: []
    };

     
    if( ! req.body?.id && ! req.body?.delete_all ) {
        response.message = "The `id` or `delete_all` field is required!";
        return res.send(response);
    } 

    // delete item by id
    if( req.body?.id) {

        var _id = sanitizeHtml(req.body.id, {
            allowedAttributes: {},
            allowedTags: []
        });
        
        // open database 
        await connectDB();

        var getItem = await AIPhrase.findOne({_id});
        if( getItem ) {
            var result = await AIPhrase.deleteOne({_id});
            if (result.deletedCount > 0) { 
                response.is_error = false;
                response.message = 'Deleted successful';
            } else {
                response.is_error = true;
                response.message = 'Failed to delete the record!';
            }
        } else {
            // failed to delete the item
            response.is_error = true;
            response.message = 'No record found to delete!';
        }

        return res.send(response);
    }
    
    response.is_error = true;
    response.message = 'If you need to delete all records use 1 in `delete_all` field';
    
    // otherwise delete all records  
    if( req.body?.delete_all && parseInt(req.body?.delete_all) == 1 ) {
        
        // open database 
        await connectDB();

        // result 
        var result = await AIPhrase.deleteMany({});
        if (result.deletedCount > 0) {
            response.is_error = false;
            response.message = `Deleted ${result.deletedCount} records`;
        } else {
            response.message = 'No records to delete';
        }
    }  


    return res.send(response);
});



module.exports = { Phrase };