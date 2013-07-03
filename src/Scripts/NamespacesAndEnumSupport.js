window.namespace = window.ns = function (names, container, separator) {
	/// <summary>Defines a new namespace. You can specify multiple nested namespaces separated by dot(s) i.e. DemoApp.controllers.customer</summary>
	/// <param name="names" type="String">Specify the name or names of the namespace separated by dot(s). i.e. DemoApp or DemoApp.controllers</param>
	/// <param name="separator" type="String">Specify a custom separator different than "dot" if desired</param>
	/// <param name="container" type="Object">Specify an object where to place the new namespace into. By default it goes globally in window</param>

	var ns = (names || '').split(separator || '.'),
	  o = container || window,
	  i,
	  len;
	for (i = 0, len = ns.length; i < len; i++) {
		o = o[ns[i]] = o[ns[i]] || {};
		if (!o.__namespace)
			Object.defineProperty
				? Object.defineProperty(o, "__namespace", { enumerable: false, value: true })
				: (o.__namespace = true);
	}
	return o;
};

function Enum(values) {
	/// <summary>Declares a new enum with the given values i.e. var colors = new Enum({ Red: 1, Green: 2, Blue: 3}) </summary>
	/// <param name="values" type="PlainObject">Specify the values of the enum i.e. { Red: 1, Green: 2, Blue: 3}</param>

	var _enum = values || {};
	if (!_enum.__enum)
		Object.defineProperty
			? Object.defineProperty(_enum, "__enum", { enumerable: false, value: true })
			: (_enum.__enum = true);
	return _enum;
};

////uncomment these in order to enable String.format, String.prototype.format and WAssert function
////The WAssert function helps you to have code that is only on the debug version but it will not get minified
////You don't need these if you are using https://github.com/DotNetWise/Javascript-FastClass project
//if (!String.prototype.format) {
//	var regexes = {};
//	String.prototype.format = function format(parameters) {
//		/// <summary>Equivalent to C# String.Format function</summary>
//		/// <param name="parameters" type="Object" parameterArray="true">Provide the matching arguments for the format i.e {0}, {1} etc.</param>

//		for (var formatMessage = this, args = arguments, i = args.length; --i >= 0;)
//			formatMessage = formatMessage.replace(regexes[i] || (regexes[i] = RegExp("\\{" + (i) + "\\}", "gm")), args[i]);
//		return formatMessage;
//	};
//	if (!String.format) {
//		String.format = function format(formatMessage, params) {
//			/// <summary>Equivalent to C# String.Format function</summary>
//			/// <param name="formatMessage" type="string">The message to be formatted. It should contain {0}, {1} etc. for all the given params</param>
//			/// <param name="params" type="Object" parameterArray="true">Provide the matching arguments for the format i.e {0}, {1} etc.</param>
//			for (var args = arguments, i = args.length; --i;)
//				formatMessage = formatMessage.replace(regexes[i - 1] || (regexes[i - 1] = RegExp("\\{" + (i - 1) + "\\}", "gm")), args[i]);
//			return formatMessage;
//		};
//	}
//}
/////#DEBUG
//window.WAssert = window.WAssert || function WAssert(trueishCondition, message, arg1, arg2, argEtc) {
//	/// <summary>Returns an `assert function` if the condition is false an a `noop function` (a function which does nothing) if the condition is true. <br/>
//	///  WAsserts will not be included in production code in anyways, hence the minifier will remove all the WAssert calls<br/><br/>
//	///  You always need to call the WAssert function twice since the first call always returns a function i.e. WAssert(false, "{0} failed", "Condition")()
//	/// </summary>
//	/// <param name="trueishCondition" type="Boolean">The condition to be tested. It should be true so nothing happens, or false to assert the error message</param>
//	/// <param name="message" type="String || Function">The message to be asserted. If passed a function it will be evaluated all the times, regardless of the condition</param>
//	/// <param name="arg1" type="Object" optional="true">First argument to replace all of the {0} occurences from the message</param>
//	/// <param name="arg2" type="Object" optional="true">Second argument to replace all of the {1} occurences from the message</param>
//	/// <param name="argEtc" type="Object" optional="true" parameterArray="true">Third argument to replace all of the {3} occurences from the message.<br/> You can add as many arguments as you want and they will be replaced accordingly</param>
//	if (typeof message === "function")
//		message = message.apply(this, arguments) || "";
//	if (typeof trueishCondition === "function" ? !trueishCondition.apply(this, arguments) : !trueishCondition) {
//		var parameters = Array.prototype.slice.call(arguments, 1);
//		var msg = typeof message == "string" ? String.format.apply(message, parameters) : message;
//		return window.console && !console.__throwErrorOnAssert && console.assert && console.assert.bind && console.assert.bind(console, trueishCondition, msg) || function consoleAssertThrow() { throw msg; };
//	}
//	return __;
//};
/////#ENDDEBUG


