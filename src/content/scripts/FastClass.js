////For performance tests please see: http://jsperf.com/js-inheritance-performance/34 + http://jsperf.com/js-inheritance-performance/35 + http://jsperf.com/js-inheritance-performance/36

(function () {
	///#DEBUG
	window.WAssert = function (condition, message, arg1, arg2, argEtc) {
		/// <summary>Returns an `assert function` if the condition is false an a `noop function` (a function which does nothing) if the condition is true. <br/>
		///  WAsserts will not be included in production code in anyways, hence the minifier will remove all the WAssert calls<br/><br/>
		///  You always need to call the WAssert function twice since the first call always returns a function i.e. WAssert(false, "{0} failed", "Condition")()
		/// </summary>
		/// <param name="condition" type="Boolean">The condition to be tested. It should be true so nothing happens</param>
		/// <param name="message" type="String || Function">The message to be asserted. If passed a function it will be evaluated all the times, regardless of the condition</param>
		/// <param name="arg1" type="Object" optional="true">First argument to replace all of the {0} occurences from the message</param>
		/// <param name="arg2" type="Object" optional="true">Second argument to replace all of the {1} occurences from the message</param>
		/// <param name="argEtc" type="Object" optional="true" parameterArray="true">Third argument to replace all of the {3} occurences from the message.<br/> You can add as many arguments as you want and they will be replaced accordingly</param>
		if (typeof message === "function")
			message = message() || "";
		if (!condition) {
			var parameters = Array.prototype.slice.call(arguments, 1);
			var msg = String.format.apply(message, parameters);
			return window.console && console.assert && console.assert.bind && console.assert.bind(console, condition, msg) || function () { throw msg;};
		}
		return __;
	};
	///#ENDDEBUG

	var Object_keys = Object.keys;
	var Object_defineProperty = Object.defineProperty;
	var Function_prototype = Function.prototype;
	var canDefineNonEnumerableProperty = typeof Object_defineProperty === "function";
	var Array_prototype = Array.prototype;

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
	if (!Array_prototype.forEach) {
		Array_prototype.forEach = function (fn, scope) {
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
		var derrivedPrototype;
		__.prototype = this.prototype;
		Derrived.prototype = derrivedPrototype = new __;

		creator = creatorResult;//change the first parameter with the creatorResult
		Function_prototype.define.apply(Derrived, arguments);
		WAssert(true, function () {
			//trigger intellisense on VS2012 for base class members, because same as IE, VS2012 doesn't support 
			for (var i in derrivedPrototype)
				if (!creatorResult.hasOwnProperty(i))
					creatorResult[i] = derrivedPrototype[i];
		});

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


	Function_prototype.define = function (prototype, mixins) {
		/// <summary>Define members on the prototype of the given function with the custom methods and fields specified in the prototype parameter.</summary>
		/// <param name="prototype" type="Function || Plain Object">A custom object with the methods or properties to be added on Extendee.prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to this function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>

		var extendeePrototype = this.prototype;

		if (prototype) {
			if (typeof prototype === "function")
				prototype = prototype.call(extendeePrototype, this);
			for (var key in prototype)
				extendeePrototype[key] = prototype[key];
		}
		arguments.length > 1 && Array_prototype.forEach.call(arguments, function (mixin, index) {
			mixin = index ? (typeof mixin === 'function' ? mixin(prototype, ctor) : mixin) : null;
			if (mixin) {
				for (var key in mixin) {
					WAssert(!extendeePrototype[key], function () {
						//trigger intellisense on VS2012 for mixins
						if (!extendeePrototype.hasOwnProperty(key))
							extendeePrototype[key] = mixin[key];
						return "The {0} mixin defines a {1} named {2} which is already defined on the class"
					}, index - 1, typeof mixin[key] === "function" ? "function" : "member", key)();
					extendeePrototype[key] = mixin[key];
				}
			}
		});
		return this;
	}


	Function.define = function (creator, mixins) {
		/// <summary>Defines a function named constructor returned by the creator parameter and extends it's protoype with all other functions</summary>
		/// <param name="creator" type="Functionfunction() { return { constructor: function() {..}...} }"></param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the returned "constructor" function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		var creatorResult = (typeof creator === "function" ? creator : creator.call(this)) || {};
		var constructor = creatorResult.constructor || function () { }; //automatic constructor if ommited
		creator = null;
		arguments.length > 1 && Function_prototype.define.apply(constructor, arguments);

		return constructor;
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