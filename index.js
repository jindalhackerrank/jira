var express = require('express');
var JiraClient = require('jira-connector');
var swig  = require('swig');
var http = require("http");
var url = require("url");
var config = new Object();
config.username = "vgupt6";
config.password = "April2018";
config.host = "tools.publicis.sapient.com/jira";
config.stats ="project = 'Richemontlt' AND status not in (Closed) AND issuetype ='Tech Story'";
config.associates = "project = 'Richemontlt' AND status not in (Closed) AND issuetype = 'Tech Story'";
config.managers = "project = 'Capabilities - Contribution' AND status not in (Closed)  AND issuetype = Story and labels in ('Manager', 'Sr_Manager','Director')  order by assignee, summary";
config.refresh = "3600";
config.MONGODB_URI = 'mongodb://localhost:27017/eyp';

//console.log("config:"+JSON.stringify(config,null,2));

var jiraUtil = require('./jiraUtil');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;


var mongoUrl = 'mongodb://localhost:27017/eyp';

var jira = new JiraClient({
    host: config.host,
	basic_auth: {
        username: config.username,
		password: config.password
		}
});



var jiraData = new Object();
var associatesJiraData, managersJiraData;
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
	console.log(jira);
    console.log('Our app is running on http://localhost:' + port);
});

app.get('/', function(req, res) {
	console.log(config.stats);
	jira.search.search({
		jql: config.stats,
		fields:["assignee","summary","labels"],
		maxResults: 120
	}, function (error, search) {
		console.log(search);
		var statsJSON = new Object();
		var tpl = swig.compileFile('views/pages/EYP.html');
		statsJSON = jiraUtil.calculatePeopleByTitle(search);
		console.log(statsJSON);
		//console.log(JSON.stringify(statsJSON, null,2));
		res.writeHead(200, {'Content-Type': 'text/html'});
		//res.end(tpl({statsJSON}));	
	});
});

app.get('/associates', function(req, res) {
	//insertOrUpdateInDB();
	//insertOldJson(req,res);
	var fileName = "views/pages/EYP_Associates.html";
	var monthIndex = Number(req.query.monthIndex);

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

	//console.log("isNaN monthIndex:"+monthIndex);
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

/*function getMonthAndYear(monthIndex){
	var currentDate = new Date();
	var currentMonth = currentDate.getMonth();
	var currentYear = currentDate.getFullYear();
	var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	var mmmyy = months[currentMonth+Number(monthIndex)]+" "+currentYear;

	return mmmyy;
}*/

function getResultFromDB(req,res,fileName){

	var pathname = url.parse(req.url).pathname;
	var monthIndex = Number(req.query.monthIndex);
	console.log("Request for " + pathname + " received."+ "fileName:"+fileName);

	var monthYearArray = jiraUtil.getMonthAndYear(Number(monthIndex)).split(" ");

	var searchString = [];
	if(pathname=="/associates"){
		searchString = ["associates", monthYearArray[0], monthYearArray[1]];
	}
	else if(pathname=="/managers"){
		searchString = ["managers", monthYearArray[0], monthYearArray[1]];
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
			var isDataFound = false;

			collection.find({title: searchString[0], month: searchString[1], year: searchString[2]}).toArray(function (err, result) {
				if (err) {
					console.log(err);
				} else if (result.length) {
					isDataFound = true;
					//console.log('Found:', result);
					jiraData.mmmyy = " " + result[0].month + " " + result[0].year + " ";
					jiraData.percentPeopleCovered.value = result[0].conversationData.percentPeopleCovered.value;
					jiraData.twodArray = result[0].conversationData.twodArray;
					jiraData.isDataFound = true;
					//console.log("RESULT:"+JSON.stringify(result[0],null,2));
					//console.log("TwoDArray:"+JSON.stringify(jiraData.twodArray,null,2));
					console.log("Data from DB - Month Year:"+jiraData.mmmyy);
					console.log("Data from DB - Percent People Covered:"+jiraData.percentPeopleCovered.value);
				} else {
					jiraData.mmmyy = " " + searchString[1] + " " + searchString[2] + " ";
					jiraData.percentPeopleCovered.value = "";
					jiraData.twodArray = "";
					jiraData.isDataFound = false;
					console.log('No document(s) found with defined "find" criteria!');
				}
				db.close();


				jiraData.historyDropdown = jiraUtil.getMonthsExternal();
				var tpl = swig.compileFile(fileName);
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(tpl({jiraData}));
			});
		}
	});
}

