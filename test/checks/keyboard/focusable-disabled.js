describe('focusable-disabled', function() {
	'use strict';

	var check;
	var fixture = document.getElementById('fixture');
	var fixtureSetup = axe.testUtils.fixtureSetup;
	var shadowSupported = axe.testUtils.shadowSupport.v1;
	var checkContext = axe.testUtils.MockCheckContext();
	var checkSetup = axe.testUtils.checkSetup;

	before(function() {
		check = checks['focusable-disabled'];
	});

	afterEach(function() {
		fixture.innerHTML = '';
		axe._tree = undefined;
		axe._selectorData = undefined;
		checkContext.reset();
	});

	it('returns true when content not focusable by default (no tabbable elements)', function() {
		var params = checkSetup('<p id="target" aria-hidden="true">Some text</p>');
		var actual = check.evaluate.apply(checkContext, params);
		assert.isTrue(actual);
	});

	it('returns true when content hidden through CSS (no tabbable elements)', function() {
		var params = checkSetup(
			'<div id="target" aria-hidden="true"><a href="/" style="display:none">Link</a></div>'
		);
		var actual = check.evaluate.apply(checkContext, params);
		assert.isTrue(actual);
	});

	it('returns true when content made unfocusable through disabled (no tabbable elements)', function() {
		var params = checkSetup(
			'<input id="target" disabled aria-hidden="true" />'
		);
		var actual = check.evaluate.apply(checkContext, params);
		assert.isTrue(actual);
	});

	it('returns true when focusable off screen link (cannot be disabled)', function() {
		var params = checkSetup(
			'<div id="target" aria-hidden="true"><a href="/" style="position:absolute; top:-999em">Link</a></div>'
		);
		var actual = check.evaluate.apply(checkContext, params);
		assert.isTrue(actual);
		assert.lengthOf(checkContext._relatedNodes, 0);
	});

	it('returns false when focusable form field only disabled through ARIA', function() {
		var params = checkSetup(
			'<div id="target" aria-hidden="true"><input type="text" aria-disabled="true"/></div>'
		);
		var actual = check.evaluate.apply(checkContext, params);
		assert.isFalse(actual);
		assert.lengthOf(checkContext._relatedNodes, 1);
		assert.deepEqual(
			checkContext._relatedNodes,
			Array.from(fixture.querySelectorAll('input'))
		);
	});

	it('returns false when focusable SELECT element that can be disabled', function() {
		var params = checkSetup(
			'<div id="target" aria-hidden="true">' +
				'<label>Choose:' +
				'<select>' +
				'<option selected="selected">Chosen</option>' +
				'<option>Not Selected</option>' +
				'</select>' +
				'</label>' +
				'</div>'
		);
		var actual = check.evaluate.apply(checkContext, params);
		assert.isFalse(actual);
		assert.lengthOf(checkContext._relatedNodes, 1);
		assert.deepEqual(
			checkContext._relatedNodes,
			Array.from(fixture.querySelectorAll('select'))
		);
	});

	it('returns true when focusable AREA element (cannot be disabled)', function() {
		var params = checkSetup(
			'<main id="target" aria-hidden="true">' +
				'<map name="infographic">' +
				'<area shape="rect" coords="184,6,253,27" href="https://mozilla.org"' +
				'target="_blank" alt="Mozilla" />' +
				'</map>' +
				'</main>'
		);
		var actual = check.evaluate.apply(checkContext, params);
		assert.isTrue(actual);
	});

	(shadowSupported ? it : xit)(
		'returns false when focusable content inside shadowDOM, that can be disabled',
		function() {
			// Note:
			// `testUtils.checkSetup` does not work for shadowDOM
			// as `axe._tree` and `axe._selectorData` needs to be updated after shadowDOM construction
			fixtureSetup('<div id="target"></div>');
			var node = fixture.querySelector('#target');
			var shadow = node.attachShadow({ mode: 'open' });
			shadow.innerHTML = '<button>Some text</button>';
			axe._tree = axe.utils.getFlattenedTree(fixture);
			axe._selectorData = axe.utils.getSelectorData(axe._tree);
			var virtualNode = axe.utils.getNodeFromTree(axe._tree[0], node);
			var actual = check.evaluate.call(checkContext, node, {}, virtualNode);
			assert.isFalse(actual);
		}
	);

	it('returns true when focusable target that cannot be disabled', function() {
		var params = checkSetup(
			'<div aria-hidden="true"><a id="target" href="">foo</a><button>bar</button></div>'
		);
		var actual = check.evaluate.apply(checkContext, params);
		assert.isTrue(actual);
	});

	it('returns false when focusable target that can be disabled', function() {
		var params = checkSetup(
			'<div aria-hidden="true"><a href="">foo</a><button id="target">bar</button></div>'
		);
		var actual = check.evaluate.apply(checkContext, params);
		assert.isFalse(actual);
	});
});
