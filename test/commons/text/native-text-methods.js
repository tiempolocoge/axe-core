describe('text.nativeTextMethods', function() {
	var text = axe.commons.text;
	var nativeTextMethods = text.nativeTextMethods;
	var fixtureSetup = axe.testUtils.fixtureSetup;

	describe('valueText', function() {
		var valueText = nativeTextMethods.valueText;
		it('returns the value of actualNode', function() {
			fixtureSetup('<input value="foo" />');
			var input = axe.utils.querySelectorAll(axe._tree[0], 'input')[0];
			assert.equal(valueText(input), 'foo');
		});

		it('returns `` when there is no value', function() {
			fixtureSetup('<input />');
			var input = axe.utils.querySelectorAll(axe._tree[0], 'input')[0];
			assert.equal(valueText(input), '');
		});
	});

	describe('buttonDefaultText', function() {
		var buttonDefaultText = nativeTextMethods.buttonDefaultText;
		it('returns the default button text', function() {
			fixtureSetup(
				'<input type="submit" />' +
					'<input type="image" />' +
					'<input type="reset" />' +
					'<input type="button" />'
			);
			var inputs = axe.utils.querySelectorAll(axe._tree[0], 'input');
			assert.equal(buttonDefaultText(inputs[0]), 'Submit');
			assert.equal(buttonDefaultText(inputs[1]), 'Submit');
			assert.equal(buttonDefaultText(inputs[2]), 'Reset');
			assert.equal(buttonDefaultText(inputs[3]), '');
		});

		it('returns `` when the element is not a button', function() {
			fixtureSetup('<input type="text">');
			var input = axe.utils.querySelectorAll(axe._tree[0], 'input')[0];
			assert.equal(buttonDefaultText(input), '');
		});
	});

	describe('altText', function() {
		var altText = nativeTextMethods.altText;
		it('returns the alt attribute of actualNode', function() {
			fixtureSetup('<img alt="foo" />');
			var img = axe.utils.querySelectorAll(axe._tree[0], 'img')[0];
			assert.equal(altText(img), 'foo');
		});

		it('returns `` when there is no alt', function() {
			fixtureSetup('<img />');
			var img = axe.utils.querySelectorAll(axe._tree[0], 'img')[0];
			assert.equal(altText(img), '');
		});
	});

	describe('figureText', function() {
		var figureText = nativeTextMethods.figureText;
		it('returns the figcaption text', function() {
			fixtureSetup(
				'<figure>' +
					'  <figcaption>My caption</figcaption>' +
					'  some content' +
					'</figure>'
			);
			var figure = axe.utils.querySelectorAll(axe._tree[0], 'figure')[0];
			assert.equal(figureText(figure), 'My caption');
		});

		it('returns `` when there is no figcaption', function() {
			var figureText = nativeTextMethods.figureText;
			it('returns the figcaption text', function() {
				fixtureSetup('<figure>' + '  some content' + '</figure>');
				var figure = axe.utils.querySelectorAll(axe._tree[0], 'figure')[0];
				assert.equal(figureText(figure), '');
			});
		});

		it('returns `` when if the figcaption is nested in another figure', function() {
			var figureText = nativeTextMethods.figureText;
			it('returns the figcaption text', function() {
				fixtureSetup(
					'<figure id="fig1">' +
						'  <figure>' +
						'    <figcaption>No caption</figcaption>' +
						'    some content' +
						'  </figure>' +
						'  some other content' +
						'</figure>'
				);
				var figure = axe.utils.querySelectorAll(axe._tree[0], '#fig1')[0];
				assert.equal(figureText(figure), '');
			});
		});
	});

	describe('tableCaptionText', function() {
		var tableCaptionText = nativeTextMethods.tableCaptionText;
		it('returns the table caption text', function() {
			fixtureSetup(
				'<table>' +
					'  <caption>My caption</caption>' +
					'  <tr><th>heading</th></tr>' +
					'  <tr><td>data</td></tr>' +
					'</table>'
			);
			var table = axe.utils.querySelectorAll(axe._tree[0], 'table')[0];
			assert.equal(tableCaptionText(table), 'My caption');
		});

		it('returns `` when there is no caption', function() {
			fixtureSetup(
				'<table>' +
					'  <tr><th>heading</th></tr>' +
					'  <tr><td>data</td></tr>' +
					'</table>'
			);
			var table = axe.utils.querySelectorAll(axe._tree[0], 'table')[0];
			assert.equal(tableCaptionText(table), '');
		});

		it('returns `` when if the caption is nested in another table', function() {
			fixtureSetup(
				'<table id="tbl1">' +
					'  <tr><td>' +
					'    <table>' +
					'      <caption>My caption</caption>' +
					'      <tr><th>heading</th></tr>' +
					'      <tr><td>data</td></tr>' +
					'    </table>' +
					'  </th></tr>' +
					'</table>'
			);
			var table = axe.utils.querySelectorAll(axe._tree[0], '#tbl1')[0];
			assert.equal(tableCaptionText(table), '');
		});
	});

	describe('fieldsetLegendText', function() {
		var fieldsetLegendText = nativeTextMethods.fieldsetLegendText;
		it('returns the legend text', function() {
			fixtureSetup(
				'<fieldset>' +
					'  <legend>My legend</legend>' +
					'  some content' +
					'</fieldset>'
			);
			var fieldset = axe.utils.querySelectorAll(axe._tree[0], 'fieldset')[0];
			assert.equal(fieldsetLegendText(fieldset), 'My legend');
		});

		it('returns `` when there is no legend', function() {
			var fieldsetLegendText = nativeTextMethods.fieldsetLegendText;
			it('returns the legend text', function() {
				fixtureSetup('<fieldset>' + '  some content' + '</fieldset>');
				var fieldset = axe.utils.querySelectorAll(axe._tree[0], 'fieldset')[0];
				assert.equal(fieldsetLegendText(fieldset), '');
			});
		});

		it('returns `` when if the legend is nested in another fieldset', function() {
			var fieldsetLegendText = nativeTextMethods.fieldsetLegendText;
			it('returns the legend text', function() {
				fixtureSetup(
					'<fieldset id="fig1">' +
						'  <fieldset>' +
						'    <legend>No legend</legend>' +
						'    some content' +
						'  </fieldset>' +
						'  some other content' +
						'</fieldset>'
				);
				var fieldset = axe.utils.querySelectorAll(axe._tree[0], '#fig1')[0];
				assert.equal(fieldsetLegendText(fieldset), '');
			});
		});
	});

	describe('titleText', function() {
		var __titleText;
		beforeEach(function() {
			__titleText = text.titleText;
		});
		afterEach(function() {
			text.titleText = __titleText;
		});
		it('returns the value from text.titleText', function() {
			text.titleText = function(arg1, arg2) {
				assert.equal(arg1, 'lilly');
				assert.equal(arg2, 'bob');
				return 'foo';
			};
			assert.equal(nativeTextMethods.titleText('lilly', 'bob'), 'foo');
		});
	});

	describe('subtreeText', function() {
		var __subtreeText;
		beforeEach(function() {
			__subtreeText = text.subtreeText;
		});
		afterEach(function() {
			text.subtreeText = __subtreeText;
		});
		it('returns the value from text.subtreeText', function() {
			text.subtreeText = function(arg1, arg2) {
				assert.equal(arg1, 'lilly');
				assert.equal(arg2, 'bob');
				return 'foo';
			};
			assert.equal(nativeTextMethods.subtreeText('lilly', 'bob'), 'foo');
		});
	});

	describe('labelText', function() {
		var __labelText;
		beforeEach(function() {
			__labelText = text.labelText;
		});
		afterEach(function() {
			text.labelText = __labelText;
		});
		it('returns the value from text.labelText', function() {
			text.labelText = function(arg1, arg2) {
				assert.equal(arg1, 'lilly');
				assert.equal(arg2, 'bob');
				return 'foo';
			};
			assert.equal(nativeTextMethods.labelText('lilly', 'bob'), 'foo');
		});
	});

	describe('singleSpace', function () {
		var singleSpace = nativeTextMethods.singleSpace;
		it('returns a single space', function() {
			assert.equal(singleSpace(), ' ');
		});
	})
});
