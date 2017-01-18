var express = require('express');
var JiraClient = require('jira-connector');
var swig  = require('swig');
var http = require("http");
var url = require("url");
var config = new Object();
config.username = process.env.app_username;
config.password = process.env.app_password;
config.host = process.env.app_host;
config.stats = process.env.app_stats;
config.associates = process.env.app_associates;
config.managers = process.env.app_managers;
config.refresh = process.env.app_refresh;
config.MONGODB_URI = process.env.MONGODB_URI;

//console.log("config:"+JSON.stringify(config,null,2));

var jiraUtil = require('./jiraUtil');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;


//var mongoUrl = 'mongodb://localhost:27017/eyp';

var jira = new JiraClient({
    host: config.host,
	basic_auth: {
        username: config.username,
		password: config.password
		}
});

var jiraData = new Object();
var associateJiraData, managersJiraData;
jiraData.percentPeopleCovered = new Object();
jiraData.twodArray = [];


var app = express();

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));
//console.log("__dirname:"+__dirname);
// set the home page route

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});

app.get('/', function(req, res) {
	jira.search.search({
		jql: config.stats,
		fields:["assignee","summary","labels"],
		maxResults: 120
	}, function (error, search) {
		var statsJSON = new Object();
		var tpl = swig.compileFile('views/pages/EYP.html');
		statsJSON = jiraUtil.calculatePeopleByTitle(search);
		//console.log(JSON.stringify(statsJSON, null,2));
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(tpl({statsJSON}));	
	});
});

app.get('/associates', function(req, res) {
	var monthIndex = Number(req.query.monthIndex);
	var fileName = "views/pages/EYP_Associates.html";

	if(isNaN(monthIndex)){
		monthIndex = 0;
		console.log("monthIndex:"+monthIndex);
	}

	if(monthIndex < 0){
		getResultFromDB(req,res,fileName);
	}
	else {
		jira.search.search({
			jql: config.associates,
			fields:["assignee","summary","labels"],
			maxResults: 120
		}, function (error, search) {
			jiraData = new Object();
			var tpl = swig.compileFile(fileName);
			jiraData = jiraUtil.parseSearchResults(monthIndex, search);
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(tpl({jiraData}));
		});	
	}
});

app.get('/managers', function(req, res) {
	var monthIndex = Number(req.query.monthIndex);
	var fileName = "views/pages/EYP_Managers.html";

	if(isNaN(monthIndex)){
		monthIndex = 0;
		console.log("monthIndex:"+monthIndex);
	}

	if(monthIndex < 0){
		getResultFromDB(req,res,fileName);
	}
	else {
		jira.search.search({
			jql: config.managers,
			fields:["assignee","summary","labels"],
			maxResults: 120
		}, function (error, search) {
			var jiraData = new Object();
			var tpl = swig.compileFile(fileName);
			jiraData = jiraUtil.parseSearchResults(monthIndex, search);
			res.writeHead(200, {'Content-Type': 'text/html'});
			//console.log(JSON.stringify(twodArray, null, 2));
			res.end(tpl({jiraData}));
		});	
	}
});

function getMonthAndYear(monthIndex){
	var currentDate = new Date();
	var currentMonth = currentDate.getMonth();
	var currentYear = currentDate.getFullYear();
	var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	var mmmyy = months[currentMonth+Number(monthIndex)]+" "+currentYear;

	return mmmyy;
}

