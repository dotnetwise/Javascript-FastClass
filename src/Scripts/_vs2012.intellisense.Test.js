/// <reference path="namespacesandenumsupport.js" />
/// <reference path="_vs2012.intellisense.js" />
/// <reference path="~/scripts/jquery-1.9.1.js" />


!function () {

	namespace("Demo.controllers")

	function Class() {
		this.onClick = function () { },
		this.thisUndefined = undefined;
		this.thisNumber = 1;
		this.thisString = "";
		this.thisBoolean = true;
		this.thisNull = null;
		this.thisObject = {};
		this.thisFunction = function () { };
		this.thisRegExp = /a/g;
		this.thisDomElement = document.body;
		this.thisClass = Class;
		this.thisClassInstance = new Enumerator();
		this.thisNamespace = Namespace;
		this.thisEnum = Color.Red;
		this.thisObservable = function () { };
		this.thisObservable.__observable = true;
		this.thisObservableArray = function () { };
		this.thisObservableArray.__observableArray = true;
		this.thisObservableComputed = function () { };
		this.thisObservableComputed.__observableComputed = true;
	}
	Class.__map = true;
	Demo.a = Class;
	
	Class.__class = true;
	Class.prototype.protoMethod = function () { };
	Class.prototype.protoFieldObject = {};
	Class.prototype.protoFieldBool = false;
	function IUser() { }
	IUser.__interface = true;
	Demo.controllers.function = function () { };
	

	var map = {}
	map.__map = true;
	var colors = new Enum({ Red: 1, Yellow: 2, Green: 3 });
	colors.Red;

	Demo.Class = Class;
	Demo.colors = colors;
	Demo.IUser = IUser;
	Demo.map = map;
	Demo.fieldFunction = function () { }
	Demo.fieldBoolean = false;
	Demo.fieldString = "";
	Demo.fieldNumber = 1;

	var c = new Class();
	//uncomment any of these lines to test:
	//Demo.
	//Class.
	//c.


	//call and apply correct description and parameter hints!!
	function method(name, options) {
		/// <summary>Does that</summary>
		/// <param name="name" type="String">The name of the method</param>
		/// <param name="options" type="Object" optional="true">Extra options for this method</param>
	}
	method("abc")
	method.call(this, "abc")
	method.apply(this, ["abc"])
}();