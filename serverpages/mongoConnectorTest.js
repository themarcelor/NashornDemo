#!/usr/bin/jjs -scripting
#
/*
  Author: Marcelo Rodrigues
  Email: themarcelor@gmail.com
  Date: May 2013
*/
//Load connector (JS Singleton)
load("./serverpages/mongoConnector.js");

var mongo = mongoConnector.getInstance();

//Create dummy JSON document
var x = "{'name':'Marcelo2'}";

//Select db
var db = mongo.getDB("test");

// get list of collections
var collections = db.getCollectionNames();
 
for (var c in collections) {
    print("Collection :" + collections[c]);
}
//Get mongodb collection
var dbCollection = mongo.getDB("test").getCollection("test");

//save
//dbCollection.save(mongodb.util.JSON.parse(x));

/*var cursorDocJSON = dbCollection.find();
while (cursorDocJSON.hasNext()) {
    print(cursorDocJSON.next());
}*/

var dbObj = null;

var whereQuery = new BasicDBObject();
//whereQuery.put("name", "Marcelo");

dbCollection.remove(whereQuery);

var cursor = dbCollection.find();
while(cursor.hasNext()) {
    dbObj = cursor.next();
    print(dbObj);
}