function insertOrUpdateInDB(){
	console.log('########### Entering insertOrUpdateInDB ###########');

	var monthYearArray = jiraUtil.getMonthAndYear(Number(0)).split(" ");
	
	var searchAssociates = ["associates", monthYearArray[0], monthYearArray[1]];
	var searchManagers = ["managers", monthYearArray[0], monthYearArray[1]];

	//console.log("searchAssociates:"+searchAssociates);
	//console.log("searchManagers:"+searchManagers);

	jira.search.search({
		jql: config.associates,
		fields:["assignee","summary","labels"],
		maxResults: 120
	}, function (error, search) {
		associatesJiraData = new Object();
		associatesJiraData = jiraUtil.parseSearchResults(0, search);

		//console.log("associatesJiraData:"+JSON.stringify(associatesJiraData,null,2));

		MongoClient.connect(config.MONGODB_URI, function (err, db) {
			console.log('********* Entering Associates *********');
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			} else 
			{
				//HURRAY!! We are connected. :)
				console.log('Connection established to', config.MONGODB_URI);

				// Get the documents collection
				var collection = db.collection('conversations');

				collection.find({title: searchAssociates[0], month: searchAssociates[1], year: searchAssociates[2]}).toArray(function (err, result) {
					if (err) {
						console.log(err);
					} else if (result.length) {
						console.log('-->Found, Lets UPDATE', result);
						collection.update({title: searchAssociates[0], month: searchAssociates[1], year: searchAssociates[2]}, {$set: {conversationData: associatesJiraData}}, function (err, numUpdated) {
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
						var record = {title: searchAssociates[0], month: searchAssociates[1], year: searchAssociates[2], conversationData: associatesJiraData};
						collection.insert([record], function (err, result) {
							if (err) {
								console.log(err);
							} else {
								console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
							}						
						});
					}
					//Close connection
					db.close();		
					console.log('********* Exiting Associates *********');		
				});
			}
		});
	});

	jira.search.search({
		jql: config.managers,
		fields:["assignee","summary","labels"],
		maxResults: 120
	}, function (error, search) {
		managersJiraData = new Object();
		managersJiraData = jiraUtil.parseSearchResults(0, search);

		//console.log("managersJiraData:"+JSON.stringify(managersJiraData,null,2));

		MongoClient.connect(config.MONGODB_URI, function (err, db) {
			console.log('********* Entering Managers *********');
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			} else 
			{
				//HURRAY!! We are connected. :)
				console.log('Connection established to', config.MONGODB_URI);

				// Get the documents collection
				var collection = db.collection('conversations');

				collection.find({title: searchManagers[0], month: searchManagers[1], year: searchManagers[2]}).toArray(function (err, result) {
					if (err) {
						console.log(err);
					} else if (result.length) {
						console.log('-->Found, Lets UPDATE', result);
						collection.update({title: searchManagers[0], month: searchManagers[1], year: searchManagers[2]}, {$set: {conversationData: managersJiraData}}, function (err, numUpdated) {
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
						var record = {title: searchManagers[0], month: searchManagers[1], year: searchManagers[2], conversationData: managersJiraData};
						
						collection.insert([record], function (err, result) {
							if (err) {
								console.log(err);
							} else {
								console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
							}						
						});
					}
					//Close connection
					db.close();		
					console.log('********* Exiting Managers *********');		
				});
			}
		});
	});

	console.log('########### Exiting insertOrUpdateInDB ###########');
}

var cron = require('node-cron');
 
var task = cron.schedule('15 * * * *', function(){
  //console.log('running every minute 1, 2, 4 and 5');
  console.log('********* Entering Cron Job *********');
  insertOrUpdateInDB();
  console.log('********* Exiting Cron Job *********');
},false);

task.start();	

//=================================================================