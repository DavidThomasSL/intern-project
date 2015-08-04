// Karma configuration
// Generated on Mon Jul 27 2015 14:07:55 GMT+0100 (GMT Daylight Time)

module.exports = function(config) {
    config.set({



        // you can define custom flags
        customLaunchers: {
            'PhantomJS_custom': {
                base: 'PhantomJS',
                options: {
                    windowName: 'my-window',
                    settings: {
                        webSecurityEnabled: false
                    },
                },
                flags: ['--load-images=true'],
                debug: true
            }
        },

        phantomjsLauncher: {
            // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
            exitOnResourceError: true
        },

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../../',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            "https://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular.js",
            "https://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular-route.js",
            "https://cdnjs.cloudflare.com/ajax/libs/ngStorage/0.3.6/ngStorage.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.3/angular-animate.js",
            "client/includes/toastr/release/angular-toastr.tpls.js",
            "node_modules/angular-mocks/angular-mocks.js",
            "client/Angular/**/*.js",
            "test/karma/*.js",
        ],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['spec'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS', 'PhantomJS_custom'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
