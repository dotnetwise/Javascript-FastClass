/// <reference path="../../content/scripts/fastclass.js" />
/// <reference path="qunit.js" />
var A = Function.define(function A(val) {
	this.val = val;
}, {
	method1: function method1(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
});

//Follow derrivations using inheritWith

var B = A.inheritWith(function B(base, baseCtor) {
	return {
		method1: function method1(y, z) {
			base.method1.call(this, 'x', y, z);
		}
	};
});

var C = B.inheritWith(function (base, baseCtor) {
	return {
		constructor: function C(val) { baseCtor.call(this, val) },
		method1: function (z) {
			base.method1.call(this, 'y', z);
		}
	};
});

var Point = function Point() {
	this.point = { x: 1, y: 2 };
}.define({
	name: "Point",
	getOrSetX: function x(x) {
		/// <param name="x" optional="true">Specify a value to set the point.x. Don't specify anything will retrieve point.x</param>
		return arguments.length ? (this.point.x = x) && this || this : this.point.x;
	},
	getOrSetY: function y(y) {
		/// <param name="y" optional="true">Specify a value to set the point.y. Don't specify anything will retrieve point.y</param>
		return arguments.length ? (this.point.y = y) && this || this : this.point.y;
	}
});

var D = C.inheritWith(function (base, baseCtor) {
	return {
		constructor: function D(val) { baseCtor.call(this, val) },
		method1: function (z) {
			base.method1.call(this, z);
		}
	};
}, Point);

var a = new A("a"), b = new B("b"), c = new C("c"), d = new D("d");
console.__throwErrorOnAssert = true;
test(".val should be the given argument i.e. a,b,c,d", function () {
	equal(a.val, "a");
	equal(b.val, "b");
	equal(c.val, "c");
	equal(d.val, "d");
});
test("a,b,c,d instanceof A", function () {
	equal(a instanceof A, true, "a instanceof A should return true!");
	equal(b instanceof A, true, "b instanceof A should return true!");
	equal(c instanceof A, true, "c instanceof A should return true!");
	equal(d instanceof A, true, "d instanceof A should return true!");
});
test("a,b,c,d instanceof A", function () {
	equal(a instanceof B, false, "a instanceof B should return false!");
	equal(b instanceof B, true, "b instanceof B should return true!");
	equal(c instanceof B, true, "c instanceof B should return true!");
	equal(d instanceof B, true, "d instanceof B should return true!");
});
test("a,b,c,d instanceof C", function () {
	equal(a instanceof C, false, "a instanceof C should return false!");
	equal(b instanceof C, false, "b instanceof C should return false!");
	equal(c instanceof C, true, "c instanceof C should return true!");
	equal(d instanceof C, true, "d instanceof C should return true!");
});
test("a,b,c,d instanceof D", function () {
	equal(a instanceof D, false, "a instanceof D should return false!");
	equal(b instanceof D, false, "b instanceof D should return false!");
	equal(c instanceof D, false, "c instanceof D should return false!");
	equal(d instanceof D, true, "d instanceof D should return true!");
});
test("mixin added to D", function () {
	equal(typeof d.getOrSetX, "function", "d.getOrSetX should be a function from mixin Point");
	equal(d.getOrSetX(), 1, "d.getOrSetX() should return 1");
	equal(d.getOrSetX(3), d, "d.getOrSetX(3) should set d.point.x to 3 and return d");
	equal(d.getOrSetX(), 3, "d.getOrSetX() should return 3");
});
test("multiple mixins adding same property should trigger an assert", function () {
	raises(function () {
		A.fastClass(function (base, baseCtor) {
			this.constructor = function E() { }
		}, Point, Point);
	},
	/The '(.+)' mixin defines a '(.+)' named '(.+)' which is already defined on the class ('.*')?!/,
		"adding same mixin twice should trigger an warning"
	);
});
test("Function.define should automatically initialize mixins", function () {
	var F = Function.define(function () {
	}, {}, Point);
	var f = new F();
	equal(typeof f.getOrSetX, "function", "Function.define(function() {}, {}, Point) should automatically initialize mixin Point");
	f.getOrSetX(10);
	equal(f.point.x, 10);
});
test("Function.define with an object", function () {
	var F = Function.define({
		constructor: function F(abc) {
			this.abc = abc;
		}
	}, {}, Point);
	var f = new F("abc");
	equal(typeof f.getOrSetX, "function", "Function.define(function() {}, {}, Point) should automatically initialize mixin Point");
	equal(f.abc, "abc");
	f.getOrSetX(20);
	equal(f.getOrSetX(), 20);
});


test("Function.define should create mixins the same way as function(){}.define({}) does", function () {

	var Size = Function.define({
		constructor: function xMixin(prototype, ctor) {
			this.size = { width: 0, height: 0 };
			//intellisense.logMessage("Sizing" + /function (.*)\(.*\)/gi.exec(arguments.callee.caller.toString())[1]);
			this.aSizeProto = prototype;
			this.
			a;
			return this;
		},
		width: function width() {
			return this.size.width;
			a;
		}
	});

	var Color = Function.define(function Color(prototype, ctor) {
		this.color = { color: "white", transparency: 0 };
	}, {
		isWhite: function isWhite() {
			return this.color.color === "white";
		}
	});

	var F = Function.define({
		constructor: function F(abc) {
			this.abc = abc;
		},
		f: function () {
		}
	}, Size, Point, Color);

	var f = new F("abc");
	equal(typeof f.getOrSetX, "function", "Function.define(function() {}, {}, Point, Size, Color) should automatically initialize mixins Point, Size and Color");
	equal(f.abc, "abc");//comes from F constructor
	equal(f.size.width, 0);//comes from Size constructor
	f.size.width = 30;//comes from Size constructor
	equal(f.width(), 30);//comes from Size.prototype
	equal(f.point.x, 1);//comes from Point constructor
	equal(f.getOrSetX(), 1);//comes from Point.prototype
	equal(f.color.color, "white");//comes from Color constructor
	equal(f.isWhite(), true);//comes from Color.prototype
});

test("Function.prototype.defineStatic should define static members on the given function", function () {
	var F = Function.define({
		constructor: function F(abc) {
			this.abc = abc;
		}
	}).defineStatic({
		m: function () {
			return "m";
		},
		a: 1,
		b: undefined
	});

	var f = new F("abc");
	equal(typeof F.m, "function");
	equal(F.m(), "m");
	equal(F.a, 1);
	equal("b" in F, true);
});
test("Function.abstract should define an abstract function that throw an exception when called", function () {
	raises(function () { Function.abstract("To be implemented")(); },
		/To be implemented/,
		"When calling with a custom message should assert.fail with the provided message"
	);
	raises(function () { Function.abstract()(); },
		/Not implemented/,
		"When calling with a no message should assert.fail with the default message: Not implemented"
	);
	var F = Function.define({
		method: Function.abstract(function () {
			this.abc = 1;
		})
	});
	var f = new F();
	raises(function () {
		f.method();
	},
		/Not implemented/,
		"When calling with a no message should assert.fail with the default message: Not implemented"
	);
	equal(f.abc, 1, "Ensure the custom function was called");
	var F = Function.define({
		method: Function.abstract("Custom message", function () {
			this.abc = 1;
		})
	});
	var f = new F();
	raises(function () {
		f.method();
	},
		/Custom message/,
		"When calling with a no message should assert.fail with the default message: Not implemented"
	);
	equal(f.abc, 1, "Ensure the custom function was called");
	equal(F.prototype.method.abstract, true, "The function should have static member abstract = true");
});
test("Method defined as Function.* and Function.prototype.* should not be enumerable.", function () {
	ok(true, "We do expect this test to fail on IE8/IE7");
	for (var f in Function)
		ok(false, f + " should not enumerable on Function");
	for (var f in Function.prototype)
		ok(false, f + " should not enumerable on Function.prototype");
});