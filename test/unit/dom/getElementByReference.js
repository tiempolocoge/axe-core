
describe('dom.getElementByReference', function () {
	'use strict';

	var fixture = document.getElementById('fixture');

	afterEach(function () {
		fixture.innerHTML = '';
	});

	it('should return null if the attribute is not found', function () {
		fixture.innerHTML = '<a id="link" href="#target">Hi</a>';
		var node = document.getElementById('link'),
			result = kslib.dom.getElementByReference(node, 'usemap');

		assert.isNull(result);

	});

	it('should return null if the attribute does not start with "#"', function () {
		fixture.innerHTML = '<a id="link" usemap="target">Hi</a>';
		var node = document.getElementById('link'),
			result = kslib.dom.getElementByReference(node, 'href');

		assert.isNull(result);

	});

	it('should return null if no targets are found', function () {
		fixture.innerHTML = '<a id="link" href="#target">Hi</a>';
		var node = document.getElementById('link'),
			result = kslib.dom.getElementByReference(node, 'href');

		assert.isNull(result);

	});

	it('should prioritize ID', function () {
		fixture.innerHTML = '<a id="link" href="#target">Hi</a>' +
			'<div id="target"></div>' +
			'<div name="target"></div>';

		var node = document.getElementById('link'),
			expected = document.getElementById('target'),
			result = kslib.dom.getElementByReference(node, 'href');

		assert.equal(result, expected);

	});

	it('should fallback to name', function () {
		fixture.innerHTML = '<a id="link" href="#target">Hi</a>' +
			'<div name="target" id="target0"></div>';

		var node = document.getElementById('link'),
			expected = document.getElementById('target0'),
			result = kslib.dom.getElementByReference(node, 'href');

		assert.equal(result, expected);

	});

	it('should return the first matching element with name', function () {
		fixture.innerHTML = '<a id="link" href="#target">Hi</a>' +
			'<div name="target" id="target0"></div>' +
			'<div name="target"></div>';

		var node = document.getElementById('link'),
			expected = document.getElementById('target0'),
			result = kslib.dom.getElementByReference(node, 'href');

		assert.equal(result, expected);

	});

});
