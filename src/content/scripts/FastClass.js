////For performance tests please see: http://jsperf.com/js-inheritance-performance/34 + http://jsperf.com/js-inheritance-performance/35 + http://jsperf.com/js-inheritance-performance/36

(function () {
	if (!String.prototype.format) {
		var regexes = {};
		String.prototype.format = function (parameters) {
			/// <summary>Equivalent to C# String.Format function</summary>
			/// <param name="parameters" type="Object" parameterArray="true">Provide the matching arguments for the format i.e {0}, {1} etc.</param>

			for (var formatMessage = this, args = arguments, i = args.length; --i >= 0;)
				formatMessage = formatMessage.replace(regexes[i] || (regexes[i] = RegExp("\\{" + (i) + "\\}", "gm")), args[i]);
			return formatMessage;
		};
		if (!String.format) {
			String.format = function (formatMessage, params) {
				/// <summary>Equivalent to C# String.Format function</summary>
				/// <param name="formatMessage" type="string">The message to be formatted. It should contain {0}, {1} etc. for all the given params</param>
				/// <param name="params" type="Object" parameterArray="true">Provide the matching arguments for the format i.e {0}, {1} etc.</param>
				for (var args = arguments, i = args.length; --i;)
					formatMessage = formatMessage.replace(regexes[i - 1] || (regexes[i - 1] = RegExp("\\{" + (i - 1) + "\\}", "gm")), args[i]);
				return formatMessage;
			};
		}
	}
	///#DEBUG
	window.WAssert = function (trueishCondition, message, arg1, arg2, argEtc) {
		/// <summary>Returns an `assert function` if the condition is false an a `noop function` (a function which does nothing) if the condition is true. <br/>
		///  WAsserts will not be included in production code in anyways, hence the minifier will remove all the WAssert calls<br/><br/>
		///  You always need to call the WAssert function twice since the first call always returns a function i.e. WAssert(false, "{0} failed", "Condition")()
		/// </summary>
		/// <param name="trueishCondition" type="Boolean">The condition to be tested. It should be true so nothing happens, or false to assert the error message</param>
		/// <param name="message" type="String || Function">The message to be asserted. If passed a function it will be evaluated all the times, regardless of the condition</param>
		/// <param name="arg1" type="Object" optional="true">First argument to replace all of the {0} occurences from the message</param>
		/// <param name="arg2" type="Object" optional="true">Second argument to replace all of the {1} occurences from the message</param>
		/// <param name="argEtc" type="Object" optional="true" parameterArray="true">Third argument to replace all of the {3} occurences from the message.<br/> You can add as many arguments as you want and they will be replaced accordingly</param>
		if (typeof message === "function")
			message = message() || "";
		if (!trueishCondition) {
			var parameters = Array.prototype.slice.call(arguments, 1);
			var msg = typeof message == "string" ? String.format.apply(message, parameters) : message;
			return window.console && console.assert && console.assert.bind && console.assert.bind(console, trueishCondition, msg) || function () { throw msg; };
		}
		return __;
	};
	///#ENDDEBUG

	var Function_prototype = Function.prototype;
	var Array_prototype = Array.prototype;
	var Array_prototype_forEach = Array_prototype_forEach;
	var supportsProto = {};

	supportsProto = supportsProto.__proto__ === Object.prototype;
	if (supportsProto) {
		try {
			supportsProto = {};
			supportsProto.__proto__ = { Object: 1 };
			supportsProto = supportsProto.Object === 1;//setting __proto__ in firefox is terribly slow!
		} catch (ex) { supportsProto = false; }
	}
	function __() { };
	//for ancient browsers - polyfill Array.prototype.forEach
	if (!Array_prototype_forEach) {
		Array_prototype.forEach = Array_prototype_forEach = function forEach(fn, scope) {
			for (var i = 0, len = this.length; i < len; ++i) {
				fn.call(scope || this, this[i], i, this);
			}
		}
	}

	Function_prototype.fastClass = function (creator, mixins) {
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter</summary>
		/// <param name="creator" type="Function">function(base, baseCtor) { this.constructor = function() {..}; this.method1 = function() {...}... }<br/>where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .fastClass on</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>

		//this == constructor of the base "Class"
		var baseClass = this;
		var base = this.prototype;
		creator = creator || function () { this.constructor = function () { baseClass.apply(this, arguments); } };
		creator.prototype = base;

		//creating the derrived class' prototype
		var derrivedProrotype = new creator(base, this);
		var Derrived;
		//did you forget or not intend to add a constructor? We'll add one for you
		if (!derrivedProrotype.hasOwnProperty("constructor"))
			derrivedProrotype.constructor = function () { baseClass.apply(this, arguments); }
		Derrived = derrivedProrotype.constructor;
		//setting the derrivedPrototype to constructor's prototype
		Derrived.prototype = derrivedProrotype;

		creator = null;//set the first parameter to null as we have already 'shared' the base prototype into derrivedPrototype in the creator function by setting creator.prototype = base on above
		arguments.length > 1 && Function_prototype.define.apply(Derrived, arguments);
		//returning the constructor
		return Derrived;
	};

	Function_prototype.inheritWith = !supportsProto ? function (creator, mixins) {
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter</summary>
		/// <param name="creator" type="Function">function(base, baseCtor) { return { constructor: function() {..}...} }<br/>where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .inheritWith on</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>

		var baseCtor = this;
		var creatorResult = creator.call(this, this.prototype, this) || {};
		var Derrived = creatorResult.constructor ||
        function defaultCtor() {
        	baseCtor.apply(this, arguments);
        }; //automatic constructor if ommited

		WAssert(true, vs2012Intellisense && function () {
			//trigger intellisense on VS2012 when pressing F12 (go to reference) to go to the creator rather than the defaultCtor
			intellisense.redirectDefinition(Derrived, creator);
		});
		var derrivedPrototype;
		__.prototype = this.prototype;
		Derrived.prototype = derrivedPrototype = new __;


		creator = creatorResult;//change the first parameter with the creatorResult
		Function_prototype.define.apply(Derrived, arguments);

		return Derrived;
	} :// when browser supports __proto__ setting it is way faster than iterating the object
	function (creator, mixins) {
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter</summary>
		/// <param name="creator" type="Function">function(base, baseCtor) { return { constructor: function() {..}...} }<br/>where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .inheritWith on</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived class. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		var baseCtor = this;
		var derrivedPrototype = creator.call(this, this.prototype, this) || {};
		var Derrived = derrivedPrototype.constructor ||
        function defaultCtor() {
        	baseCtor.apply(this, arguments);
        }; //automatic constructor if ommited
		Derrived.prototype = derrivedPrototype;
		derrivedPrototype.__proto__ = this.prototype;
		creator = null;//set the first parameter to null as we have already 'shared' the base prototype into derrivedPrototype by using __proto__
		arguments.length > 1 && Function_prototype.define.apply(Derrived, arguments);

		return Derrived;
	};

	Function_prototype.define = function define(prototype, mixins) {
		/// <summary>Define members on the prototype of the given function with the custom methods and fields specified in the prototype parameter.</summary>
		/// <param name="prototype" type="Function || Plain Object">{} or function(prototype, ctor) {}<br/>A custom object with the methods or properties to be added on Extendee.prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to this function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		var constructor = this;
		var extendeePrototype = this.prototype;
		var creatorResult = prototype;
		if (prototype) {
			if (typeof prototype === "function")
				prototype = prototype.call(extendeePrototype, this.prototype, this);
			for (var key in prototype)
				extendeePrototype[key] = prototype[key];
		}
		prototype = null;
		arguments.length > 1 && (extendeePrototype.mixins = extendeePrototype.mixins || []) && Array_prototype_forEach.call(arguments, function (mixin, index, mixinValue, isFunction) {
			isFunction = typeof mixin === 'function';
			if (isFunction) {
				__.prototype = mixin.prototype;
				mixinValue = new __;
			}
			else mixinValue = mixin;
			if (mixinValue) {
				for (var key in mixinValue) {
					WAssert(true, function () {
						//trigger intellisense on VS2012 for mixins
						if (key in extendeePrototype) {
							var msg = "The '{0}' mixin defines a '{1}' named '{2}' which is already defined on the class {3}!"
								.format(isFunction && mixin.name || (index - 1), typeof mixinValue[key] === "function" ? "function" : "member", key, constructor.name ? ("'" + constructor.name + "'") : '');
							window.vs2012Intellisense && intellisense.logMessage(msg);
							throw msg;
						}
					});
					isFunction && extendeePrototype.mixins.push(mixin);
					extendeePrototype[key] = mixinValue[key];
				}
			}
		});
		WAssert(true, window.vs2012Intellisense && function () {
			//trigger intellisense on VS2012 for base class members, because same as IE, VS2012 doesn't support __proto__
			for (var i in extendeePrototype)
				if (!creatorResult.hasOwnProperty(i))
					creatorResult[i] = extendeePrototype[i];
			//inject properties from the new constructor
			extendeePrototype = {};
			this.call(extendeePrototype);
			for (var i in extendeePrototype)
				if (!creatorResult.hasOwnProperty(i))
					creatorResult[i] = extendeePrototype[i];
		}.bind(this));
		return this;
	}


	Function.define = function (func, prototype, mixins) {
		/// <summary>Extends the given func's prototype with provided members of prototype and ensures calling the mixins in the constructor</summary>
		/// <param name="func" type="Function">Specify the constructor function you want to define i.e. function() {}</param>
		/// <param name="prototype" type="Plain Object" optional="true">Specify an object that contain the functions or members that should defined on the provided func's prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the returned func's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		var result;
		var constructor = func || function () { }; //automatic constructor if ommited
		func = prototype;
		prototype = null;
		arguments.length > 1 && Function_prototype.define.apply(constructor, arguments);

		result = function () { Function.initMixins(this); constructor.call(this); }
		//forward the VS2012 intellisense to the given constructor function
		WAssert(true, window.vs2012Intellisense && function () {
			intellisense.redirectDefinition(result, constructor);
		});
		return result;
	};

	Function.initMixins = function (o) {
		var p = o, mixins, length, i, mixin, calledMixins = {};
		while (p) {
			p = supportsProto ? p.__proto__ : Object.getPrototypeOf(p);
			if (p && (mixins = p.mixins) && (length = mixins.length))
				for (i = 0; mixin = mixins[i], i < length; i++)
					if (!(mixin in calledMixins)) {
						calledMixins[mixin] = 1;
						mixins[i].call(o, p, p.constructor);
					}
		}
	};

})();

