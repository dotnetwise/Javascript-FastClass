var fastClass = require('./content/scripts/FastClass.js');
//Uncomment this for a quick demo & self test
////////////////OPTION 1: inheritWith////////////////////////
//Using Define: 
//Function.prototype.define(proto) copies the given value from proto to function.prototype i.e. A in this case

////Aternative for Function.define we can do this:
//var A = function (val) {
//     Function.initMixins(this);// since this is a top function, we need to call initMixins to make sure they will be initialized.
//	this.val = val;
//}.define({
//	method1: function (x, y, z) {
//		this.x = x;
//		this.y = y;
//		this.z = z;
//	}
//});

//To define the top level (first) function there is a sugar (as well as the above alternative)
var A = Function.define(function(val) {
     // when we are definin a top function with Function.define we DON'T need to call initMixins because they will be called automatically for us
	this.val = val;
}, {
	method1: function (x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
});


//Follow derrivations using inheritWith

var B = A.inheritWith(function (base, baseCtor) {
	return {
		constructor: function (val) { baseCtor.call(this, val) },
		method1: function (y, z) {
			base.method1.call(this, 'x', 'y', z);
		}
	};
});

var C = B.inheritWith(function (base, baseCtor) {
	return {
		constructor: function (val) { baseCtor.call(this, val) },
		method1: function (z) {
			base.method1.call(this, 'y', z);
		}
	};
});

var D = C.inheritWith(function (base, baseCtor) {
	return {
		constructor: function (val) { baseCtor.call(this, val) },
		method1: function (z) {
			base.method1.call(this, z);
		}
	};
});


selfTest();

//////////////////OPTION 2: fastClass////////////////////////
////Using Define:

//Aternative for Function.define we can do this:
var A = function (val) {
     Function.initMixins(this);// since this is a top function, we need to call initMixins to make sure they will be initialized.
	this.val = val;
}.define({
	method1: function (x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
});

//To define the top level (first) function there is a sugar (as well as the above alternative)
var A = Function.define(function A(val) {
     // when we are definin a top function with Function.define we DON'T need to call initMixins because they will be called automatically for us
	this.val = val;
}, {
	method1: function (x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
});


//Follow derrivations using fastClass
var B = A.fastClass(function (base, baseCtor) {
	this.constructor = function B(val) { baseCtor.call(this, val) };
	this.method1 = function (y, z) {
		base.method1.call(this, 'x', y, z);
	}
});
var C = B.fastClass(function (base, baseCtor) {
	this.constructor = function C(val) { baseCtor.call(this, val) };
	this.method1 = function (z) {
		base.method1.call(this, 'y', z);
	};
});

var D = C.fastClass(function (base, baseCtor) {
	this.constructor = function D(val) { baseCtor.call(this, val) };
	this.method1 = function (z) {
		base.method1.call(this, z);
	};
});

selfTest();

function selfTest() {
	var a = new A("a");
	a.method1("x", "y", "z");
	console.assert(a.x == "x", "a.x should be set to 'x'");
	console.assert(a.y == "y", "a.y should be set to 'y'");
	console.assert(a.z == "z", "a.z should be set to 'z'");
	var b = new B("b");
	b.method1("y", "z");
	console.assert(b.x == "x", "b.x should be set to 'x'");
	console.assert(b.y == "y", "b.y should be set to 'y'");
	console.assert(b.z == "z", "b.z should be set to 'z'");
	var c = new C("c");
	c.method1("z");
	console.assert(c.x == "x", "c.x should be set to 'x'");
	console.assert(c.y == "y", "c.y should be set to 'y'");
	console.assert(c.z == "z", "c.z should be set to 'z'");

	var d = new D("d");
	d.method1("w");
	console.assert(d.x == "x", "d.x should be set to 'x'");
	console.assert(d.y == "y", "d.y should be set to 'y'");
	console.assert(d.z == "w", "d.z should be set to 'w'");

	var expecteds = {
		"d instanceof A": true,
		"d instanceof B": true,
		"d instanceof C": true,
		"d instanceof D": true,
		"c instanceof A": true,
		"c instanceof B": true,
		"c instanceof C": true,
		"b instanceof A": true,
		"b instanceof B": true,
		"b instanceof C": false,
		"a instanceof A": true,
		"a instanceof B": false,
		"a instanceof C": false,
		"A.prototype.constructor === a.constructor && a.constructor === A.constructor": true,//this should not equal to A itself due to mixins base function
		"B.prototype.constructor === b.constructor && b.constructor === B && B == B.constructor": true,
		"C.prototype.constructor === c.constructor && c.constructor === C && B == B.constructor": true,
		"D.prototype.constructor === d.constructor && d.constructor === D && B == B.constructor": true,
	}
	for (var expectedKey in expecteds) {
		var expected = expecteds[expectedKey];
		var actual = eval(expectedKey);//using eval for quick demo self test purposing -- using eval is not recommended otherwise
		console.assert(!(expected ^ actual), expectedKey + " expected: " + expected + ", actual: " + actual);
	}
}
console.log("If there are no asserts in the console then all tests have passed! yey :)")

//defining a mixin
var Point = function Point() {
	this.point = { x: 1, y: 2 };
}.define({
	x: function x(x) {
		/// <param name="x" optional="true">Specify a value to set the point.x. Don't specify anything will retrieve point.x</param>
		return arguments.length ? (this.point.x = x) && this || this : this.point.x;
	},
	y: function y(y) {
		/// <param name="y" optional="true">Specify a value to set the point.y. Don't specify anything will retrieve point.y</param>
		return arguments.length ? (this.point.y = y) && this || this : this.point.y;
	}
});

//referencing the mixin:
var E = D.inheritWith(function (base, baseCtor) {
	return {
		//no constructor !! - it will be added automatically for us
		method1: function (z) {
			base.method1.call(this, z);
		}
	};
}, Point//specifying zero or more mixins - comma separated
);

var e = new E();
e.x(2);//sets e.point.x to 2
console.log("mixin Point.x expected to return 2. Actual: ", e.x());//returns 2

