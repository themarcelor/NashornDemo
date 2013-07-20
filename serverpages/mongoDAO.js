#!/usr/bin/jjs -cp mongo-2.10.1.jar -scripting
#
/*
  Author: Marcelo Rodrigues
  Email: themarcelor@gmail.com
  Date: May 2013
*/
load('./serverpages/mongoConnector.js');

var mongoDAO = (function() {
    //Get connector from singleton
    var mongo = mongoConnector.getInstance();
    
    //Select db
    var db = mongo.getDB("test");

    // get list of collections
    var collections = db.getCollectionNames();
 
    //Get mongodb collection
    var dbCollection = mongo.getDB("test").getCollection("test");

    return {
	create: function(someObj) {
	    //save
            dbCollection.save(mongodb.util.JSON.parse(someObj));
	},
	readAll: function() {
	    var results = [];
	    
	    var cursorDocJSON = dbCollection.find();
	    
	    while (cursorDocJSON.hasNext()) {
		var cDoc = cursorDocJSON.next();
		results.push(cDoc);
	    }
	    return results;
	}
	
	/*read: function(criteria) {
	    var results = [];

	    var whereQuery = new BasicDBObject();
	    whereQuery.put(criteria[0], criteria[1]);

	    var cursos = dbCollection.find(whereQuery);
	    while(cursor.hasNext()) {
		results.push(cursor.next());
	    }
	    return results;
	}

	update: function(jsonObj, oid) {

	}

	delete: function(criteria) {
	    
	}*/
    };
    
}());