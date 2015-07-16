module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-mocha-test");

    var testOutputLocation = process.env.CIRCLE_TEST_REPORTS || "test_output";
    var artifactsLocation = "build_artifacts";
    grunt.initConfig({
        jshint: {
            all: ["Gruntfile.js", "server.js", "server/**/*.js", "test/**/*.js", "client/js/*.js"],
            options: {
                jshintrc: true
            }
        },
        mochaTest: {
            test: {
                src: ["test/**/*.js"]
            },
            ci: {
                src: ["test/**/*.js"],
                options: {
                    reporter: "xunit",
                    captureFile: testOutputLocation + "/mocha/junit.xml",
                    quiet: true
                }
            }
        }
    });

    grunt.registerTask("check", ["jshint"]);
    grunt.registerTask("test", ["check", "mochaTest:test"]);
    grunt.registerTask("ci-test", ["check", "mochaTest:ci"]);
    grunt.registerTask("default", "test");
};
