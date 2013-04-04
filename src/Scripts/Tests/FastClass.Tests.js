/// <reference path="../../content/scripts/fastclass.js" />
/// <reference path="qunit.js" />
var A = Function.define(function (val) {
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
		method1: function (y, z) {
			base.method1.call(this, 'x', 'y', z);
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
	x: function x(x) {
		/// <param name="x" optional="true">Specify a value to set the point.x. Don't specify anything will retrieve point.x</param>
		return arguments.length ? (this.point.x = x) && this || this : this.point.x;
	},
	y: function y(y) {
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
	equal(c instanceof B, true,"c instanceof B should return true!");
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
	equal(typeof d.x, "function", "d.x should be a function from mixin Point");
	equal(d.x(), 1, "d.x should return 1");
	equal(d.x(3), d, "d.x(3) should set d.point.x to 3 and return d");
	equal(d.x(), 3, "d.x should return 3");
});
test("multiple mixins adding same property should trigger an assert", function () {
	raises(function () {
		A.fastClass(function (base, baseCtor) {
			this.constructor = function E() { }
		}, Point, Point);
	},
	/The '(.+)' mixin defines a 'function' named '(.+)' which is already defined on the class ('E')?!/,
		"adding same mixin twice should trigger an warning"
	);
});
test("Function.define should automatically initialize mixins", function () {
	var F = Function.define(function () {
	}, {}, Point);
	var f = new F();
	equal(typeof f.x, "function", "Function.define(function() {}, {}, Point) should automatically initialize mixin Point");
});
