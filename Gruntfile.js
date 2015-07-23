module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-selenium-webdriver');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-auto-install');
    grunt.loadNpmTasks('grunt-script-link-tags');

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
                    "verbose": "true"
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
                    script: './server.js',
                    args: ['debug=true']
                }
            },
            prod: {
                options: {
                    script: './server.js',
                    args: ['debug=false']
                }
            }
        },
        selenium_start: {
            options: {
                port: 4444,
                args: {

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
        },
        auto_install: {
            local: {}
        },
        tags: {
            build: {
                options: {
                    scriptTemplate: '<script src="{{ path }}"></script>',
                    linkTemplate: '<link href="{{ path }}"/>',
                    openTag: '<!-- start client/js tags -->',
                    closeTag: '<!-- end client/js tags -->'
                },
                src: [
                    'client/js/**/*.js',
                ],
                dest: 'client/index.html'
            }
        }
    });

    grunt.registerTask('selenium', ['selenium_start']);
    grunt.registerTask('server', ['express:test', 'watch']);
    grunt.registerTask('e2e-test', ['express:test', 'selenium_start', 'protractor:e2e']);
    grunt.registerTask('ci-e2e-test', ['express:prod', 'selenium_start', 'protractor:e2e']);
    grunt.registerTask("check", ["jshint"]);
    grunt.registerTask("install", "auto_install");
    grunt.registerTask("test", ["check", "e2e-test"]);
    grunt.registerTask("ci-test", ["check", "ci-e2e-test"]);
    grunt.registerTask("scripts", "tags");
    grunt.registerTask("default", ['tags', 'test']);
};
