var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var helpers = require("./testHelpers");

testing.describe("end to end", function() {
    var server;

    this.timeout(20000);

    testing.beforeEach(function() {
        server = helpers.setupServer();
    });
    testing.afterEach(function() {
        helpers.teardownServer(server);
    });

    testing.describe("on page load", function() {
        testing.it("displays Clonage title", function() {
            helpers.navigateToSite(server);
            helpers.getTitleText(server).then(function(text) {
                assert.equal(text, "Clonage");
            });
        });
    });
});