////Uncomment this for a quick demo & self test
//////////////////OPTION 1: inheritWith////////////////////////
//Using Define: 
//function.define(proto) copies the given value from proto to Function_prototype

//var A = function (val) {
//	this.val = val;
//}.define({
//	method1: function (x, y, z) {
//		this.x = x;
//		this.y = y;
//		this.z = z;
//	}
//});

////Follow derrivations using inheritWith

//var B = A.inheritWith(function (base, baseCtor) {
//	return {
//		constructor: function (val) { baseCtor.call(this, val) },
//		method1: function (y, z) {
//			base.method1.call(this, 'x', 'y', z);
//		}
//	};
//});

//var C = B.inheritWith(function (base, baseCtor) {
//	return {
//		constructor: function (val) { baseCtor.call(this, val) },
//		method1: function (z) {
//			base.method1.call(this, 'y', z);
//		}
//	};
//});

//var D = C.inheritWith(function (base, baseCtor) {
//	return {
//		constructor: function (val) { baseCtor.call(this, val) },
//		method1: function (z) {
//			base.method1.call(this, z);
//		}
//	};
//});


//selfTest();

////////////////////OPTION 2: fastClass////////////////////////
////Using Define:

//var A = function (val) {
//	this.val = val;
//}.define({
//	method1: function (x, y, z) {
//		this.x = x;
//		this.y = y;
//		this.z = z;
//	}
//});


