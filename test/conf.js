exports.config = {
	seleniumAddress: 'http://localhost:4444/wd/hub',
	specs: ['spec.js'],
	baseUrl: 'http://localhost:8080/',
	params: {
		name: 'CLONAGE'
	},
};
