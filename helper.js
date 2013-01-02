
;(function(window) {
	"use strict";
	var undefined;
	var document = window.document;
	var location = window.location;
	var navigator = window.navigator;
	var boundEventHandlers = [];
	var ajaxSettings;
	var defaultAjaxSettings = {
		async: true,
		data: null,
		method: "GET",
		onerror: null,
		onsuccess: null,
		timeout: 0,
		url: location.href
	};

	function Selection(selector) {
		this.matches = (function() {
			var selectorType = $.typeOf(selector);
			var matches = [];

			if (selectorType === "string") {
				var nodeList = document.querySelectorAll(selector);

				// Convert the NodeList to an Array
				// This probably doesn't need to be done, but it will keep the type of "matches" consistent
				for (var i = 0, len = nodeList.length; i < len; i++ ) {
					matches[i] = nodeList[i];
				}
			} else if (selectorType === "object") {
				matches[0] = selector;
			}

			return matches;
		})();

		this.length = this.matches.length;

		this.array = function() {
			return this.matches;
		};

		this.forEach = function(fn, thisArg) {
			var matches = this.matches;

			for (var i = 0, len = matches.length; i < len; i++) {
				var match = matches[i];
				var self = ($.defined(thisArg)) ? thisArg : match;

				$.bind(fn, self)(match, i, matches);
			}
		};

		this.addEventListener = function(event, handler) {
			var matches = this.matches;
			var len = matches.length;

			for (var i = 0; i < len; i++) {
				$.addEventListener(matches[i], event, handler);
			}

			return this;
		};

		this.css = function(arg1, arg2) {
			var matches = this.matches;
			var len = matches.length;

			if (len > 0) {
				if ($.typeOf(arg1) === "object") {
					for (var i = 0; i < len; i++) {
						for (var key in arg1) {
							$.setCss(matches[i], key, arg1[key]);
						}
					}
				} else if (arg2) {
					for (var i = 0; i < len; i++) {
						$.setCss(matches[i], arg1, arg2);
					}
				} else {
					return $.getCss(matches[0], arg1);
				}
			}

			return this;
		};

		this.addClass = function(arg) {
			var matches = this.matches;
			var classes = arg.split(" ");

			for (var i = 0, len = matches.length; i < len; i++) {
				for (var j = 0, l = classes.length; j < l; j++ ) {
					$.addClass(matches[i], classes[j]);
				}
			}

			return this;
		};

		this.removeClass = function(arg) {
			var matches = this.matches;
			var classes = arg.split(" ");

			for (var i = 0, len = matches.length; i < len; i++) {
				for (var j = 0, l = classes.length; j < l; j++ ) {
					$.removeClass(matches[i], classes[j]);
				}
			}

			return this;
		};

		this.isClass = function(arg) {
			var matches = this.matches;
			var classes = arg.split(" ");

			for (var i = 0, len = matches.length; i < len; i++) {
				for (var j = 0, l = classes.length; j < l; j++ ) {
					if (!$.isClass(matches[i], classes[j]))
						return false;
				}
			}

			return true;
		};

		this.toggleClass = function(arg) {
			var matches = this.matches;
			var classes = arg.split(" ");

			for (var i = 0, len = matches.length; i < len; i++) {
				for (var j = 0, l = classes.length; j < l; j++ ) {
					$.toggleClass(matches[i], classes[j]);
				}
			}

			return this;
		};

		this.text = function(newText) {
			var matches = this.matches;
			var len = matches.length;
			var txt = "";

			if (len > 0) {
				if ($.defined(newText)) {
					$.setText(matches[0], newText);
				} else {
					for (var i = 0; i < len; i++) {
						txt += $.getText(matches[i]) + " ";
					}

					return txt;
				}
			}

			return this;
		};

		this.html = function(newHtml) {
			var match = this.matches[0];

			if (match) {
				if ($.defined(newHtml)) {
					$.setHtml(match, newHtml);
				} else {
					return $.getHtml(match);
				}
			}

			return this;
		};

		this.append = function(html) {
			var match = this.matches[0];

			if (match)
				$.append(match, html);

			return this;
		};

		this.show = function() {
			var matches = this.matches;

			for (var i = 0, len = matches.length; i < len; i++)
				$.show(matches[i]);

			return this;
		};

		this.hide = function() {
			var matches = this.matches;

			for (var i = 0, len = matches.length; i < len; i++)
				$.hide(matches[i]);

			return this;
		};

		this.position = function() {
			var match = this.matches[0];

			if (match)
				return $.getPosition(match);
			else
				return null;
		};

		this.gradient = function(parameters) {
			var matches = this.matches;

			for (var i = 0, len = matches.length; i < len; i++)
				$.filter.gradient(matches[i], parameters);

			return this;
		};

		this.rotate = function(degrees) {
			var matches = this.matches;

			for (var i = 0, len = matches.length; i < len; i++)
				$.filter.rotate(matches[i], degrees);

			return this;
		};

		this.scale = function(percent) {
			var matches = this.matches;

			for (var i = 0, len = matches.length; i < len; i++)
				$.filter.scale(matches[i], percent);

			return this;
		};

		this.opacity = function(percent) {
			var matches = this.matches;

			for (var i = 0, len = matches.length; i < len; i++)
				$.filter.opacity(matches[i], percent);

			return this;
		};
	}

	var $ = function(selector) {
		return new Selection(selector);
	};

	// Methods for working with DOM nodes

	$.id = function(identifier) {
		return document.getElementById(identifier);
	};

	$.select = function(selector) {
		return document.querySelector(selector);
	};

	$.selectAll = function(selector) {
		return document.querySelectorAll(selector);
	};

	$.addClass = function(node, className) {
		node.className = node.className + " " + className;
	};

	$.removeClass = function(node, className) {
		node.className = node.className.replace(new RegExp("(\\s+|^)" + className + "(\\s+|$)", "gi"), " ");
	};

	$.isClass = function(node, className) {
		return (new RegExp("(\\s+|^)" + className + "(\\s+|$)", "gi")).test(node.className);
	};

	$.toggleClass = function(node, className) {
		if ($.isClass(node, className))
			$.removeClass(node, className);
		else
			$.addClass(node, className);
	};

	$.setText = function(node, text) {
		if ($.defined(node.textContent))
			node.textContent = text;
		else
			node.innerText = text;
	};

	$.getText = function(node) {
		return node.textContent || node.innerText;
	};

	$.setHtml = function(node, html) {
		node.innerHTML = html;
	};

	$.getHtml = function(node) {
		return node.innerHTML;
	};

	$.append = function(node, html) {
		node.innerHTML += html;
	};

	$.setCss = function(node, property, value) {
		node.style[cssToCamelCase(property)] = value;
	};

	$.getCss = function(node, property) {
		return node.style[cssToCamelCase(property)];
	};

	$.hide = function(node) {
		$.setCss(node, "display", "none");
	};

	$.show = function(node) {
		$.setCss(node, "display", "");
	};

	$.getPosition = function(node) {
		var top;
		var left;

		for (top = 0, left = 0; node !== null; node = node.offsetParent) {
			top += node.offsetTop;
			left += node.offsetLeft;
		}

		return {
			top: top,
			left: left
		};
	};

	// Methods for working with functions

	$.bind = function(fn, thisArg) {
		return function() {
			fn.apply(thisArg, Array.prototype.slice.call(arguments));
		};
	};

	// Methods for working with events

	$.addEventListener = function(node, event, handler) {
		var boundHandler = $.bind(handler, node);

		if (node.addEventListener)
			node.addEventListener(event, boundHandler, false);
		else
			node.attachEvent("on" + event, boundHandler);

		addBoundEventHandler(node, event, handler, boundHandler);
	};

	$.removeEventListener = function(node, event, handler) {
		var obj = getBoundEventHandler(node, event, handler);

		if (!obj)
			return;

		if (node.removeEventListener)
			node.removeEventListener(event, obj.bound, false);
		else
			node.detachEvent("on" + event, obj.bound);

		// TODO:  splice() object out of array
	};

	/*** These versions of addEventListener() and removeEventListener()
	**** don't bind "this", which is needed for IE8
	$.addEventListener = function(node, event, handler) {
		if (node.addEventListener)
			node.addEventListener(event, handler, false);
		else
			node.attachEvent("on" + event, handler);

	};

	$.removeEventListener = function(node, event, handler) {
		if (node.removeEventListener)
			node.removeEventListener(event, handler, false);
		else
			node.detachEvent("on" + event, handler);
	};
	****
	****/

	$.DOMContentLoaded = function(handler) {
		if (document.readyState === "complete")
			setTimeout(handler, 0);
		else if (document.addEventListener)
			document.addEventListener("DOMContentLoaded", handler, false);
		else if (document.attachEvent)
			document.attachEvent("onreadystatechange", function() {
				if (document.readyState === "complete")
					handler();
			});
		else
			$.addEventListener(window, "load", handler);
	};

	// Methods for determining values and data types

	$.instanceOf = function (variable) {
		var re = /\[object (\S+)\]/g;
		var type = $.typeOf(variable);
		var matches;

		if (type === "object") {
			matches = re.exec(Object.prototype.toString.call(variable));

			if (matches && matches.length > 1)
				type = matches[1];
		}

		return type;
	};

	$.isArray = Array.isArray || function(variable) {
		return Object.prototype.toString.call(variable) === "[object Array]";
	};

	$.defined = function(variable) {
		return $.typeOf(variable) !== "undefined";
	};

	$.typeOf = function(variable) {
		var type = typeof(variable);

		if (type === "object") {
			if (variable === null) {
				return "null";
			} else if ($.isArray(variable)) {
				return "array";
			} else {
				return "object";
			}
		} else {
			return type;
		}
	};

	$.toBoolean = function(variable) {
		return !!variable;
	};

	$.toString = function(variable) {
		return variable + "";
	};

	$.toNumber = function(variable) {
		return +variable;
	};

	$.radians = function(degrees) {
		return degrees * (Math.PI / 180);
	};

	$.degrees = function(radians) {
		return radians * (180 / Math.PI);
	};

	$.isNegativeZero = function(number) {
		return (number !== 0) ? false : (1 / number === -Infinity);
	};

	// Shortcuts for feature detection

	$.support = (function() {
		var support = {};

		support.ServerSentEvents = !!window.EventSource;
		support.WebSockets = "WebSocket" in window;
		support.WebWorkers = !!window.Worker;

		try {
			support.WebStorage = ("localStorage" in window && window["localStorage"] !== null);
		} catch (e) {
			support.WebStorage = false;
		}

		return support;
	})();

	// AJAX/JSONP methods
	$.xhr = function() {
		return new window.XMLHttpRequest;
	};

	$.getDefaultAjaxSettings = function() {
		var copy = {};

		for (var key in defaultAjaxSettings) {
			copy[key] = defaultAjaxSettings[key];
		}

		return copy;
	};

	($.restoreDefaultAjaxSettings = function() {
		ajaxSettings = $.getDefaultAjaxSettings();
		return ajaxSettings;
	})();	// call here to initialize ajaxSettings

	$.getAjaxSettings = function() {
		return ajaxSettings;
	};

	$.setAjaxSettings = function(settings) {
		if ($.typeOf(settings) === "object") {
			for (var key in settings) {
				ajaxSettings[key] = settings[key];
			}
		}

		return ajaxSettings;
	};

	$.ajax = function(arg) {
		var argType = $.typeOf(arg);
		var xhr = $.xhr();
		var settings = {};
		var xhrTimeout;
		var success;
		var successType;
		var error;
		var errorType;

		for (var key in ajaxSettings) {
			settings[key] = ajaxSettings[key];
		}

		if (argType === "object") {
			for (var key in arg) {
				settings[key] = arg[key];
			}
		} else if (argType === "string") {
			settings.url = arg;
		}

		success = settings.onsuccess;
		successType = $.typeOf(success);
		error = settings.onerror;
		errorType = $.typeOf(error);
		xhr.open(settings.method, settings.url, settings.async, settings.username, settings.password);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhrTimeout)
					clearTimeout(xhrTimeout);

				if (xhr.status === 200) {
					if (successType === "function")
						success(xhr.responseText, xhr);
					else if (successType === "array") {
						for (var i = 0, len = success.length; i < len; i++)
							success[i](xhr.responseText, xhr);
					}
				} else {
					if (errorType === "function")
						error(xhr.status, xhr);
				}

			}
		};

		if (settings.data)
			xhr.send(settings.data);
		else
			xhr.send();

		if (settings.timeout > 0) {
			xhrTimeout = setTimeout(function() {
				xhr.abort();
			}, settings.timeout);
		}

		return xhr;
	};

	$.jsonp = function(url) {
		var head = document.head;
		var script = document.createElement("script");

		script.setAttribute("src", url);
		head.appendChild(script);
		head.removeChild(script);
	};

	// Shortcuts for visual filters

	$.filter = (function() {
		var filters = {};

		filters.gradient = function(node, params) {
			var style = node.style;
			var grad = "";
			var filter = "";
			var start = "top";
			var first = "#ffffff";
			var last = "#000000";
			params = params || {};
			var startParam = params.start;
			var colors = params.colors;
			var percentages = params.percentages;

			if (startParam === "top" || startParam === "bottom" || startParam === "left" || startParam === "right")
				start = startParam;

			grad += start;

			if ($.isArray(colors) && $.isArray(percentages) && colors.length === percentages.length) {
				for (var i = 0, len = colors.length; i < len; i++) {
					var color = colors[i];
					var percent = percentages[i];

					if (i === 0)
						first = color;
					else if (i === len - 1)
						last = color;

					grad += ", " + color + " " + percent + "%";
				}
			} else {
				grad += ", " + first + " 0%, " + last + " 100%";
			}

			if (style) {
				style.background = first;

				try {
					if (start === "top")
						filter += "GradientType=0, startColorstr='" + first + "', endColorstr='" + last + "'";
					else if (start === "bottom")
						filter += "GradientType=0, startColorstr='" + last + "', endColorstr='" + first + "'";
					else if (start === "left")
						filter += "GradientType=1, startColorstr='" + first + "', endColorstr='" + last + "'";
					else if (start === "right")
						filter += "GradientType=1, startColorstr='" + last + "', endColorstr='" + first + "'";

					style.filter = "progid:DXImageTransform.Microsoft.gradient(" + filter + ") " + style.filter;
					style.background = "-webkit-linear-gradient(" + grad + ")";
					style.background = "-moz-linear-gradient(" + grad + ")";
					style.background = "-o-linear-gradient(" + grad + ")";
					style.background = "-ms-linear-gradient(" + grad + ")";
					style.background = "linear-gradient(" + grad + ")";	
				} catch (e) {
				}
			}
		};

		filters.opacity = function(node, opac) {
			var style = node.style;

			if (style) {
				style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + parseInt(opac * 100) + ") " + style.filter;
				style.opacity = opac;
			}
		};

		filters.rotate = function(node, deg) {
			var style = node.style;
			var radians = $.radians(deg);
			var sin = Math.sin(radians);
			var cos = Math.cos(radians);

			if (style) {
				style.webkitTransform = "rotate(" + deg + "deg) " + style.webkitTransform;
				style.MozTransform = "rotate(" + deg + "deg) " + style.MozTransform;
				style.OTransform = "rotate(" + deg + "deg) " + style.OTransform;
				style.filter = "progid:DXImageTransform.Microsoft.Matrix(SizingMethod='auto expand', M11=" + cos + ", M12=" + (-sin) + ", M21=" + sin + ", M22=" + cos + ") " + style.filter;
				style.transform = "rotate(" + deg + "deg) " + style.transform;
			}
		};

		filters.scale = function(node, percent) {
			var style = node.style;

			if (style) {
				style.webkitTransform = "scale(" + percent + ") " + style.webkitTransform;
				style.MozTransform = "scale(" + percent + ") " + style.MozTransform;
				style.OTransform = "scale(" + percent + ") " + style.OTransform;
				style.filter = "progid:DXImageTransform.Microsoft.Matrix(SizingMethod='auto expand', M11=" + percent + ", M12=0, M21=0, M22=" + percent + ") " + style.filter;
				style.transform = "scale(" + percent + ") " + style.transform;
			}
		};

		return filters;
	})();

	// Misc.
	$.injectScript = function(url) {
		var script = document.createElement("script");

		script.setAttribute("src", url);
		document.head.appendChild(script);
		return script;
	};

	$.parseXml = function(xmlString) {
		var xml = null;

		if (window.DOMParser) {
			xml = (new DOMParser()).parseFromString(xmlString, "text/xml");
		} else if (window.ActiveXObject) {
			xml = new ActiveXObject("Microsoft.XMLDOM");
			xml.async = false;
			xml.loadXML(xmlString);
		}

		return xml;
	}

	// Private Methods

	function cssToCamelCase(string) {
		return string.replace(/-([a-z])/gi, function(string, group) {
			return group.toUpperCase();
		});
	};

	function addBoundEventHandler(thisArg, event, unbound, bound) {
		boundEventHandlers.push({
			"thisArg": thisArg,
			"event": event,
			"unbound": unbound,
			"bound": bound
		});
	};

	function getBoundEventHandler(thisArg, event, handler) {
		for (var i = 0, len = boundEventHandlers.length; i < len; i++) {
			var obj = boundEventHandlers[i];

			if (obj && obj.thisArg === thisArg && obj.event === event && obj.unbound === handler)
				return obj;
		}

		return null;
	};

	window.$ = $;
})(window);
