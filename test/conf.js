exports.config = {
	seleniumAddress: 'http://localhost:4444/wd/hub',
	specs: ['spec.js'],
	baseUrl: 'http://localhost:8080/',
	params: {
		name: 'CLONAGE'
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
