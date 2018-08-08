/*global Rule, Check, RuleResult, commons: true */
/*eslint no-unused-vars: 0*/
function getDefaultConfiguration(audit) {
	'use strict';
	var config;
	if (audit) {
		config = axe.utils.clone(audit);
		// Commons are configured into axe like everything else,
		// however because things go funky if we have multiple commons objects
		// we're not using the copy of that.
		config.commons = audit.commons;
	} else {
		config = {};
	}

	config.reporter = config.reporter || null;
	config.rules = config.rules || [];
	config.checks = config.checks || [];
	config.data = { checks: {}, rules: {}, ...config.data };
	return config;
}

function unpackToObject(collection, audit, method) {
	'use strict';

	var i, l;
	for (i = 0, l = collection.length; i < l; i++) {
		audit[method](collection[i]);
	}
}

/**
 * Constructor which holds configured rules and information about the document under test
 */
function Audit(audit) {
	// defaults
	this.brand = 'axe';
	this.application = 'axeAPI';
	this.tagExclude = ['experimental'];

	this.defaultConfig = audit;
	this._init();

	// A copy of the "default" locale. This will be set if the user
	// provides a new locale to `axe.configure()` and used to undo
	// changes in `axe.reset()`.
	this._defaultLocale = null;
}

/**
 * Build and set the previous locale. Will noop if a previous
 * locale was already set, as we want the ability to "reset"
 * to the default ("first") configuration.
 */

Audit.prototype._setDefaultLocale = function() {
	if (this._defaultLocale) {
		return;
	}

	const locale = {
		checks: {},
		rules: {}
	};

	// XXX: unable to use `for-of` here, as doing so would
	// require us to polyfill `Symbol`.
	const checkIDs = Object.keys(this.data.checks);
	for (let i = 0; i < checkIDs.length; i++) {
		const id = checkIDs[i];
		const check = this.data.checks[id];
		const { pass, fail, incomplete } = check.messages;
		locale.checks[id] = {
			pass,
			fail,
			incomplete
		};
	}

	const ruleIDs = Object.keys(this.data.rules);
	for (let i = 0; i < ruleIDs.length; i++) {
		const id = ruleIDs[i];
		const rule = this.data.rules[id];
		const { description, help } = rule;
		locale.rules[id] = { description, help };
	}

	this._defaultLocale = locale;
};

/**
 * Reset the locale to the "default".
 */

Audit.prototype._resetLocale = function() {
	// If the default locale has not already been set, we can exit early.
	const defaultLocale = this._defaultLocale;
	if (!defaultLocale) {
		return;
	}

	// Apply the default locale
	this.applyLocale(defaultLocale);
};

/**
 * Merge two check locales (a, b), favoring `b`.
 *
 * Both locale `a` and the returned shape resemble:
 *
 *    {
 *      impact: string,
 *      messages: {
 *        pass: string | function,
 *        fail: string | function,
 *        incomplete: string | {
 *          [key: string]: string | function
 *        }
 *      }
 *    }
 *
 * Locale `b` follows the `axe.CheckLocale` shape and resembles:
 *
 *    {
 *      pass: string,
 *      fail: string,
 *      incomplete: string | { [key: string]: string }
 *    }
 */

const mergeCheckLocale = (a, b) => {
	let { pass, fail } = b;
	// If the message(s) are Strings, they have not yet been run
	// thru doT (which will return a Function).
	if (typeof pass === 'string') {
		pass = axe.imports.doT.compile(pass);
	}
	if (typeof fail === 'string') {
		fail = axe.imports.doT.compile(fail);
	}
	return {
		...a,
		messages: {
			pass: pass || a.messages.pass,
			fail: fail || a.messages.fail,
			incomplete:
				typeof a.messages.incomplete === 'object'
					? // TODO: for compleness-sake, we should be running
					  // incomplete messages thru doT as well. This was
					  // out-of-scope for runtime localization, but should
					  // eventually be addressed.
					  { ...a.messages.incomplete, ...b.incomplete }
					: b.incomplete
		}
	};
};

/**
 * Merge two rule locales (a, b), favoring `b`.
 */

const mergeRuleLocale = (a, b) => {
	let { help, description } = b;
	// If the message(s) are Strings, they have not yet been run
	// thru doT (which will return a Function).
	if (typeof help === 'string') {
		help = axe.imports.doT.compile(help);
	}
	if (typeof description === 'string') {
		description = axe.imports.doT.compile(description);
	}
	return {
		...a,
		help: help || a.help,
		description: description || a.description
	};
};

/**
 * Apply locale for the given `checks`.
 */

Audit.prototype._applyCheckLocale = function(checks) {
	const keys = Object.keys(checks);
	for (let i = 0; i < keys.length; i++) {
		const id = keys[i];
		if (!this.data.checks[id]) {
			throw new Error(`Locale provided for unknown check: "${id}"`);
		}

		this.data.checks[id] = mergeCheckLocale(this.data.checks[id], checks[id]);
	}
};

