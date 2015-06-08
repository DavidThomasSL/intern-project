var server = require("../server/server");
var webdriver = require("selenium-webdriver");

var testPort = 52684;

var drivers = [];

module.exports.setupServer = function() {
    return server(testPort);
};

module.exports.teardownServer = function(server) {
    server.close();

    drivers.forEach(function(driver) {
    	driver.quit();
    });
    drivers = [];
};

module.exports.openBrowser = function() {
    var driver = new webdriver.Builder().forBrowser("chrome").build();
    drivers.push(driver);
    driver.get("http://localhost:" + testPort);
    return driver;
};

module.exports.getTitleText = function(driver) {
    return driver.findElement(webdriver.By.css("h1")).getText();
};

module.exports.getInputText = function(driver) {
    return driver.findElement(webdriver.By.id("message-box")).getText();
};

module.exports.getMessages = function(driver) {
    return driver.findElements(webdriver.By.css("#messages li"));
};

module.exports.sendMessage = function(driver, text) {
    driver.findElement(webdriver.By.id("message-box")).sendKeys(text);
    driver.findElement(webdriver.By.id("submit-message")).click();
};

module.exports.waitForMessage = function(driver, text) {
	driver.wait(webdriver.until.elementLocated(webdriver.By.js(messagePresent, text)), 5000);
};

function messagePresent (text) {
	var messages = document.getElementById('messages').childNodes;
	for(var i = 0; i < messages.length; i++) {
		if (messages[i].textContent === text) {
			return messages[i];
		}
	}
	return null;
}

