/*jshint node: true, camelcase: false */


module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-blanket-mocha');
	grunt.loadTasks('build/tasks');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		watch: {
			files: ['<%= concat.lib.src %>', 'test/**/*'],
			tasks: ['concat']
		},
		concat: {
			lib: {
				src: [
					'lib/intro.stub',
					'bower_components/node-uuid/uuid.js',
					'lib/index.js',
					'lib/*/index.js',
					'lib/**/*.js',
					'lib/export.js',
					'lib/outro.stub'
				],
				dest: 'dist/dqre.js'
			},
			options: {
				process: true
			}
		},
		connect: {
			test: {
				options: {
					hostname: '0.0.0.0',
					port: 9876,
					base: ['.']
				}
			}
		},
		fixture: {
			unit: {
				src: '<%= concat.lib.src %>',
				dest: 'test/unit/index.html',
				options: {
					fixture: 'test/unit/runner.tmpl',
					testCwd: 'test/unit'
				}
			},
			integration: {
				src: '<%= concat.lib.dest %>',
				dest: 'test/integration/index.html',
				options: {
					fixture: 'test/integration/runner.tmpl',
					testCwd: 'test/integration'
				}
			}
		}
	});

	grunt.registerTask('server', ['fixture', 'connect:test:keepalive']);
	grunt.registerTask('test', ['fixture', 'yeti']);
	grunt.registerTask('build', ['concat']);
	grunt.registerTask('default', ['build']);

};