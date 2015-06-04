var server = require("../server/server");
var webdriver = require("selenium-webdriver");

var testPort = 52684;

module.exports.setupServer = function() {
    var serverInstance = server(testPort);
    var driver = new webdriver.Builder().forBrowser("chrome").build();
    return {server: serverInstance, driver: driver};
};

module.exports.teardownServer = function(server) {
    server.server.close();
    server.driver.quit();
};

module.exports.navigateToSite = function(server) {
    server.driver.get("http://localhost:" + testPort);
};

module.exports.getTitleText = function(server) {
    return server.driver.findElement(webdriver.By.css("h1")).getText();
};

