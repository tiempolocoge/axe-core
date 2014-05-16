/*global felib*/
(function (global) {
	'use strict';

	var checks = {};
	checks['aria-label'] = {
		help: 'no aria-label attribute',
		evaluate: function (node) {
			var label = node.getAttribute('aria-label');
			return !!label;
		}
	};

	checks['aria-labelledby'] = {
		help: 'no aria-labelledby attribute',
		evaluate: function (node) {
			var result = felib.dom.idrefs(node, 'aria-labelledby');
			return result.indexOf(null) === -1 && !!result.length;
		}
	};

	checks['implicit-label'] = {
		help: 'no implicit label',
		evaluate: function (node) {
			var label = felib.dom.findUp(node, 'label');
			return label !== null;
		}
	};

	checks['explicit-label'] = {
		help: 'no explicit label',
		selector: '[id]',
		evaluate: function (node) {
			var label = document.querySelector('label[for="' + node.id + '"]');
			return label !== null;
		}
	};

	checks['aria-hidden'] = {
		help: 'element is visible to a screen reader',
		evaluate: function (node) {
			var result = false;
			if (node.getAttribute('aria-hidden') === 'true') {
				result = true;
			} else {
				result = felib.dom.findUp(node, '[aria-hidden="true"]') !== null;
			}

			return result;
		}
	};

	checks.hidden = {
		help: 'element is visible',
		evaluate: function (node) {
			return felib.dom.isVisible(node, true);
		}
	};

	checks['title-only'] = {
		help: 'element has only a title attribute',
		result: 'WARN',
		evaluate: function (node) {
			var labelText = felib.getLabelText(node);
			return !labelText && (node.getAttribute('title') || node.getAttribute('aria-describedby'));
		}
	};

	checks['help-same-as-label'] = {
		help: 'the hint text is the same as the label text',
		result: 'WARN',
		evaluate: function (node) {
			var labelText = felib.getLabelText(node),
				check = node.getAttribute('title');
			if (!labelText) {
				return false;
			}

			if (!check) {

				if (node.getAttribute('aria-describedby')) {
					var ref = felib.dom.idrefs(node, 'aria-describedby');
					check = ref.map(function (thing) {
						return thing ? felib.text.visible(thing, true) : '';
					}).join('');
				}
			}

			return felib.text.sanitize(check) === felib.text.sanitize(labelText);
		}
	};

	checks['img-has-alt'] = {
		help: 'Image has no alt attribute',
		selector: 'img',
		evaluate: function (node) {
			return node.hasAttribute('alt');
		}
	};

	checks['input-img-has-alt'] = {
		help: 'Input of type image has no alt attribute',
		selector: 'input[type="image"]',
		evaluate: function (node) {
			return !!node.getAttribute('alt');
		}
	};

	checks['img-role-presentation'] = {
		help: 'The image is not marked as presentational',
		selector: 'img',
		evaluate: function (node) {
			return node.getAttribute('role') === 'presentation';
		}
	};

	checks['has-lang'] = {
		help: 'the document is missing a lang attribute',
		selector: 'html',
		evaluate: function (node) {
			return !!node.lang;
		}
	};

	checks['lang-not-en'] = {
		help: 'the lang attribute is not "en"',
		selector: '[lang]',
		evaluate: function (node) {
			return node.lang !== 'en';
		}
	};

	checks['has-title'] = {
		help: 'the document does not have a title attribute',
		selector: 'html',
		evaluate: function (node) {
			return !!node.ownerDocument.title;
		}
	};

	checks.deprecated = {
		help: 'the element is deprecated',
		result: 'FAIL',
		evaluate: function () {
			return true;
		}
	};

	checks['input-button-value'] = {
		help: 'idk',
		selector: 'input[type="button"]',
		evaluate: function (node) {
			return node.getAttribute('value');
		}
	};

	checks['button-text'] = {
		help: 'the button does not have a name',
		selector: 'button, [role="button"]',
		evaluate: function (node) {
			var txt = felib.text.visible(node, true);
			return txt.length > 0;
		}
	};

	checks.landmarks = {
		help: 'there is either no main role or too many main roles on the page',
		selector: '[role]',
		evaluate: function (node) {
			var role = node.getAttribute('role').toLowerCase().trim(),
				nodeData;
			if (role === 'search' || role === 'main' || role === 'contentinfo' || role === 'banner'
				|| role === 'region' || role === 'complementary' || role === 'form' || role === 'navigation' ||
				role === 'application') {
				nodeData = dqre.DqNode(node);
				nodeData.role = role;
				this.data(nodeData);
			}
		},
		after: function (data) {
			var found = false,
				toomany = false;
			// must have one and only one main role
			data.forEach(function(node) {
				if (node.role === 'main') {
					if (found) {
						toomany = true;
					} else {
						found = true;
					}
				}
			});
			if (!found || toomany) {
				return false;
			}
			return true;
		}
	};
	checks.skipnav = {
		selector: 'body',
		evaluate: function (node) {
			var anchor, nodeData, target;
			if (node.ownerDocument.defaultView === window.top) {
				anchor = node.querySelector('a');
				if (anchor) {
					nodeData = dqre.DqNode(anchor);
					nodeData.href = anchor.getAttribute('href').trim();
					if (nodeData.href.length > 1 && nodeData.href[0] === '#') {
						target = node.querySelector(nodeData.href);
						nodeData.target = dqre.DqNode(target);
						if (target.nodeName.toLowerCase().match(/(?:button|input|object|select|textarea)/) ||
							target.tabIndex === '0') {
							nodeData.target.focussable = true;
						}
					}
					this.data(nodeData);
				}
				if (nodeData && nodeData.target && nodeData.focussable) {
					return true;
				}
				return false;
			}
		},
		help: 'there is no skip navigation link at the very top of the page',
		after: function (data) {
			var that = this;
			console.log('skipnav: ', data);
			data &&
			data.forEach(function(nodeData) {
				that.data(nodeData);
				if (nodeData.target && nodeData.target.focussable) {
					return true;
				}
			});
			return false;
		}
	};
	checks.headings = {
		selector: 'h1,h2,h3,h4,h5,h6,[role="heading"]',
		evaluate: function (node) {
			var nodeData,
				role = node.getAttribute('role'),
				level = node.getAttribute('aria-level');
			if ((role === 'heading' && level) || !role) {
				if (!role) {
					level = parseInt(node.nodeName.substring(1), 10);
				} else {
					level = parseInt(level, 10);
				}
				nodeData = dqre.DqNode(node);
				nodeData.level = level;
				this.data(nodeData);
			}
		},
		help: 'there are no headings on the page',
		after: function (data) {
			// must be at least one heading
			if (!data.length) {
				return false;
			}
			return true;
		}
	};

	var rules = [{
			id: 'gimmeLabel',
			help: 'Input fields must contain a label that is programatically associated with the element and is visible',
			selector: 'input:not([type="hidden"]):not([type="image"]):not([type="button"]):not([type="submit"]):not([type="reset"]), select, textarea',
			checks: ['aria-label', 'aria-labelledby', 'implicit-label', 'explicit-label', 'aria-hidden',
				'title-only', 'help-same-as-label']
		}, {
			id: 'altAttribute',
			help: 'Images must always contain an alt attribute. If the image is decorational, the alt can be empty',
			selector: 'img, input[type="image"]',
			checks: ['img-has-alt', 'input-img-has-alt', 'img-role-presentation']
		}, {
			id: 'docLanguage',
			help: 'All documents, including frames and iframes, must contain a lang attribute with the valid value',
			selector: 'html',
			checks: ['has-lang', 'lang-not-en']
		}, {
			id: 'docTitle',
			help: 'All documents, including frames and iframes, must contain a title attribute',
			selector: 'html',
			checks: ['has-title']
		}, {
			id: 'idkStuff',
			help: 'IDK, stuff',
			selector: 'input[type="button"], button, [role="button"]',
			checks: ['input-button-value', 'button-text', 'aria-label', 'aria-labelledby']
		}, {
			id: 'blinky',
			help: 'The blink tag is deprecated, donot use it',
			selector: 'blink',
			checks: ['deprecated']
		}, {
			id: 'bypass',
			help: 'Use headings, landmarks and/or skip links to allow keyboard-only users to efficiently navigate the page',
			type: 'PAGE',
			checks: ['landmarks', 'skipnav', 'headings']
		}];

	global.mockRules = rules.map(function (rule) {
		rule.checks = rule.checks.map(function (check) {
			if (!checks[check]) {
				throw new Error('check ' + check + ' not found');
			}
			checks[check].id = check;
			return checks[check];
		});

		return rule;
	});

	global.mockMessages = {};
	function getRuleHelpMessages() {
		var retVal = {}, i;
		for (i = rules.length; i--;) {
			retVal[rules[i].id] = rules[i].help;
		}
		return retVal;
	}
	global.mockMessages.ruleHelp = getRuleHelpMessages();
	function getCheckHelpMessages() {
		var retVal = {},
			checkId;
		// jshint forin: false
		for (checkId in checks) {
			if (checks.hasOwnProperty(checkId)) {
				retVal[checkId] = checks[checkId].help;
			}
		}
		return retVal;
	}
	global.mockMessages.checkHelp = getCheckHelpMessages();

	global.mockAudit = {
		id: 'wcag2aa',
		rules: global.mockRules,
		messages: global.mockMessages
	};

}(this));