////Follow derrivations using fastClass
//var B = A.fastClass(function (base, baseCtor) {
//	this.constructor = function (val) { baseCtor.call(this, val) };
//	this.method1 = function (y, z) {
//		base.method1.call(this, 'x', y, z);
//	}
//});
//var C = B.fastClass(function (base, baseCtor) {
//	this.constructor = function (val) { baseCtor.call(this, val) };
//	this.method1 = function (z) {
//		base.method1.call(this, 'y', z);
//	};
//});

//var D = C.fastClass(function (base, baseCtor) {
//	this.constructor = function (val) { baseCtor.call(this, val) };
//	this.method1 = function (z) {
//		base.method1.call(this, z);
//	};
//});

//selfTest();

//function selfTest() {
//	window.a = new A("a");
//	a.method1("x", "y", "z");
//	console.assert(a.x == "x", "a.x should be set to 'x'");
//	console.assert(a.y == "y", "a.y should be set to 'y'");
//	console.assert(a.z == "z", "a.z should be set to 'z'");
//	window.b = new B("b");
//	b.method1("y", "z");
//	console.assert(b.x == "x", "b.x should be set to 'x'");
//	console.assert(b.y == "y", "b.y should be set to 'y'");
//	console.assert(b.z == "z", "b.z should be set to 'z'");
//	window.c = new C("c");
//	c.method1("z");
//	console.assert(c.x == "x", "c.x should be set to 'x'");
//	console.assert(c.y == "y", "c.y should be set to 'y'");
//	console.assert(c.z == "z", "c.z should be set to 'z'");

//	window.d = new D("d");
//	d.method1("w");
//	console.assert(d.x == "x", "d.x should be set to 'x'");
//	console.assert(d.y == "y", "d.y should be set to 'y'");
//	console.assert(d.z == "w", "d.z should be set to 'w'");

//	var expecteds = {
//		"d instanceof A": true,
//		"d instanceof B": true,
//		"d instanceof C": true,
//		"d instanceof D": true,
//		"c instanceof A": true,
//		"c instanceof B": true,
//		"c instanceof C": true,
//		"b instanceof A": true,
//		"b instanceof B": true,
//		"b instanceof C": false,
//		"a instanceof A": true,
//		"a instanceof B": false,
//		"a instanceof C": false,
//		"A.prototype.constructor === a.constructor && a.constructor === A": true,
//		"B.prototype.constructor === b.constructor && b.constructor === B": true,
//		"C.prototype.constructor === c.constructor && c.constructor === C": true,
//		"D.prototype.constructor === d.constructor && d.constructor === D": true,
//	}
//	for (var expectedKey in expecteds) {
//		var expected = expecteds[expectedKey];
//		var actual = eval(expectedKey);//using eval for quick demo self test purposing -- using eval is not recommended otherwise
//		console.assert(!(expected ^ actual), expectedKey + " expected: " + expected + ", actual: " + actual);
//	}
//}
//console.log("If there are no asserts in the console then all tests have passed! yey :)")