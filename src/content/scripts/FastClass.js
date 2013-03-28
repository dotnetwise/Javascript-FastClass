////For performance tests please see: http://jsperf.com/js-inheritance-performance/25


(function () {
	var canDefineNonEnumerableProperty = typeof Object.defineProperty === "function";
	function __() { };
	Function.prototype.inherit = function (creator, makeConstructorNotEnumerable) {
		/// <summary>Inherits the prototype of the given function. The creator function should return a new Constructor function whose prototype will share this functions's prototype</summary>
		/// <param name="creator" type="Function">function(base, baseConstructor) {<br/>
		///  return function Derived() {  <br/>
		///  		base.apply(this, arguments); <br/>
		///  	} <br/>
		///  	Notice that there is no .override method call after the function Derrived(){}. This is very important. If you do want to override some methods then use .extend instead
		///  </param>
		/// <param name="makeConstructorNotEnumerable" type="Boolean">Object.defineProperty is rather slow. If you concern about performance and don't care about 'constructor' being enumerable in for (var i in instance) then let this false. <br/>
		/// Otherwise set it to true and we will redefine the correct constructor i.e. Extendee.prototype.constructor === Extendee that is non-Enumerable
		/// </param>

		__.prototype = this.prototype;
		var Derived = creator.call(this, this.prototype, this);
		Derived.prototype = new __;
		this.__class = Derived.__class = 1;

		//if we care about Extendee.prototype.constructor === Extendee to be non-Enumerable
		//By default we set the constructor but we don't make it non-enumerable
		if (makeConstructorNotEnumerable && canDefineNonEnumerableProperty)//this is not default as it carries over some performance overhead
			Object.defineProperty(extendeePrototype, 'constructor', { enumerable: false, value: Derived });
		else Derived.prototype.constructor = Derived;//Also fallback for older non-ECMA-5 browsers

		return Derived;
	};
	Function.prototype.extend = function (creator) {
		/// <summary>Extends the prototype of the given function. The creator function should return a new Constructor function whose prototype will share this functions's prototype.</summary>
		/// <param name="creator" type="Function">function(base, baseConstructor) {<br/>
		///  return function Derived() {  <br/>
		///  		base.apply(this, arguments); <br/>
		///  	}.override(base, {	//custom functions to be added on Derived.prototype <br/>
		///  	  method: function() { <br/>
		///		return base.method.apply(this, arguments); //call the base class' method, assuming is any <br/>
		///      } <br/>
		///    }); <br/>
		///    So it is very important to call the .override at the end. If you simply want to inherit from an object with no overrides then you should call .inherit function instead
		///  </param>

		var Derived = creator.call(this, this.prototype, this);

		this.__class = Derived.__class = 1;

		return Derived;
	};

	Function.prototype.override = function (basePrototype, prototype, makeConstructorNotEnumerable) {
		/// <summary>Extends the prototype of the given function with the custom methods and fields specified in the prototype parameter.</summary>
		/// <param name="prototype" type="Plain Object">A custom object with the methods or properties to be added on Extendee.prototype</param>


		__.prototype = basePrototype;
		var extendeePrototype = new __;
		this.prototype = extendeePrototype;

		//if we care about Extendee.prototype.constructor === Extendee to be non-Enumerable
		//By default we set the constructor but we don't make it non-enumerable
		if (makeConstructorNotEnumerable && canDefineNonEnumerableProperty)//this is not default as it carries over some performance overhead
			Object.defineProperty(extendeePrototype, 'constructor', { enumerable: false, value: this });
		else extendeePrototype.constructor = this;


		if (prototype)
			for (var p in prototype)
				extendeePrototype[p] = prototype[p];
		return this;
	}

	Function.prototype.inheritWith = function (creator, makeConstructorNotEnumerable) {
		/// <summary>Extends the prototype of the given function with the custom methods and fields specified in the prototype parameter.</summary>
		/// <param name="prototype" type="Plain Object">A custom object with the methods or properties to be added on Extendee.prototype</param>
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
			Object.defineProperty(derrivedPrototype, 'constructor', {
				enumerable: false,
				value: Derrived
			});

		return Derrived;
	};

	Function.prototype.define = function (prototype) {
		/// <summary>Define members on the prototype of the given function with the custom methods and fields specified in the prototype parameter.</summary>
		/// <param name="prototype" type="Plain Object">A custom object with the methods or properties to be added on Extendee.prototype</param>

		var extendeePrototype = this.prototype;

		if (prototype)
			for (var p in prototype)
				extendeePrototype[p] = prototype[p];
		return this;
	}


	Function.prototype.fastClass = function (creator) {
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter</summary>
		/// <param name="creator" type="function(base, baseCtor)">where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .fastClass on</param>


		//this == the base "class"
		//ctor is a function that would create the "derrived" function's prototype (including the function itself - aka `constrcutor`)
		var baseClass = this, ctor = (creator || function () { this.constructor = function () { baseClass.apply(this, arguments); } })(this.prototype, this)

		console.assert(typeof ctor === "function", "Your .fastClass' creator didn't return a function. fastClass expects an argument of type function with two parameters: base and baseCtor (the prototype respectively construrctor of the 'base' class to be derrivated). You should return a new function that would return the new prototype i.e. return function() { this.constructor = function() { baseCtor.apply(this, arguments); }")

		//inheriting from base class' prototype
		ctor.prototype = this.prototype;
		//creating the derrived class' prototype
		var derrivedProrotype = new ctor();

		//did you forget or not intend to add a constructor? We'll add one for you
		if (!derrivedProrotype.hasOwnProperty("constructor"))
			derrivedProrotype.constructor = function () { baseClass.apply(this, arguments); }

		//setting the derrivedPrototype to constructor's prototype
		derrivedProrotype.constructor.prototype = derrivedProrotype;
		//returning the constructor
		return derrivedProrotype.constructor;
	};
})();

