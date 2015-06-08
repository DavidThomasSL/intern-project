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
            var browser = helpers.openBrowser();
            helpers.getTitleText(browser).then(function(text) {
                assert.equal(text, "Clonage");
            });
        });
    });
    testing.describe("on send message", function() {
        testing.it("clears input field", function() {
            var browser = helpers.openBrowser();
            helpers.sendMessage(browser, "Hello World!");
            helpers.getInputText(browser).then(function(text) {
                assert.equal(text, "");
            });
        });
        testing.it("adds message to list", function() {
            var browser = helpers.openBrowser();
            helpers.sendMessage(browser, "Hello World!");
            helpers.waitForMessage(browser, "Hello World!");
            helpers.getMessages(browser).then(function(elements) {
                assert.equal(elements.length, 1);
                return elements[0].getText();
            }).then(function(text) {
                assert.equal(text, "Hello World!");
            });
        });
        testing.it("sends message to other clients", function() {
            var browser1 = helpers.openBrowser();
            var browser2 = helpers.openBrowser();
            helpers.sendMessage(browser1, "Hello World!");
            helpers.waitForMessage(browser2, "Hello World!");
            helpers.getMessages(browser2).then(function(elements) {
                assert.equal(elements.length, 1);
                return elements[0].getText();
            }).then(function(text) {
                assert.equal(text, "Hello World!");
            });
        });
    });
});

