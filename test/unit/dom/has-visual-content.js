describe('dom.hasVisualContent', function () {
	'use strict';

	var fixture = document.getElementById('fixture');

	afterEach(function () {
		document.getElementById('fixture').innerHTML = '';
	});

	describe('hasVisualContent', function () {
		it('should return true for img', function () {
			fixture.innerHTML = '<img src="something.jpg">';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return true for iframe', function () {
			fixture.innerHTML = '<iframe src="something.html"></iframe>';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return true for object', function () {
			fixture.innerHTML = '<object data="something.swf"></object>';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return true for video', function () {
			fixture.innerHTML = '<video src="something.mp4"></video>';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return true for audio', function () {
			fixture.innerHTML = '<audio src="something.mp3"></audio>';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return true for canvas', function () {
			fixture.innerHTML = '<canvas></canvas>';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return true for svg', function () {
			fixture.innerHTML = '<svg></svg>';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return true for math', function () {
			fixture.innerHTML = '<math></math>';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return true for button', function () {
			fixture.innerHTML = '<button></button>';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return true for select', function () {
			fixture.innerHTML = '<select></select>';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return true for textarea', function () {
			fixture.innerHTML = '<textarea></textarea>';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return true for keygen', function () {
			fixture.innerHTML = '<keygen>';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return true for progress', function () {
			fixture.innerHTML = '<progress></progress>';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return true for meter', function () {
			fixture.innerHTML = '<meter></meter>';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return true for non-hidden input', function () {
			fixture.innerHTML = '<input type="text">';
			assert.isTrue(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return false for hidden input', function () {
			fixture.innerHTML = '<input type="hidden">';
			assert.isFalse(kslib.dom.hasVisualContent(fixture.children[0]));
		});

		it('should return false for p', function () {
			fixture.innerHTML = '<p>Paragraph!</p>';
			assert.isFalse(kslib.dom.hasVisualContent(fixture.children[0]));
		});

	});
});
