/*jslint node: true */
"use strict";

var remote_index = process.argv.indexOf('--remote');

module.exports = function (grunt)
{
    grunt.initConfig(
    {
        jslint: {
            all: {
                src: [ 'Gruntfile.js', 'index.js', 'test/**/*.js' ],
                directives: {
                    white: true
                }
            }
        },

        cafemocha: {
            src: 'test/test_spec.js'
        },
            
        apidox: {
            input: 'index.js',
            output: 'README.md',
            fullSourceDescription: true,
            extraHeadingLevels: 1
        },

        exec: {
            cover: {
                cmd: './node_modules/.bin/istanbul cover ./node_modules/.bin/grunt -- test ' + (remote_index < 0 ? /* istanbul ignore next */ '' : process.argv.slice(remote_index).join(' '))
            },

            check_cover: {
                cmd: './node_modules/.bin/istanbul check-coverage --statement 100 --branch 100 --function 100 --line 100'
            },

            coveralls: {
                cmd: 'cat coverage/lcov.info | coveralls'
            },

            diagrams: {
                cmd: 'dot diagrams/how_it_works.dot -Tsvg -odiagrams/how_it_works.svg'
            },

            pack: {
                cmd: './pack.sh'
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-cafe-mocha');
    grunt.loadNpmTasks('grunt-apidox');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('lint', 'jslint:all');
    grunt.registerTask('test', 'cafemocha');
    grunt.registerTask('docs', ['exec:diagrams', 'apidox']);
    grunt.registerTask('pack', 'exec:pack');
    grunt.registerTask('coverage', ['exec:cover', 'exec:check_cover']);
    grunt.registerTask('coveralls', 'exec:coveralls');
    grunt.registerTask('default', ['jslint:all', 'cafemocha']);
};
