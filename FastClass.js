Function.prototype.fastClass = function (creator) {
	/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter</summary>
	/// <param name="creator" type="function(base, baseCtor)">where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .fastClass on</param>


	//this == the base "class"
	//ctor is a function that would create the "derrived" function's prototype (including the function itself - aka `constrcutor`)
	var baseClass = this, ctor = (creator|| function () { this.constructor = function () { baseClass.apply(this, arguments); } })(this.prototype, this)

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

/// Example usage:

//var A = function (val) {
//	this.val = val;
//}
//A.prototype.method1 = function (x, y, z) {
//	this.x = x;
//	this.y = y;
//	this.z = z;
//}

//var B = A.fastClass(function (base, baseCtor) {
//	return function () {
//		this.constructor = function (val) { baseCtor.call(this, val) },
//		this.method1 = function (y, z) {
//			base.method1.call(this, 'x', y, z);
//		}
//	};
//});

//var a = new A("a");
//a.method1("1", "2", "3");
//var b = new B("b");
//a.method1("y", "z");
