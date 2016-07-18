#! /usr/bin/env node --harmony

//I'm using Node v0.12.2 because of harmony iteration

//USAGE: ./parser.js plosthes.XXXX-X.extract.xml

var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var filename = process.argv[process.argv.length - 1];
var thesaurusVersion = filename.split('.extract.xml')[0];

var Term = function(passedTerm, termIndex) {
    this.text = passedTerm.T;
    if (passedTerm.NT) {
        //there are child terms
        this.nodes = [];
        for (t of passedTerm.NT) {
            var childTerm = new Term(termIndex[t], termIndex);
            this.nodes.push(childTerm);
        }
    }
}


fs.readFile(__dirname + '/' + filename, function(err, data) {
    parser.parseString(data, function(err, result) {
        //get object containing Term data
        var terms = result[thesaurusVersion]['TermInfo'];

        //keep all Terms in an Object to access *by key* later
        var termIndex = new Object();

        var topTerms = [];

        for (var i = 0; i < terms.length; i++) {
            //add each term to index, keyed by Term name
            termIndex[terms[i].T] = terms[i];

            //populate top-level array
            if (!terms[i].BT) {
                //there is no broader term
                topTerms.push(terms[i]);
            }
        }

        var treeList = [];
        for (term of topTerms) {
            var aTerm = new Term(term, termIndex);
            treeList.push(aTerm);
        }


        //make a minified version
        var outFile = 'thesaurus_latest' + '.min.json';
        fs.writeFile(outFile, JSON.stringify(treeList));

        //make a pretty version
        var outFile = thesaurusVersion + '.json';
        fs.writeFile(outFile, JSON.stringify(treeList, null, 2));

    });
});