function getResultFromDB(req,res,fileName){

	var pathname = url.parse(req.url).pathname;
	console.log("Request for " + pathname + " received."+ "fileName:"+fileName);
	var searchString = "";
	if(pathname=="/associates"){
		searchString = "Associates " + getMonthAndYear(Number(req.query.monthIndex));
	}
	else if(pathname=="/managers"){
		searchString = "Managers " + getMonthAndYear(Number(req.query.monthIndex));
	}

	console.log("searchString:"+searchString);

	MongoClient.connect(config.MONGODB_URI, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else 
		{
			//HURRAY!! We are connected. :)
			console.log('Connection established to', config.MONGODB_URI);

			// Get the documents collection
			var collection = db.collection('conversations');

			collection.find({name: searchString}).toArray(function (err, result) {
				if (err) {
					console.log(err);
				} else if (result.length) {
					//console.log('Found:', result);
					jiraData.mmmyy = result[0].month;
					jiraData.percentPeopleCovered.value = result[0].percentPeopleCovered;
					jiraData.twodArray = result[0].result;
					//console.log("RESULT:"+JSON.stringify(result[0],null,2));
					//console.log("TwoDArray:"+JSON.stringify(jiraData.twodArray,null,2));
					console.log("jiraData.mmmyy:"+jiraData.mmmyy);
					console.log("jiraData.percentPeopleCovered.value:"+jiraData.percentPeopleCovered.value);
				} else {
					console.log('No document(s) found with defined "find" criteria!');
				}
				db.close();
				var tpl = swig.compileFile(fileName);
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(tpl({jiraData}));
			});
		}
	});
}

function insertOrUpdateInDB(){
	
	jira.search.search({
		jql: config.associates,
		fields:["assignee","summary","labels"],
		maxResults: 120
	}, function (error, search) {
		//associateJiraData = new Object();
		associateJiraData = jiraUtil.parseSearchResults(0, search);
	});


	jira.search.search({
		jql: config.managers,
		fields:["assignee","summary","labels"],
		maxResults: 120
	}, function (error, search) {
		managersJiraData = new Object();
		managersJiraData = jiraUtil.parseSearchResults(0, search);
	});

	var searchAssociates = "Associates " + getMonthAndYear(Number(0));
	var searchManagers = "Managers " + getMonthAndYear(Number(0));

	MongoClient.connect(config.MONGODB_URI, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else 
		{
			//HURRAY!! We are connected. :)
			console.log('Connection established to', config.MONGODB_URI);

			// Get the documents collection
			var collection = db.collection('conversations');

			collection.find({name: searchAssociates}).toArray(function (err, result) {
				if (err) {
					console.log(err);
				} else if (result.length) {
					console.log('Found, Lets UPDATE', result);
					collection.update({title: 'associates', month: 'August', year: '2016'}, {$set: {enabled: false}}, function (err, numUpdated) {
						if (err) {
							console.log(err);
						} else if (numUpdated) {
							console.log('Updated Successfully %d document(s).', numUpdated);
						} else {
							console.log('No document found with defined "find" criteria!');
						}
					});

				} else {
					console.log('No document(s) found with defined "find" criteria!, Lets INSERT');
					var record = {title: 'associates', month: 'July', year: '2016', percentPeopleCovered: 88, result: associateJiraData};
					collection.insert([record], function (err, result) {
						if (err) {
							console.log(err);
						} else {
							console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
						}
						//Close connection
						//db.close();
					});
				}				
			});

			/*collection.find({name: searchManagers}).toArray(function (err, result) {
				if (err) {
					console.log(err);
				} else if (result.length) {
					console.log('Found, Lets UPDATE', result);

				} else {
					console.log('No document(s) found with defined "find" criteria!, Lets INSERT');

				}				
			});*/



			db.close();
		}
	});



}

var cron = require('node-cron');
 
var task = cron.schedule('0 0 1 1 * *', function(){
  console.log('running every minute 1, 2, 4 and 5');
  insertOrUpdateInDB();
},false);

task.start();
/*app.get('/apm', function(req, res) {

	jira.search.search({
		jql: config.associates,
		fields:["assignee","summary","labels"],
		maxResults: 120
	}, function (error, search) {
		var jiraData = new Object();
		var tpl = swig.compileFile('views/pages/EYP_Associates.html');
		jiraData = jiraUtil.parseSearchResults(req, search);
		res.writeHead(200, {'Content-Type': 'text/html'});
		//console.log(JSON.stringify(twodArray, null, 2));
		res.end(tpl({jiraData}));
	});	
});*/
