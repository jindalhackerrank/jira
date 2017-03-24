var currentDate = new Date();
var currentMonth = currentDate.getMonth();
var currentYear = currentDate.getFullYear();
var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
var historyDuration = 6;

module.exports = {

	// for reflector home page
	calculatePeopleByTitle: function (search){
		console.log(JSON.stringify(search));
		var jiraPeopleList = search;
		var person = 0;
		var noOfAL1 = 0, noOfAL2 = 0, noOfSAL1 = 0, noOfSAL2 = 0, noOfSAPM = 0, noOfManager = 0, noOfSrManager = 0, noOfDirector = 0;
		var coveredAL1 = 0, coveredAL2 = 0, coveredSAL1 = 0, coveredSAL2 = 0, coveredSAPM = 0, coveredManager = 0, coveredSrManager = 0, coveredDirector = 0;
		var coveredAL1Percent = 0, coveredAL2Percent = 0, coveredSAL1Percent = 0, coveredSAL2Percent = 0, coveredSAPMPercent = 0, coveredManagerPercent = 0, coveredSrManagerPercent = 0, coveredDirectorPercent = 0;
		var noOfGG = 0, noOfNGG = 0;
		numberOfPeopleInJira = jiraPeopleList ? jiraPeopleList.issues.length : 0;

		//console.log("labels:"+JSON.stringify(jiraPeopleList, null, 2));

		for(person=0;person<numberOfPeopleInJira;person++){
			var labels = jiraPeopleList.issues[person].fields.labels;
			console.log(labels);
			var labelsString = labels.toString().toLowerCase();
			var monthLabel = getMonthLabel("").toString().toLowerCase();

			//console.log("labelsString:"+labelsString);
			if(labelsString.indexOf(monthLabel) > -1){
				if(labelsString.indexOf("sr_manager") > -1){
					coveredSrManager++;
				} else if (labelsString.indexOf("manager") > -1){
					coveredManager++;
				} else if (labelsString.indexOf("sapm") > -1){
					coveredSAPM++;
				} else if (labelsString.indexOf("sal2") > -1){
					coveredSAL2++;
				} else if (labelsString.indexOf("sal1") > -1){
					coveredSAL1++;
				} else if (labelsString.indexOf("al2") > -1){
					coveredAL2++;
				} else if (labelsString.indexOf("al1") > -1){
					coveredAL1++;
				} else if (labelsString.indexOf("director") > -1){
					coveredDirector++;
				}
			}

			//console.log("labels:"+JSON.stringify(labels, null, 2));
			//console.log("labels.length:"+labels.length);
			for (label = 0; label < labels.length;label++){
				if (labels[label].toLowerCase() == "al1"){
					noOfAL1++;
				} else if (labels[label].toLowerCase() == "al2"){
					noOfAL2++;
				} else if (labels[label].toLowerCase() == "sal1"){
					noOfSAL1++;
				} else if (labels[label].toLowerCase() == "sal2"){
					noOfSAL2++;
				} else if (labels[label].toLowerCase() == "sapm"){
					noOfSAPM++;
				}else if (labels[label].toLowerCase() == "manager"){
					noOfManager++;
				} else if (labels[label].toLowerCase() == "sr_manager"){
					noOfSrManager++;
				} else if (labels[label].toLowerCase() == "director"){
					noOfDirector++;
				}

				if (labels[label].toLowerCase() == "gg"){
					noOfGG++;
				} else if (labels[label].toLowerCase() == "ngg"){
					noOfNGG++;
				}
			}
		}

		var totalTitle =  0, totalGG = 0;
		totalTitle = noOfAL1 + noOfAL2 + noOfSAL1 + noOfSAL2 + noOfSAPM + noOfManager + noOfSrManager + noOfDirector;
		totalGG = noOfGG + noOfNGG;

		
		/*console.log("coveredSAL2:"+coveredSAL2);
		console.log("coveredSAL1:"+coveredSAL1);
		console.log("coveredAL2:"+coveredAL2);
		console.log("coveredAL1:"+coveredAL1);
		console.log("noOfAL1:"+noOfAL1);
		console.log("noOfAL2:"+noOfAL2);
		console.log("noOfSAL1:"+noOfSAL1);
		console.log("noOfSAL2:"+noOfSAL2);
		
		console.log("coveredDirector:"+coveredDirector);
		console.log("coveredSrManager:"+coveredSrManager);
		console.log("coveredManager:"+coveredManager);
		console.log("coveredSAPM:"+coveredSAPM);
		console.log("noOfSAPM:"+noOfSAPM);
		console.log("noOfManager:"+noOfManager);
		console.log("noOfSrManager:"+noOfSrManager);
		console.log("noOfDirector:"+noOfDirector);*/

		/*console.log("noOfGG:"+noOfGG);
		console.log("noOfNGG:"+noOfNGG);
		console.log("totalGG:"+totalGG);*/



		coveredAL1Percent = Math.ceil(coveredAL1*100/noOfAL1);
		coveredAL2Percent = Math.ceil(coveredAL2*100/noOfAL2);
		coveredSAL1Percent = Math.ceil(coveredSAL1*100/noOfSAL1);
		coveredSAL2Percent = Math.ceil(coveredSAL2*100/noOfSAL2);
		coveredSAPMPercent = Math.ceil(coveredSAPM*100/noOfSAPM);
		coveredManagerPercent = Math.ceil(coveredManager*100/noOfManager);
		coveredSrManagerPercent = Math.ceil(coveredSrManager*100/noOfSrManager);
		coveredDirectorPercent = Math.ceil(coveredDirector*100/noOfDirector);

		var coveredAssocs = coveredAL1 + coveredAL2 + coveredSAL1 + coveredSAL2 + coveredSAPM;
		var coveredManagers = coveredManager + coveredSrManager + coveredDirector;
		var totalAssocs = noOfAL1 + noOfAL2 + noOfSAL1 + noOfSAL2 + noOfSAPM;
		var totalManagers = noOfManager + noOfSrManager + noOfDirector;

		/*console.log("coveredAssocs:"+coveredAssocs);
		console.log("totalAssocs:"+totalAssocs);*/

		var coveredAssocsPercent = Math.ceil(coveredAssocs*100/totalAssocs);
		var coveredManagersPercent = Math.ceil(coveredManagers*100/totalManagers);

/*z		console.log("=============================================================");
		console.log("coveredAL1Percent:"+coveredAL1Percent);
		console.log("coveredAL2Percent:"+coveredAL2Percent);
		console.log("coveredSAL1Percent:"+coveredSAL1Percent);
		console.log("coveredSAL2Percent:"+coveredSAL2Percent);
		console.log("coveredSAPMPercent:"+coveredSAPMPercent);
		console.log("coveredManagerPercent:"+coveredManagerPercent);
		console.log("coveredSrManagerPercent:"+coveredSrManagerPercent);
		console.log("coveredDirectorPercent:"+coveredDirectorPercent);
		console.log("=============================================================");
		console.log("numberOfPeopleInJira:"+numberOfPeopleInJira);
		console.log("sum of titles in Jira:"+totalTitle);
		console.log("=============================================================");
		console.log("coveredAssocsPercent:"+coveredAssocsPercent);
		console.log("coveredManagersPercent:"+coveredManagersPercent);
		console.log("=============================================================");*/

		var statsJSON = new Object();
		statsJSON.coveredAL1Percent = coveredAL1Percent;
		statsJSON.coveredAL2Percent = coveredAL2Percent;
		statsJSON.coveredSAL1Percent = coveredSAL1Percent;
		statsJSON.coveredSAL2Percent = coveredSAL2Percent;
		statsJSON.coveredSAPMPercent = coveredSAPMPercent;
		statsJSON.coveredManagerPercent = coveredManagerPercent;
		statsJSON.coveredSrManagerPercent = coveredSrManagerPercent;
		statsJSON.coveredDirectorPercent = coveredDirectorPercent;
		statsJSON.noOfGG = noOfGG;
		statsJSON.coveredAssocsPercent = coveredAssocsPercent;
		statsJSON.coveredManagersPercent = coveredManagersPercent;

		return statsJSON;
	},

	//for Associates & Managers Details Page
	parseSearchResults: function (monthIndex, search){

		//console.log("req:"+req.url);
		//console.log("req.query:"+req.query.monthIndex);

		//var monthIndex = Number(req.query.monthIndex);
		console.log("monthIndex:"+monthIndex);

		var jiraData = new Object();
		jiraData.percentPeopleCovered = new Object();
		jiraData.twodArray = [];

		var jiraPeopleList = search;			

		var percentPeopleCovered = new Object();
		var twodArray = [];
		var peopleJSON = new Object();
		var dataObject = new Object();

		var person,numberOfPeopleInJira;
		var counter = -1;
		var maxSupervisee = 0;
		var superviseeCounter = 0;

		peopleJSON.data = [];
		dataObject.name = "";
		numberOfPeopleInJira = jiraPeopleList.issues.length;

		for(person=0;person<numberOfPeopleInJira;person++){
			var supervisee = new Object();

			if(null!=dataObject.name && dataObject.name != jiraPeopleList.issues[person].fields.assignee.displayName){
				if(counter != -1) {
					peopleJSON.data[counter] = dataObject;
				}
				counter++;
				dataObject = new Object();
				dataObject.name = jiraPeopleList.issues[person].fields.assignee.displayName;
				dataObject.supervisee = [];
				superviseeCounter = 0;
			}

			supervisee.summary = jiraPeopleList.issues[person].fields.summary;
			supervisee.labels = jiraPeopleList.issues[person].fields.labels;

			dataObject.supervisee[superviseeCounter] = supervisee;
			superviseeCounter++;
			if (maxSupervisee < superviseeCounter){
				maxSupervisee = superviseeCounter;
			}
		}

		peopleJSON.data[counter] = dataObject;
		var recordObject = new Object();
		var totalPeopleCovered = 0;
		var returnColor = "";


		for(con=0;con<=maxSupervisee;con++) {
			twodArray[con] = [];
		}

		for(newi=0;newi<peopleJSON.data.length;newi++) {
			recordObject  = new Object();
			recordObject.value = peopleJSON.data[newi].name;
			recordObject.flagValue = -1;
			recordObject.conversationCount = -1;
			twodArray[0][newi] = recordObject;

			for(newj=0;newj<maxSupervisee;newj++) {
				recordObject  = new Object();
				if(newj<peopleJSON.data[newi].supervisee.length) {
					recordObject.value = peopleJSON.data[newi].supervisee[newj].summary;
					returnColor = checkStatus(peopleJSON.data[newi].supervisee[newj],monthIndex);

					if(returnColor == "green") {
						recordObject.flagValue = 1;
						totalPeopleCovered++;
					} else if (returnColor == "red"){
						recordObject.flagValue = 0;
					}
					else{
						recordObject.flagValue = -1;
					}
				} else {
					recordObject  = new Object();
					recordObject.value = "";
					recordObject.flagValue = -1;
				}
				
				if(peopleJSON.data[newi].supervisee[newj] != null){
					var labelsString = peopleJSON.data[newi].supervisee[newj].labels.toString();
					if(labelsString != null && labelsString.includes("-16")){
						//console.log("Labels:"+labelsString);
						var countConv = labelsString.match(/-16/g).length;
						//console.log("countConv:" +countConv);
						recordObject.conversationCount = "("+Math.ceil(countConv*100/(currentDate.getMonth()+1))+"% )";
					}
				}				
				twodArray[newj+1][newi] = recordObject;
			}
		}

		percentPeopleCovered.value = Math.ceil(totalPeopleCovered*100/numberOfPeopleInJira);

		jiraData.percentPeopleCovered.value = " "+percentPeopleCovered.value;
		jiraData.twodArray = twodArray;
		jiraData.mmmyy = " "+module.exports.getMonthAndYear(monthIndex)+" ";

		//console.log("TwoDArray:"+JSON.stringify(jiraData.twodArray,null,2));
		console.log("numberOfPeopleInJira:"+numberOfPeopleInJira);
		console.log("totalPeopleCovered:"+totalPeopleCovered);
		console.log("jiraData.percentPeopleCovered:"+jiraData.percentPeopleCovered.value+"%");
		//console.log("RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRREEEEEEEEETURNING");
		var historyDropdown = getMonths();
		jiraData.historyDropdown = historyDropdown;
		jiraData.isDataFound = true;
		return jiraData;
	},

	getMonthsExternal : function(){
		return getMonths();
	},

	getMonthAndYear : function(monthIndex){		
		var mmmyy = months[currentMonth+Number(monthIndex)]+" "+currentYear;
		return mmmyy;
	}
	
};

	function getMonths(){
		var monthCounter = currentMonth;
		var yearCounter = currentYear;
		var historyDropdown = [];
		for(var i=0;i<historyDuration;i++){
			if(monthCounter==-1){
				//console.log("monthCounter:"+monthCounter);	
				monthCounter = 11;
				yearCounter = yearCounter-1;
			}
			//console.log("monthCounter:"+months[monthCounter]);
			//console.log("yearCounter:"+yearCounter);
			historyDropdown[i] = new Object();			
			historyDropdown[i].Label = months[monthCounter] + " " + yearCounter;
			if(i==0){
				historyDropdown[i].monthIndex = ""+i;
			}
			else{
				historyDropdown[i].monthIndex = "-"+i;	
			}
			
			//console.log("historyDropdown[i]:"+JSON.stringify(historyDropdown[i],0,2));			
			monthCounter--;		
		}
		return historyDropdown;
	}
	

	//methood used for labels in JIRA project
	function getMonthLabel(monthIndex){
		//var currentDate = new Date();
		var currentMonth = currentDate.getMonth();
		var currentYear = currentDate.getFullYear()-2000;
		var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		var monthLabel = months[currentMonth+Number(monthIndex)]+"-"+currentYear;

		//console.log("monthLabel:"+monthLabel);

		return monthLabel;
	}

	function checkStatus (issue,monthIndex) {

		var monthLabel = getMonthLabel(monthIndex);

		//console.log("monthIndex:"+monthIndex);
		if(monthIndex < 0){
			//console.log("setting date manually");
			currentDate.setDate(28);
		}
		else {
			currentDate = new Date();	
		}		
		var isConversationLabel = 0;

		for(k=0;k<issue.labels.length;k++) {
			if(issue.labels[k].toLowerCase()==(monthLabel.toLowerCase())){
				isConversationLabel = 1;
				break;
			}
		}

		//console.log("currentDate.getDate():"+currentDate.getDate());

		if (isConversationLabel == 1){
			return "green";
		}
		else if (currentDate.getDate() < 15){
			return "white";
		}
		else {
			return "red";
		}
	}