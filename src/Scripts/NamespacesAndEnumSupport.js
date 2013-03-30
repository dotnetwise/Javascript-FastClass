window.namespace = window.ns = function (names, container, separator) {
	/// <summary>Defines a new namespace. You can specify multiple nested namespaces separated by dot(s) i.e. DemoApp.controllers.customer</summary>
	/// <param name="names" type="String">Specify the name or names of the namespace separated by dot(s). i.e. DemoApp or DemoApp.controllers</param>
	/// <param name="separator" type="String">Specify a custom separator different than "dot" if desired</param>
	/// <param name="container" type="Object">Specify an object where to place the new namespace into. By default it goes globally in window</param>

	var ns = (names || '').split(separator || '.'),
	  o = container || window,
	  i,
	  len;
	for (i = 0, len = ns.length; i < len; i++) {
		o = o[ns[i]] = o[ns[i]] || {};
		o.__namespace = true;
	}
	return o;
};

function Enum(values) {
	/// <summary>Declares a new enum with the given values i.e. var colors = new Enum({ Red: 1, Green: 2, Blue: 3}) </summary>
	/// <param name="values" type="PlainObject">Specify the values of the enum i.e. { Red: 1, Green: 2, Blue: 3}</param>

	var _enum = this === window ? {} : this;
	for (var v in values)
		_enum[v] = values[v];
	_enum.__enum = true;
	return _enum;
};


