// Listens for URL changes of any tabs and if wikipedia gathers info from them.

// store wikipedia title tag to strip out later
var titleTag = ' - Wikipedia, the free encyclopedia';

// create database if does not already exist
var db = window.openDatabase(
	'WikiMapper',			// db name
	'0.1',						// version
	'wikimapper',			// description
	5*1024*1024			// db size in bytes
);

// create table if does not already exist
db.transaction(function (tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS PAGES (id INTEGER NOT NULL PRIMARY KEY, title, url, ref, date)');
});


function checkForWikiUrl(details) {
	if (details.url.indexOf('wikipedia.org')) {
		requestPageData(details.tabId, function(response) {
			recordPageData(response);
		});
	}
}

function requestPageData(tabId, callback) {
	chrome.tabs.sendMessage(tabId, {greeting: "wikimapper"}, function(response) {
			callback(response);
	})
}

function recordPageData(response) {
	var page = {};
	page.title = response.title.replace(titleTag, "");
	page.url = response.url;
	page.ref = response.ref;
	page.date = Date.now();
	db.transaction(function (tx) {
		tx.executeSql('INSERT INTO PAGES (title,url,ref,date) VALUES (?,?,?,?)', [page.title, page.url, page.ref, page.date]);
	})	
}

// Listen for any changes to the URL of any tab.
//chrome.tabs.onUpdated.addListener(checkForWikiUrl);
chrome.webNavigation.onCompleted.addListener(function(details) {
	checkForWikiUrl(details);
});