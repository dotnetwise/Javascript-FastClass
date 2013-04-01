////For performance tests please see: http://jsperf.com/js-inheritance-performance/25
/// <reference path="../../scripts/_vs2012.intellisense.js" />


(function () {
	var Object_keys = Object.keys;
	var Object_defineProperty = Object.defineProperty;
	var Function_prototype = Function.prototype;
	var canDefineNonEnumerableProperty = typeof Object_defineProperty === "function";
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
	Function_prototype.fastClass = function (creator, makeConstructorNotEnumerable) {
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter</summary>
		/// <param name="creator" type="function(base, baseCtor) { }">where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .fastClass on</param>

		//this == constructor of the base "Class"
		var baseClass = this;
		var base = this.prototype;
		creator = creator || function () { this.constructor = function () { baseClass.apply(this, arguments); } };
		creator.prototype = base;

		//creating the derrived class' prototype
		var derrivedProrotype = new creator(base, this);

		//did you forget or not intend to add a constructor? We'll add one for you
		if (!derrivedProrotype.hasOwnProperty("constructor"))
			derrivedProrotype.constructor = function () { baseClass.apply(this, arguments); }

		//By default we set the constructor but we don't make it non-enumerable
		//if we care about constructor.prototype.constructor === constructor to be non-Enumerable we need to use Object.defineProperty
		if (makeConstructorNotEnumerable && canDefineNonEnumerableProperty) //this is not default as it carries over some performance overhead
			Object_defineProperty(prototype, 'constructor', {
				enumerable: false,
				value: Derrived
			});

		//setting the derrivedPrototype to constructor's prototype
		derrivedProrotype.constructor.prototype = derrivedProrotype;

		//returning the constructor
		return derrivedProrotype.constructor;
	};

	Function_prototype.inheritWith = !supportsProto ? function (creator, makeConstructorNotEnumerable) {
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter</summary>
		/// <param name="creator" type="function(base, baseCtor) { return { constructor: function() {..}...} }">where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .inheritWith on</param>
		var baseCtor = this;
		var creatorResult = creator.call(this, this.prototype, this) || {};
		var Derrived = creatorResult.constructor ||
        function defaultCtor() {
        	baseCtor.apply(this, arguments);
        }; //automatic constructor if ommited
		var derrivedPrototype;
		__.prototype = this.prototype;
		Derrived.prototype = derrivedPrototype = new __;

		for (var p in creatorResult)
			derrivedPrototype[p] = creatorResult[p];

		//By default we set the constructor but we don't make it non-enumerable
		//if we care about Derrived.prototype.constructor === Derrived to be non-Enumerable we need to use Object.defineProperty
		if (makeConstructorNotEnumerable && canDefineNonEnumerableProperty) //this is not default as it carries over some performance overhead
			Object_defineProperty(derrivedPrototype, 'constructor', {
				enumerable: false,
				value: Derrived
			});

		return Derrived;
	} :// when browser supports __proto__ setting it is way faster than iterating the object
	function (creator, makeConstructorNotEnumerable) {
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter</summary>
		/// <param name="creator" type="function(base, baseCtor) { return { constructor: function() {..}...} }">where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .inheritWith on</param>
		var baseCtor = this;
		var derrivedPrototype = creator.call(this, this.prototype, this) || {};
		var Derrived = derrivedPrototype.constructor ||
        function defaultCtor() {
        	baseCtor.apply(this, arguments);
        }; //automatic constructor if ommited
		Derrived.prototype = derrivedPrototype;
		derrivedPrototype.__proto__ = this.prototype;

		//By default we set the constructor but we don't make it non-enumerable
		//if we care about Derrived.prototype.constructor === Derrived to be non-Enumerable we need to use Object.defineProperty
		if (makeConstructorNotEnumerable && canDefineNonEnumerableProperty) //this is not default as it carries over some performance overhead
			Object_defineProperty(derrivedPrototype, 'constructor', {
				enumerable: false,
				value: Derrived
			});

		return Derrived;
	};

	
	Function_prototype.define = function (prototype) {
		/// <summary>Define members on the prototype of the given function with the custom methods and fields specified in the prototype parameter.</summary>
		/// <param name="prototype" type="Plain Object">A custom object with the methods or properties to be added on Extendee.prototype</param>

		var extendeePrototype = this.prototype;

		if (prototype) {
			for (var key in prototype)
				extendeePrototype[key] = prototype[key];
		}
		return this;
	}


	Function.define = function (creator, makeConstructorNotEnumerable) {
		/// <summary>Defines a function named constructor returned by the creator parameter and extends it's protoype with all other functions</summary>
		/// <param name="creator" type="function() { return { constructor: function() {..}...} }"></param>
		var creatorResult = creator.call(this) || {};
		var constructor = creatorResult.constructor || function () { }; //automatic constructor if ommited
		var prototype = constructor.prototype;
		for (var p in creatorResult)
			prototype[p] = creatorResult[p];

		//By default we set the constructor but we don't make it non-enumerable
		//if we care about constructor.prototype.constructor === constructor to be non-Enumerable we need to use Object.defineProperty
		if (makeConstructorNotEnumerable && canDefineNonEnumerableProperty) //this is not default as it carries over some performance overhead
			Object_defineProperty(prototype, 'constructor', {
				enumerable: false,
				value: Derrived
			});

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