/**
 * Apply locale for the given `rules`.
 */

Audit.prototype._applyRuleLocale = function(rules) {
	const keys = Object.keys(rules);
	for (let i = 0; i < keys.length; i++) {
		const id = keys[i];
		if (!this.data.rules[id]) {
			throw new Error(`Locale provided for unknown rule: "${id}"`);
		}
		this.data.rules[id] = mergeRuleLocale(this.data.rules[id], rules[id]);
	}
};

/**
 * Apply the given `locale`.
 *
 * @param {axe.Locale}
 */

Audit.prototype.applyLocale = function(locale) {
	this._setDefaultLocale();

	if (locale.checks) {
		this._applyCheckLocale(locale.checks);
	}

	if (locale.rules) {
		this._applyRuleLocale(locale.rules);
	}
};

/**
 * Initializes the rules and checks
 */
Audit.prototype._init = function() {
	var audit = getDefaultConfiguration(this.defaultConfig);

	axe.commons = commons = audit.commons;

	this.reporter = audit.reporter;
	this.commands = {};
	this.rules = [];
	this.checks = {};

	unpackToObject(audit.rules, this, 'addRule');
	unpackToObject(audit.checks, this, 'addCheck');

	this.data = {};
	this.data.checks = (audit.data && audit.data.checks) || {};
	this.data.rules = (audit.data && audit.data.rules) || {};
	this.data.failureSummaries =
		(audit.data && audit.data.failureSummaries) || {};
	this.data.incompleteFallbackMessage =
		(audit.data && audit.data.incompleteFallbackMessage) || '';

	this._constructHelpUrls(); // create default helpUrls
};

/**
 * Adds a new command to the audit
 */

Audit.prototype.registerCommand = function(command) {
	'use strict';
	this.commands[command.id] = command.callback;
};

/**
 * Adds a new rule to the Audit.  If a rule with specified ID already exists, it will be overridden
 * @param {Object} spec Rule specification object
 */
Audit.prototype.addRule = function(spec) {
	'use strict';

	if (spec.metadata) {
		this.data.rules[spec.id] = spec.metadata;
	}

	let rule = this.getRule(spec.id);
	if (rule) {
		rule.configure(spec);
	} else {
		this.rules.push(new Rule(spec, this));
	}
};

/**
 * Adds a new check to the Audit.  If a Check with specified ID already exists, it will be
 * reconfigured
 *
 * @param {Object} spec Check specification object
 */
Audit.prototype.addCheck = function(spec) {
	/*eslint no-eval: 0 */
	'use strict';
	let metadata = spec.metadata;

	if (typeof metadata === 'object') {
		this.data.checks[spec.id] = metadata;
		// Transform messages into functions:
		if (typeof metadata.messages === 'object') {
			Object.keys(metadata.messages)
				.filter(
					prop =>
						metadata.messages.hasOwnProperty(prop) &&
						typeof metadata.messages[prop] === 'string'
				)
				.forEach(prop => {
					if (metadata.messages[prop].indexOf('function') === 0) {
						metadata.messages[prop] = new Function(
							'return ' + metadata.messages[prop] + ';'
						)();
					}
				});
		}
	}

	if (this.checks[spec.id]) {
		this.checks[spec.id].configure(spec);
	} else {
		this.checks[spec.id] = new Check(spec);
	}
};

/**
 * Runs the Audit; which in turn should call `run` on each rule.
 * @async
 * @param  {Context}   context The scope definition/context for analysis (include/exclude)
 * @param  {Object}    options Options object to pass into rules and/or disable rules or checks
 * @param  {Function} fn       Callback function to fire when audit is complete
 */
Audit.prototype.run = function(context, options, resolve, reject) {
	'use strict';
	this.normalizeOptions(options);

	axe._selectCache = [];
	var q = axe.utils.queue();
	this.rules.forEach(function(rule) {
		if (axe.utils.ruleShouldRun(rule, context, options)) {
			if (options.performanceTimer) {
				var markEnd = 'mark_rule_end_' + rule.id;
				var markStart = 'mark_rule_start_' + rule.id;
				axe.utils.performanceTimer.mark(markStart);
			}
			q.defer(function(res, rej) {
				rule.run(
					context,
					options,
					function(out) {
						if (options.performanceTimer) {
							axe.utils.performanceTimer.mark(markEnd);
							axe.utils.performanceTimer.measure(
								'rule_' + rule.id,
								markStart,
								markEnd
							);
						}
						res(out);
					},
					function(err) {
						if (!options.debug) {
							var errResult = Object.assign(new RuleResult(rule), {
								result: axe.constants.CANTTELL,
								description: 'An error occured while running this rule',
								message: err.message,
								stack: err.stack,
								error: err
							});
							res(errResult);
						} else {
							rej(err);
						}
					}
				);
			});
		}
	});
	q.then(function(results) {
		axe._selectCache = undefined; // remove the cache
		resolve(
			results.filter(function(result) {
				return !!result;
			})
		);
	}).catch(reject);
};

