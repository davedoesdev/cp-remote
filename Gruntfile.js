/*jslint node: true */
"use strict";

var remote_index = -1;
for (var i = 0; i < process.argv.length; i += 1)
{
    if (process.argv[i].lastIndexOf('--remote=', 0) === 0)
    {
        remote_index = i;
        break;
    }
}

module.exports = function (grunt)
{
    grunt.initConfig(
    {
        jshint: {
            src: [ 'Gruntfile.js', 'index.js', 'test/**/*.js' ]
        },

        mochaTest: {
            src: 'test/test_spec.js'
        },
            
        apidox: {
            input: 'index.js',
            output: 'README.md',
            fullSourceDescription: true,
            extraHeadingLevels: 1
        },

        shell: {
            cover: {
                command: "./node_modules/.bin/nyc -x Gruntfile.js -x 'test/**' ./node_modules/.bin/grunt test " + (remote_index < 0 ? '' : process.argv.slice(remote_index).join(' '))
            },

            cover_report: {
                command: './node_modules/.bin/nyc report -r lcov'
            },

            cover_check: {
                command: './node_modules/.bin/nyc check-coverage --statement 100 --branch 100 --function 100 --line 100'
            },

            coveralls: {
                command: 'cat coverage/lcov.info | coveralls'
            },

            diagrams: {
                command: 'dot diagrams/how_it_works.dot -Tsvg -odiagrams/how_it_works.svg'
            },

            pack: {
                command: './pack.sh'
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-apidox');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('lint', 'jshint');
    grunt.registerTask('test', 'mochaTest');
    grunt.registerTask('docs', ['shell:diagrams', 'apidox']);
    grunt.registerTask('pack', 'shell:pack');
    grunt.registerTask('coverage', ['shell:cover',
                                    'shell:cover_report',
                                    'shell:cover_check']);
    grunt.registerTask('coveralls', 'shell:coveralls');
    grunt.registerTask('default', ['lint', 'test']);
};
