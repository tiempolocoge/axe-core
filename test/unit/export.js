describe('export', function () {
	'use strict';

	it('should publish a global `dqre` variable', function () {
		assert.isDefined(window.global.dqre);
	});
	it('should define version', function () {
		assert.equal(dqre.version, 'dev');
	});
});