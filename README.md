# Getting Started
These instructions will get you a copy of the app and make it up and running in few simple steps.

## Prerequisites
You'll need [Git](https://git-scm.com/), [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/). If the following commands all work, you're good to go.

    $ git --version
    $ node --version
    $ npm --version
    
If the above commands don't work, use the below guides for installing git, node.js & npm

- [Install GIT on Windows](https://www.atlassian.com/git/tutorials/install-git/windows)
- [Install node.js and npm on Windows](http://blog.teamtreehouse.com/install-node-js-npm-windows)
    
## Clone repository
Clone git repository with the below command. This will create a local directory "eyp" and will download code from git remote repository. Please note that read access is required on the repository for the below command to work.
    
    $ git clone git@bitbucket.org:dev-antariksh/eyp.git

## Install node dependencies
EYP app uses [ejs](http://www.embeddedjs.com/), [expressjs](http://expressjs.com/), [jira-connector](https://www.npmjs.com/package/jira-connector), [mongodb](https://www.npmjs.com/package/mongodb), [node-cron](https://www.npmjs.com/package/node-cron) & [swig](https://www.npmjs.com/package/swig) node packages. These dependencies can be automatically downloaded using "npm". Please execute following command inside "eyp" directory to download required dependencies:
    
    $ npm install

## Environment variables
The app uses below mentioned environment variables and these needs to be set before running the application.

- __app_associates__: JQL (jira query lanuage) to fetch data for associates.
- __app_managers__: JQL (jira query lanuage) to fetch data for managers and above.
- __app_stats__: JQL (jira query lanuage) to create stats dashboard
- __app_host__: Jira rest api endpoint.
- __app_username__: Jira account username
- __app_password__: Jira account password
- __app_refresh__: Period after which app dashboards automatically refresh.
- __MONGODB_URI__: Connection URI for MongoDB.

#### Setting environment variables
Above mentioned environment variables can be set using [this guide](https://www.microsoft.com/resources/documentation/windows/xp/all/proddocs/en-us/sysdm_advancd_environmnt_addchange_variable.mspx?mfr=true) (windows machine only). Please find below values of the environment variables (please replace data within `<>` with actual values).

- app_associates="project = \"`<jira project name>`\" AND status not in (Closed) AND assignee not in (`<comma separated jira usernames to be excluded>`) AND issuetype = Story and labels not in (\"Manager\", \"Sr_Manager\",\"Director\")  order by assignee, summary"
- app_managers="project = \"`<jira project name>`\" AND status not in (Closed) AND assignee in (`<comma separated jira usernames to be excluded>`) AND issuetype = Story and labels in (\"Manager\", \"Sr_Manager\",\"Director\")  order by assignee, summary"
- app_stats="project = \"`<jira project name>`\" AND status not in (Closed) AND assignee not in (`<comma separated jira usernames to be excluded>`) AND issuetype = Story order by assignee, summary"
- app_host=tools.publicis.sapient.com/jira
- app_refresh=3600
- app_username=`<jira login username>`
- app_password=`<jira login password>`

## Start the app
Run the following command to start the app. By default the app will run on 8080 port and can be accessed with [this](http://localhost:8080) url.

    $ node index.js

## MongoDB
App uses MongoDB for storing snapshot of each month's data. A scheduled job automatically stores the snapshot at the end of each month which can then be retrieved from dashboard.
To plug DB functionality, specify the mongodb uri in the __MONGODB_URI__ environment variable.

## Who do I talk to?
Having questions? Please get in touch with [Antariksh Yadav](mailto:Antariksh.Yadav@sapient.com)