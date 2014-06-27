describe('dqre.run', function () {
	'use strict';

	function iframeReady(src, context, id, cb) {
		var i = document.createElement('iframe');
		i.addEventListener('load', function () {
			cb();
		});
		i.src = src;
		i.id = id;
		context.appendChild(i);
	}

	function createFrames(callback) {
		var frame, num = 2,
			loaded = 0;

		function onLoad() {
			loaded++;
			if (loaded >= (num)) {
				callback();
			}
		}

		frame = document.createElement('frame');
		frame.src = '../mock/frames/frame-frame.html';

		frame.addEventListener('load', onLoad);
		fixture.appendChild(frame);


		frame = document.createElement('frame');
		frame.src = '../mock/frames/nocode.html';
		frame.addEventListener('load', onLoad);
		fixture.appendChild(frame);
	}

	var fixture = document.getElementById('fixture');

	afterEach(function () {
		fixture.innerHTML = '';
		dqre.audit = null;
	});

	it('should throw if no audit is configured', function () {

		assert.throws(function () {
			dqre.run(document, {});
		}, Error, /^No audit configured/);
	});

	it('should work', function (done) {
		this.timeout(50000);
		dqre.configure({ rules: [{
			id: 'html',
			selector: 'html',
			checks: [{
				id: 'html',
				evaluate: function () {
					return true;
				}
			}]
		}], messages: {}});

		createFrames(function () {
			setTimeout(function () {
				dqre.run(document, {}, function (r) {
					assert.lengthOf(r[0].details, 3);
					done();
				});

			}, 500);

		});
	});
	it('should properly calculate context and return results from matching frames', function (done) {

		dqre.configure({
			rules: [{
				id: 'div#target',
				selector: '#target',
				checks: [{
					id: 'has-target',
					evaluate: function () {
						return true;
					}
				}]
			}, {
				id: 'first-div',
				selector: 'div',
				checks: [{
					id: 'first-div',
					evaluate: function (node) {
						this.relatedNodes([node]);
						return false;
					},
					after: function (results) {
						if (results.length) {
							results[0].result = true;
						}
						return [results[0]];
					}
				}]
			}],
			messages: {}
		});

		iframeReady('../mock/frames/context.html', fixture, 'context-test', function () {
			var div = document.createElement('div');
			fixture.appendChild(div);

			dqre.run('#fixture', {}, function (results) {
				assert.deepEqual(results, [{
					id: 'div#target',
					pageLevel: false,
					details: [{
						node: {
							selector: '#target',
							source: '<div id="target"></div>',
							frames: ['#context-test']
						},
						result: 'PASS',
						checks: [{
							id: 'has-target',
							type: 'PASS',
							data: null,
							result: true,
							error: null,
							relatedNodes: []
						}]
					}],
					result: 'PASS'
				}, {
					id: 'first-div',
					pageLevel: false,
					details: [{
						node: {
							selector: '#foo',
							source: '<div id="foo">\n		<div id="bar"></div>\n	</div>',
							frames: ['#context-test']
						},
						result: 'PASS',
						checks: [{
							id: 'first-div',
							type: 'PASS',
							data: null,
							result: true,
							error: null,
							relatedNodes: [{
								selector: '#foo',
								source: '<div id="foo">\n		<div id="bar"></div>\n	</div>',
								frames: ['#context-test']
							}]
						}]
					}],
					result: 'PASS'
				}]);

				done();
			});

		});
	});
});