/**
 * Runs Rule `after` post processing functions
 * @param  {Array} results  Array of RuleResults to postprocess
 * @param  {Mixed} options  Options object to pass into rules and/or disable rules or checks
 */
Audit.prototype.after = function(results, options) {
	'use strict';

	var rules = this.rules;

	return results.map(function(ruleResult) {
		var rule = axe.utils.findBy(rules, 'id', ruleResult.id);
		if (!rule) {
			// If you see this, you're probably running the Mocha tests with the aXe extension installed
			throw new Error(
				'Result for unknown rule. You may be running mismatch aXe-core versions'
			);
		}

		return rule.after(ruleResult, options);
	});
};

/**
 * Get the rule with a given ID
 * @param  {string}
 * @return {Rule}
 */
Audit.prototype.getRule = function(ruleId) {
	return this.rules.find(rule => rule.id === ruleId);
};

/**
 * Ensure all rules that are expected to run exist
 * @throws {Error} If any tag or rule specified in options is unknown
 * @param  {Object} options  Options object
 * @return {Object}          Validated options object
 */
Audit.prototype.normalizeOptions = function(options) {
	/* eslint max-statements: ["error", 22] */
	'use strict';
	var audit = this;

	// Validate runOnly
	if (typeof options.runOnly === 'object') {
		if (Array.isArray(options.runOnly)) {
			options.runOnly = {
				type: 'tag',
				values: options.runOnly
			};
		}
		const only = options.runOnly;
		if (only.value && !only.values) {
			only.values = only.value;
			delete only.value;
		}

		if (!Array.isArray(only.values) || only.values.length === 0) {
			throw new Error('runOnly.values must be a non-empty array');
		}

		// Check if every value in options.runOnly is a known rule ID
		if (['rule', 'rules'].includes(only.type)) {
			only.type = 'rule';
			only.values.forEach(function(ruleId) {
				if (!audit.getRule(ruleId)) {
					throw new Error('unknown rule `' + ruleId + '` in options.runOnly');
				}
			});

			// Validate 'tags' (e.g. anything not 'rule')
		} else if (['tag', 'tags', undefined].includes(only.type)) {
			only.type = 'tag';
			const unmatchedTags = audit.rules.reduce((unmatchedTags, rule) => {
				return unmatchedTags.length
					? unmatchedTags.filter(tag => !rule.tags.includes(tag))
					: unmatchedTags;
			}, only.values);

			if (unmatchedTags.length !== 0) {
				throw new Error(
					'Could not find tags `' + unmatchedTags.join('`, `') + '`'
				);
			}
		} else {
			throw new Error(`Unknown runOnly type '${only.type}'`);
		}
	}

	if (typeof options.rules === 'object') {
		Object.keys(options.rules).forEach(function(ruleId) {
			if (!audit.getRule(ruleId)) {
				throw new Error('unknown rule `' + ruleId + '` in options.rules');
			}
		});
	}

	return options;
};

/*
 * Updates the default options and then applies them
 * @param  {Mixed} options  Options object
 */

Audit.prototype.setBranding = function(branding) {
	'use strict';
	let previous = {
		brand: this.brand,
		application: this.application
	};
	if (
		branding &&
		branding.hasOwnProperty('brand') &&
		branding.brand &&
		typeof branding.brand === 'string'
	) {
		this.brand = branding.brand;
	}
	if (
		branding &&
		branding.hasOwnProperty('application') &&
		branding.application &&
		typeof branding.application === 'string'
	) {
		this.application = branding.application;
	}
	this._constructHelpUrls(previous);
};

/**
 * For all the rules, create the helpUrl and add it to the data for that rule
 */
function getHelpUrl({ brand, application }, ruleId, version) {
	return (
		axe.constants.helpUrlBase +
		brand +
		'/' +
		(version || axe.version.substring(0, axe.version.lastIndexOf('.'))) +
		'/' +
		ruleId +
		'?application=' +
		application
	);
}

Audit.prototype._constructHelpUrls = function(previous = null) {
	var version = (axe.version.match(/^[1-9][0-9]*\.[0-9]+/) || ['x.y'])[0];
	this.rules.forEach(rule => {
		if (!this.data.rules[rule.id]) {
			this.data.rules[rule.id] = {};
		}
		let metaData = this.data.rules[rule.id];
		if (
			typeof metaData.helpUrl !== 'string' ||
			(previous && metaData.helpUrl === getHelpUrl(previous, rule.id, version))
		) {
			metaData.helpUrl = getHelpUrl(this, rule.id, version);
		}
	});
};

/**
 * Reset the default rules, checks and meta data
 */

Audit.prototype.resetRulesAndChecks = function() {
	'use strict';
	this._init();
	this._resetLocale();
};
