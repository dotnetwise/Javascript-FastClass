Function.prototype.fastClass = function (creator) {
	/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter</summary>
	/// <param name="creator" type="function(base, baseCtor) { }">where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .fastClass on</param>

	//this == constructof of the base "Class"
	var baseClass = this;
	var basePrototype = this.prototype;
	creator = creator || function () { this.constructor = function () { baseClass.apply(this, arguments); } };
	creator.prototype = basePrototype;

	//creating the derrived class' prototype
	var derrivedProrotype = new creator(basePrototype, this);

	//did you forget or not intend to add a constructor? We'll add one for you
	if (!derrivedProrotype.hasOwnProperty("constructor"))
		derrivedProrotype.constructor = function () { baseClass.apply(this, arguments); }

	//setting the derrivedPrototype to constructor's prototype
	derrivedProrotype.constructor.prototype = derrivedProrotype;

	//returning the constructor
	return derrivedProrotype.constructor;
};

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

///// Example usage:

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
//	this.constructor = function (val) { baseCtor.call(this, val) };
//	this.method1 = function (y, z) {
//		base.method1.call(this, 'x', y, z);
//	}
//});
//var a = new A("a");
//a.method1("1", "2", "3");
//// { val: "a", x: 1,  y: 2,  y: 3  }
//var b = new B("b");
//b.method1("y", "z");
//// { val: "b", x: "x",  y: "y",  y: "z"  }
