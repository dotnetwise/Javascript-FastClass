//For performance tests please see: http://jsperf.com/js-inheritance-performance/18
(function () {
	var canDefineNonEnumerableProperty = typeof Object.defineProperty === "function";
	function __() { };
	Function.prototype.inherit = function (creator, makeConstructorNotEnumerable) {
		/// <summary>Inherits the prototype of the given function. The creator function should return a new Constructor function whose prototype will share this functions's prototype</summary>
		/// <param name="creator" type="Function">function(base, baseConstructor) {<br/>
		///  return function Derived() {  <br/>
		///  		base.apply(this, arguments); <br/>
		///  	} <br/>
		///  	Notice that there is no .override method call after the function Derrived(){}. This is very important. If you do want to override some methods then use .extend instead
		///  </param>
		/// <param name="makeConstructorNotEnumerable" type="Boolean">Object.defineProperty is rather slow. If you concern about performance and don't care about 'constructor' being enumerable in for (var i in instance) then let this false. <br/>
		/// Otherwise set it to true and we will redefine the correct constructor i.e. Extendee.prototype.constructor === Extendee that is non-Enumerable
		/// </param>

		__.prototype = this.prototype;
		var Derived = creator.call(this, this.prototype, this);
		Derived.prototype = new __;
		this.__class = Derived.__class = 1;

		//if we care about Extendee.prototype.constructor === Extendee to be non-Enumerable
		//By default we set the constructor but we don't make it non-enumerable
		if (makeConstructorNotEnumerable && canDefineNonEnumerableProperty)//this is not default as it carries over some performance overhead
			Object.defineProperty(extendeePrototype, 'constructor', { enumerable: false, value: Derived });
		else Derived.prototype.constructor = Derived;//Also fallback for older non-ECMA-5 browsers

		return Derived;
	};
	Function.prototype.extend = function (creator) {
		/// <summary>Extends the prototype of the given function. The creator function should return a new Constructor function whose prototype will share this functions's prototype.</summary>
		/// <param name="creator" type="Function">function(base, baseConstructor) {<br/>
		///  return function Derived() {  <br/>
		///  		base.apply(this, arguments); <br/>
		///  	}.override(base, {	//custom functions to be added on Derived.prototype <br/>
		///  	  method: function() { <br/>
		///		return base.method.apply(this, arguments); //call the base class' method, assuming is any <br/>
		///      } <br/>
		///    }); <br/>
		///    So it is very important to call the .override at the end. If you simply want to inherit from an object with no overrides then you should call .inherit function instead
		///  </param>

		var Derived = creator.call(this, this.prototype, this);

		this.__class = Derived.__class = 1;

		return Derived;
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

	Function.prototype.override = function (basePrototype, prototype, makeConstructorNotEnumerable) {
		/// <summary>Extends the prototype of the given function with the custom methods and fields specified in the prototype parameter.</summary>
		/// <param name="prototype" type="Plain Object">A custom object with the methods or properties to be added on Extendee.prototype</param>


		__.prototype = basePrototype;
		var extendeePrototype = new __;
		this.prototype = extendeePrototype;

		//if we care about Extendee.prototype.constructor === Extendee to be non-Enumerable
		//By default we set the constructor but we don't make it non-enumerable
		if (makeConstructorNotEnumerable && canDefineNonEnumerableProperty)//this is not default as it carries over some performance overhead
			Object.defineProperty(extendeePrototype, 'constructor', { enumerable: false, value: this });
		else extendeePrototype.constructor = this;


		if (prototype)
			for (var p in prototype)
				extendeePrototype[p] = prototype[p];
		return this;
	}
})();