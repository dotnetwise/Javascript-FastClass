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
