exports.config = {
	seleniumAddress: 'http://localhost:4444/wd/hub',

	specs: [ //comment out lines here to test specific sections
		// 'initalSpec.js',
		// 'userInitialiseSpec.js',
		// 'userRegisteredSpec.js',
		// 'roomCreateSpec.js',
		// 'joinRoomSpec.js',
		// 'startingGameSpec.js',
		//'playingGameSpec.js',
		'afterRoundSpec.js',
		//'afterGameSpec.js'
		],
	baseUrl: 'http://localhost:8080/',
	params: {
		name: 'CLONAGE'
	},
	onPrepare: function() {
		var SpecReporter = require('jasmine-spec-reporter'); // npm install jasmine-spec-reporter
		jasmine.getEnv().addReporter(new SpecReporter({
			displayStacktrace: true
		}));
	},
	capabilities: {
		'browserName': 'chrome',
		'chromeOptions': {
			'args': ['incognito']
		}
	},
	framework: 'jasmine2',
	getPageTimeout: 10000,
	allScriptsTimeout: 10000
};
