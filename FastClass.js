Function.prototype.fastClass = function (creator) {
	var ctor = creator(this.prototype, this);
	ctor.prototype = this.prototype;
	var c = new ctor();
	c.constructor.prototype = c;
	return c.constructor;
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
