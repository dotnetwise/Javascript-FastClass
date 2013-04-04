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
test("a,b,c,d instanceof A", function () {
	ok(a instanceof A, "a instanceof A should return true!");
	ok(b instanceof A, "b instanceof A should return true!");
	ok(c instanceof A, "c instanceof A should return true!");
	ok(d instanceof A, "d instanceof A should return true!");
});
test("a,b,c,d instanceof A", function () {
	ok(a instanceof B == false, "a instanceof B should return false!");
	ok(b instanceof B, "b instanceof B should return true!");
	ok(c instanceof B, "c instanceof B should return true!");
	ok(d instanceof B, "d instanceof B should return true!");
});
test("a,b,c,d instanceof C", function () {
	ok(a instanceof C == false, "a instanceof C should return false!");
	ok(b instanceof C == false, "b instanceof C should return false!");
	ok(c instanceof C, "c instanceof C should return true!");
	ok(d instanceof C, "d instanceof C should return true!");
});
test("a,b,c,d instanceof D", function () {
	ok(a instanceof D == false, "a instanceof D should return false!");
	ok(b instanceof D == false, "b instanceof D should return false!");
	ok(c instanceof D == false, "c instanceof D should return false!");
	ok(d instanceof D, "d instanceof D should return true!");
});
test("mixin added to D", function () {
	ok(typeof d.x === "function", "d.x should be a function from mixin Point");
	ok(d.x() === 1, "d.x should return 1");
	ok(d.x(3) === d, "d.x(3) should set d.point.x to 3 and return d");
	ok(d.x() === 3, "d.x should return 3");
});
test("multiple mixins adding same property should trigger an assert", function () {
	raises(function () {
		A.fastClass(function (base, baseCtor) {
			this.constructor = function E() { }
		}, Point, Point);
	},
	/The 'Point' mixin defines a 'function' named 'x' which is already defined on the class 'E'!/,
	"adding same mixin twice should trigger an warning");
});