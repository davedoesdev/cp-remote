/*jslint node: true */
"use strict";

const c8 = "npx c8 -x Gruntfile.js -x 'test/**'";

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
            src: [ 'Gruntfile.js', 'index.js', 'test/**/*.js' ],
            options: {
                esversion: 9
            }
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

        exec: Object.fromEntries(Object.entries({
            cover: {
                cmd: `${c8} npx grunt test ${remote_index < 0 ? '' : process.argv.slice(remote_index).join(' ')}`
            },

            cover_report: {
                cmd: `${c8} report -r lcov`
            },

            cover_check: {
                cmd: `${c8} check-coverage --statements 100 --branches 100 --functions 100 --lines 100`
            },

            diagrams: {
                cmd: 'dot diagrams/how_it_works.dot -Tsvg -odiagrams/how_it_works.svg'
            },

            pack: {
                command: './pack.sh'
            }
        }).map(([k, v]) => [k, { stdio: 'inherit', ...v }]))
    });
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-apidox');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('lint', 'jshint');
    grunt.registerTask('pack', 'exec:pack');
    grunt.registerTask('test', 'mochaTest');
    grunt.registerTask('docs', ['exec:diagrams', 'apidox']);
    grunt.registerTask('coverage', ['exec:cover',
                                    'exec:cover_report',
                                    'exec:cover_check']);
    grunt.registerTask('default', ['lint', 'test']);
};
