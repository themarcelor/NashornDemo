#!/usr/bin/jjs -cp mongo-2.10.1.jar -scripting
#
/*
  Author: Marcelo Rodrigues
  Email: themarcelor@gmail.com
  Date: May 2013
*/
var mongodb = Packages.com.mongodb;
var MongoClient = mongodb.MongoClient;
var MongoException = mongodb.MongoException;
var WriteConcern = mongodb.WriteConcern;
var DB = mongodb.DB;
var DBCollection = mongodb.DBCollection;
var BasicDBObject = mongodb.BasicDBObject;
var DBObject = mongodb.DBObject;
var DBCursor = mongodb.DBCursor;
var ServerAddress = mongodb.ServerAddress;

var Arrays = java.util.Arrays;

var mongoConnector = (function() {
    //Singleton
    var mongoConnector;
    function init() {
	
	return {
	    getDB : function() {
	        var mongo = new MongoClient("localhost");
		var db = mongo.getDB("test");
	        return db;
	    }
	}
    }

    return {
	//Get the singleton instance or create a new one
	getInstance : function() {
	    if(!mongoConnector) {
		mongoConnector = init();
	    }
            return mongoConnector;
	}
    }
    return mongoClient;

})();