//////Uncomment this for a quick demo & self test
////////////////////OPTION 1: extend////////////////////////
////Using prototype:

//var A = function (val) {
//	if (val) {
//		this.val = val;
//	}
//}
//A.prototype.method1 = function (x, y, z) {
//	this.x = x;
//	this.y = y;
//	this.z = z;
//}

////Follow derrivations using extend
//var B = A.extend(function (base, baseCtor) {
//	return function B(val) {
//		baseCtor.apply(this, arguments);
//	}.override(base, {
//		method1: function (y, z) {
//			base.method1.call(this, 'x', y, z);
//		}
//	});
//});

//var C = B.extend(function (base, baseCtor) {
//	return function C(val) {
//		baseCtor.apply(this, arguments);
//	}.override(base, {
//		method1: function (z) {
//			base.method1.call(this, 'y', z);
//		}
//	});
//});

//var D = C.extend(function (base, baseCtor) {
//	return function D(val) {
//		baseCtor.apply(this, arguments);
//	}.override(base, {
//		method1: function (z) {
//			base.method1.call(this, z);
//		}
//	});
//});

//selfTest();

////////////////////OPTION 2: inheritWith////////////////////////
////Using Define: 
////function.define(proto) copies the given value from proto to function.prototype

//var A = function (val) {
//	if (val) {
//		this.val = val;
//	}
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

////////////////////OPTION 3: fastClass////////////////////////
////Using Define:

//var A = function (val) {
//	if (val) {
//		this.val = val;
//	}
//}.define({
//	method1: function (x, y, z) {
//		this.x = x;
//		this.y = y;
//		this.z = z;
//	}
//});


////Follow derrivations using fastClass
//var B = A.fastClass(function (base, baseCtor) {
//	return function () {
//		this.constructor = function (val) { baseCtor.call(this, val) },
//		this.method1 = function (y, z) {
//			base.method1.call(this, 'x', y, z);
//		}
//	};
//});
//var C = B.fastClass(function (base, baseCtor) {
//	return function () {
//		this.constructor = function (val) { baseCtor.call(this, val) },
//		this.method1 = function (z) {
//			base.method1.call(this, 'y', z);
//		}
//	};
//});

//var D = C.fastClass(function (base, baseCtor) {
//	return function () {
//		this.constructor = function (val) { baseCtor.call(this, val) },
//		this.method1 = function (z) {
//			base.method1.call(this, z);
//		}
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