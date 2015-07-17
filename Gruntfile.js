module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-selenium-webdriver');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');

    var testOutputLocation = process.env.CIRCLE_TEST_REPORTS || "test_output";
    var artifactsLocation = "build_artifacts";
    grunt.initConfig({
        jshint: {
            all: ["Gruntfile.js", "server.js", "server/**/*.js", "test/**/*.js", "client/js/*.js"],
            options: {
                jshintrc: true
            }
        },
        protractor: {
            options: {
                configFile: 'test/conf.js',
                args: {
                    params: {
                        name: 'CLONAGE'
                    }
                }
            },
            e2e: {
                options: {
                    // Stops Grunt process if a test fails
                    keepAlive: false
                }
            }
        },
        express: {
            options: {
                port: 8080
                    // Override defaults here
            },
            test: {
                options: {
                    script: './server.js'
                }
            }
        },
        selenium_start: {
            options: {
                port: 4444,
                args : {

                }
            }
        },
        watch: {
            express: {
                files: ['./server/*.js'],
                tasks: ['express:dev'],
                options: {
                    spawn: false // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded
                }
            }
        }
        // mochaTest: {
        //     test: {
        //         src: ["test/**/*.js"]
        //     },
        //     ci: {
        //         src: ["test/**/*.js"],
        //         options: {
        //             reporter: "xunit",
        //             captureFile: testOutputLocation + "/mocha/junit.xml",
        //             quiet: true
        //         }
        //     }
        // }
    });

    grunt.registerTask('selenium', ['selenium_start']);
    grunt.registerTask('server', ['express:test', 'watch']);
    grunt.registerTask('e2e-test', ['express:test', 'selenium_start' , 'protractor:e2e']);
    grunt.registerTask("check", ["jshint"]);
    grunt.registerTask("test", ["check", "e2e-test"]);
    grunt.registerTask("ci-test", ["check", "e2e-test"]);
    grunt.registerTask("default", "test");
};
