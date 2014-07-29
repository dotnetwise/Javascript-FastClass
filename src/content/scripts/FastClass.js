////For performance tests please see: http://jsperf.com/js-inheritance-performance/34 + http://jsperf.com/js-inheritance-performance/35 + http://jsperf.com/js-inheritance-performance/36

(function selfCall() {
	var isNode = typeof global != "undefined";
	if (!String.prototype.format) {
		var regexes = {};
		String.prototype.format = function format(parameters) {
			/// <summary>Equivalent to C# String.Format function</summary>
			/// <param name="parameters" type="Object" parameterArray="true">Provide the matching arguments for the format i.e {0}, {1} etc.</param>

			for (var formatMessage = this, args = arguments, i = args.length; --i >= 0;)
				formatMessage = formatMessage.replace(regexes[i] || (regexes[i] = RegExp("\\{" + (i) + "\\}", "gm")), args[i]);
			return formatMessage;
		};
		if (!String.format) {
			String.format = function format(formatMessage, params) {
				/// <summary>Equivalent to C# String.Format function</summary>
				/// <param name="formatMessage" type="string">The message to be formatted. It should contain {0}, {1} etc. for all the given params</param>
				/// <param name="params" type="Object" parameterArray="true">Provide the matching arguments for the format i.e {0}, {1} etc.</param>
				for (var args = arguments, i = args.length; --i;)
					formatMessage = formatMessage.replace(regexes[i - 1] || (regexes[i - 1] = RegExp("\\{" + (i - 1) + "\\}", "gm")), args[i]);
				return formatMessage;
			};
		}
	}
	///#DEBUG
	//>>excludeStart("WASSERT", true);
	if (typeof window != "undefined")
		window.WAssert = WAssert;
	function WAssert(trueishCondition, message, arg1, arg2, argEtc) {
		/// <summary>Returns an `assert function` if the condition is false an a `noop function` (a function which does nothing) if the condition is true. <br/>
		///  WAsserts will not be included in production code in anyways, hence the minifier will remove all the WAssert calls<br/><br/>
		///  You always need to call the WAssert function twice since the first call always returns a function i.e. WAssert(false, "{0} failed", "Condition")()
		/// </summary>
		/// <param name="trueishCondition" type="Boolean">The condition to be tested. It should be true so nothing happens, or false to assert the error message</param>
		/// <param name="message" type="String || Function">The message to be asserted. If passed a function it will be evaluated all the times, regardless of the condition</param>
		/// <param name="arg1" type="Object" optional="true">First argument to replace all of the {0} occurences from the message</param>
		/// <param name="arg2" type="Object" optional="true">Second argument to replace all of the {1} occurences from the message</param>
		/// <param name="argEtc" type="Object" optional="true" parameterArray="true">Third argument to replace all of the {3} occurences from the message.<br/> You can add as many arguments as you want and they will be replaced accordingly</param>
		if (typeof message === "function")
			message = message.apply(this, arguments) || "";
		if (typeof trueishCondition === "function" ? !trueishCondition.apply(this, arguments) : !trueishCondition) {
			var parameters = Array.prototype.slice.call(arguments, 1);
			var msg = typeof message == "string" ? String.format.apply(message, parameters) : message;
			return typeof console != "undefined" && !console.__throwErrorOnAssert && console.assert && console.assert.bind && console.assert.bind(console, trueishCondition, msg) || function consoleAssertThrow() { throw new Error(msg); };
		}
		return __;
	};
	//>>excludeEnd("WASSERT");
	///#ENDDEBUG

	var Function_prototype = Function.prototype;
	var Array_prototype = Array.prototype;
	var Array_prototype_forEach = Array_prototype.forEach;
	var Object_defineProperty = Object.defineProperty;
	var Object_defineProperties = typeof Object.defineProperties === "function"
	var supportsProto = {};

	supportsProto = supportsProto.__proto__ === Object.prototype;
	if (supportsProto) {
		try {
			supportsProto = {};
			supportsProto.__proto__ = { Object: 1 };
			supportsProto = supportsProto.Object === 1;//setting __proto__ in firefox is terribly slow!
		} catch (ex) { supportsProto = false; }
	}
	/* IE8 and older hack! */
	if (typeof Object.getPrototypeOf !== "function")
		Object.getPrototypeOf = supportsProto
			? function get__proto__(object) {
				return object.__proto__;
			}
			: function getConstructorHack(object) {
				// May break if the constructor has been tampered with
				return object == null || !object.constructor || object === Object.prototype ? null :
					(object.constructor.prototype === object ?
					Object.prototype
					: object.constructor.prototype);
			};
	function __() { };
	//for ancient browsers - polyfill Array.prototype.forEach
	if (!Array_prototype_forEach) {
		Array_prototype.forEach = Array_prototype_forEach = function forEach(fn, scope) {
			for (var i = 0, len = this.length; i < len; ++i) {
				fn.call(scope || this, this[i], i, this);
			}
		}
	}

	Function_prototype.fastClass = function fastClass(creator, mixins) {
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter
		///<br/><br/>
		/// var Square = Figure.fastClass(function(base, baseCtor) { <br/>
		/// ___ this.constructor = function(name) { //the cosntructor can be optional <br/>
		/// ______ baseCtor.call(this, name); //call the baseCtor <br/>
		/// ___ };<br/>
		/// ___ this.draw = function() {  <br/>
		/// ______ return base.call(this, "square"); //call the base class prototype's method<br/>
		/// ___ };<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Function">function(base, baseCtor) { this.constructor = function() {..}; this.method1 = function() {...}... }<br/>where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .fastClass on</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>

		//this == constructor of the base "Class"
		var baseClass = this;
		var base = this.prototype;
		creator = creator || function fastClassCreator() { this.constructor = function fastClassCtor() { return baseClass.apply(this, arguments) || this; } };
		creator.prototype = base;

		//creating the derrived class' prototype
		var derrivedProrotype = new creator(base, this);
		var Derrived;
		//did you forget or not intend to add a constructor? We'll add one for you
		if (!derrivedProrotype.hasOwnProperty("constructor"))
			derrivedProrotype.constructor = function fastClassDefaultConstructor() { return baseClass.apply(this, arguments) || this; }
		Derrived = derrivedProrotype.constructor;
		//setting the derrivedPrototype to constructor's prototype
		Derrived.prototype = derrivedProrotype;

		///#DEBUG
		//>>excludeStart("WASSERT", true);
		WAssert(false, !isNode && window.intellisense && function WAssertRedirectDefinition() {
			//trigger intellisense on VS2012 when pressing F12 (go to reference) to go to the creator rather than the defaultCtor
			var creatorResult = derrivedProrotype;
			intellisense.redirectDefinition(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : creator);
			intellisense.annotate(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : baseCtor);
			creatorResult.constructor = Derrived;//ensure we're forwarding deep base classes constructor's XMLDoc to inherited constructors if they don't provide one
			Object.getOwnPropertyNames(creatorResult).forEach(function (name) {
				var f = creatorResult[name];
				if (typeof f === "function") {
					intellisense.addEventListener('signaturehelp', function (event) {
						if (event.target != f) return;
						var args = [event.functionHelp];
						var p = baseClass.prototype;
						while (p != Object.prototype) {
							args.push(p.hasOwnProperty(name) ? p[name] : null);
							p = Object.getPrototypeOf(p);
						}
						intellisense.inheritXMLDoc.apply(null, args);
					});
				}
			});
		});
		//>>excludeEnd("WASSERT");
		///#ENDDEBUG 


		creator = null;//set the first parameter to null as we have already 'shared' the base prototype into derrivedPrototype in the creator function by setting creator.prototype = base on above
		arguments.length > 1 && Function_prototype.define.apply(Derrived, arguments);
		Derrived.constructor = Derrived;
		//returning the constructor
		return Derrived; 
	};

	Function_prototype.inheritWith = !supportsProto ? function inheritWith(creator, mixins) {
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter
		///<br/><br/>
		/// var Square = Figure.inheritWith(function(base, baseCtor) { <br/>
		/// ___ return { <br/>
		/// ______ constructor: function(name) { //the cosntructor can be optional <br/>
		/// _________ baseCtor.call(this, name); //explicitelly call the base class by name <br/>
		/// ______ },<br/>
		/// ______ draw: function() {  <br/>
		/// _________ return base.call(this, "square"); //explicitely call the base class prototype's  method by name <br/>
		/// ______ },<br/>
		/// ___ };<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Function">function(base, baseCtor) { return { constructor: function() {..}...} }<br/>where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .inheritWith on</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor passed into the object as parameter
		///<br/><br/>
		/// var Square = Figure.inheritWith({ <br/>
		/// ___ constructor: function(name) { //the cosntructor can be optional <br/>
		/// ______ Figure.call(this, name); //call the baseCtor <br/>
		/// ___ },<br/>
		/// ___ draw: function() {  <br/>
		/// ______ return Figure.prototype.call(this, "square"); //call the base class prototype's method<br/>
		/// ___ },<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Object">An object containing members for the new function's prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		var baseCtor = this;
		var creatorResult = (typeof creator === "function" ? creator.call(this, this.prototype, this) : creator) || {};
		var Derrived = creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : function inheritWithConstructor() {
			return baseCtor.apply(this, arguments) || this;
		}; //automatic constructor if ommited
		///#DEBUG
		//>>excludeStart("WASSERT", true);
		WAssert(false, !isNode && window.intellisense && function WAssertRedirectDefinition() {
			//trigger intellisense on VS2012 when pressing F12 (go to reference) to go to the creator rather than the defaultCtor
			intellisense.redirectDefinition(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : creator);
			intellisense.annotate(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : baseCtor);
			creatorResult.constructor = Derrived;//ensure we're forwarding deep base classes constructor's XMLDoc to inherited constructors if they don't provide one
			Object.getOwnPropertyNames(creatorResult).forEach(function (name) {
				var f = creatorResult[name];
				if (typeof f === "function") {
					intellisense.addEventListener('signaturehelp', function (event) {
						if (event.target != f) return;
						var args = [event.functionHelp];
						var p = baseCtor.prototype;
						while (p != Object.prototype) {
							args.push(p.hasOwnProperty(name) ? p[name] : null);
							p = Object.getPrototypeOf(p);
						}
						intellisense.inheritXMLDoc.apply(null, args);
					});
				}
			});
			$.extend(true, creatorResult, new Derrived);
		});
		//>>excludeEnd("WASSERT");
		///#ENDDEBUG 
		var derrivedPrototype;
		__.prototype = this.prototype;
		Derrived.prototype = derrivedPrototype = new __;


		creator = creatorResult;//change the first parameter with the creatorResult
		Function_prototype.define.apply(Derrived, arguments);
		Derrived.constructor = Derrived;

		return Derrived;
	} :// when browser supports __proto__ setting it is way faster than iterating the object
	function inheritWithProto(creator, mixins) {
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter
		///<br/><br/>
		/// var Square = Figure.inheritWith(function(base, baseCtor) { <br/>
		/// ___ return { <br/>
		/// ______ constructor: function(name) { //the cosntructor can be optional <br/>
		/// _________ baseCtor.call(this, name); //explicitelly call the base class by name <br/>
		/// ______ },<br/>
		/// ______ draw: function() {  <br/>
		/// _________ return base.call(this, "square"); //explicitely call the base class prototype's  method by name <br/>
		/// ______ },<br/>
		/// ___ };<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Function">function(base, baseCtor) { return { constructor: function() {..}...} }<br/>where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .inheritWith on</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor passed into the object as parameter
		///<br/><br/>
		/// var Square = Figure.inheritWith({ <br/>
		/// ___ constructor: function(name) { //the cosntructor can be optional <br/>
		/// ______ Figure.call(this, name); //call the baseCtor <br/>
		/// ___ },<br/>
		/// ___ draw: function() {  <br/>
		/// ______ return Figure.prototype.call(this, "square"); //call the base class prototype's method<br/>
		/// ___ },<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Object">An object containing members for the new function's prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		var baseCtor = this;
		var creatorResult = (typeof creator === "function" ? creator.call(this, this.prototype, this) : creator) || {};
		var Derrived = creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : function inheritWithProtoDefaultConstructor() {
			return baseCtor.apply(this, arguments) || this;
		}; //automatic constructor if ommited
		///#DEBUG
		//>>excludeStart("WASSERT", true);
		WAssert(false, !isNode && window.intellisense && function WAssertRedirectDefinition() {
			//trigger intellisense on VS2012 when pressing F12 (go to reference) to go to the creator rather than the defaultCtor
			intellisense.logMessage("cucu rucu");
			creatorResult.cucu = 1;
			intellisense.redirectDefinition(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : creator);
			intellisense.annotate(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : baseCtor);
			creatorResult.constructor = Derrived;//ensure we're forwarding deep base classes constructor's XMLDoc to inherited constructors if they don't provide one
			Object.getOwnPropertyNames(creatorResult).forEach(function (name) {
				var f = creatorResult[name];
				if (typeof f === "function") {
					intellisense.addEventListener('signaturehelp', function (event) {
						if (event.target != f) return;
						var args = [event.functionHelp];
						var p = baseCtor.prototype;
						while (p != Object.prototype) {
							args.push(p.hasOwnProperty(name) ? p[name] : null);
							p = Object.getPrototypeOf(p);
						}
						intellisense.inheritXMLDoc.apply(null, args);
					});
				}
			});
			$.extend(true, creatorResult, new Derrived);
		});
		//>>excludeEnd("WASSERT");
		///#ENDDEBUG 
		Derrived.prototype = creatorResult;
		creatorResult.__proto__ = this.prototype;
		creator = null;//set the first parameter to null as we have already 'shared' the base prototype into creatorResult by using __proto__
		arguments.length > 1 && Function_prototype.define.apply(Derrived, arguments);
		Derrived.constructor = Derrived;
		return Derrived;
	};
	Function_prototype.define = function define(prototype, mixins) {
		/// <summary>Define members on the prototype of the given function with the custom methods and fields specified in the prototype parameter.</summary>
		/// <param name="prototype" type="Function || Plain Object">{} or function(prototype, ctor) {}<br/>A custom object with the methods or properties to be added on Extendee.prototype<br/><br/>
		/// You can sepcify enumerable: false, which will define the members as non-enumerable making use of Object.defineProperty(this, key, {enumerable: false, value: copyPropertiesFrom[key]})
		///</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to this function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		var constructor = this;
		var extendeePrototype = this.prototype;
		var creatorResult = prototype;
		var key, enumerable;
		if (prototype) {
			if (typeof prototype === "function")
				prototype = prototype.call(extendeePrototype, this.prototype, this);
			if (prototype.enumerable === false) {
				for (key in prototype)
					if (key !== 'enumerable')
						Object.defineProperty(extendeePrototype, key, { enumerable: false, value: prototype[key] });
			}
			else for (key in prototype)
				extendeePrototype[key] = prototype[key];
		}
		prototype = null;
		//intellisense.logMessage("defining....");
		(arguments.length > 2 || mixins) && (extendeePrototype.hasOwnProperty("__mixins__") || (Object_defineProperties ? (Object_defineProperty(extendeePrototype, "__mixins__", { enumerable: false, value: [], writeable: false }).__mixins__.__hidden = true) : extendeePrototype.__mixins__ = [])) && Array_prototype_forEach.call(arguments, function forEachMixin(mixin, index, mixinValue, isFunction) {
			isFunction = typeof mixin === 'function';
			if (isFunction) {
				__.prototype = mixin.prototype;
				mixinValue = new mixin(extendeePrototype, constructor);
			}
			else mixinValue = mixin;
			if (mixinValue) {
				//store the functions in the __mixins__ member on the prototype so they will be called on Function.initMixins(instance) function
				isFunction && extendeePrototype.__mixins__.push(mixin);
				//copy the prototype members from the mixin.prototype to extendeePrototype so we are only doing this once
				for (var key in mixinValue)
					if (key != "constructor" && key != "prototype") {
						//intellisense.logMessage("injecting " + key + " into " + extendeePrototype.name);
						///#DEBUG
						//>>excludeStart("WASSERT", true);
						WAssert(true, function WAssertInjecting() {
							//trigger intellisense on VS2012 for mixins
							if (key in extendeePrototype) {
								//allow abastract members on class/mixins so they can be replaced
								if (extendeePrototype[key] && extendeePrototype[key].abstract)
									return;
								var msg = "The '{0}' mixin defines a '{1}' named '{2}' which is already defined on the class {3}!"
									.format(isFunction && mixin.name || (index - 1), typeof mixinValue[key] === "function" ? "function" : "member", key, constructor.name ? ("'" + constructor.name + "'") : '');
								console.log(msg)
								!isNode && window.intellisense && intellisense.logMessage(msg);
								throw new Error(msg);
							}
							//set a custom glyph icon for mixin functions
							if (typeof mixinValue[key] === "function" && mixin != mixinValue[key] && mixin != constructor && mixin !== extendeePrototype) {
								mixinValue[key].__glyph = "GlyphCppProject";
							}
						});
						//>>excludeEnd("WASSERT");
						///#ENDDEBUG 
						extendeePrototype[key] = mixinValue[key];
					}
			}
		});
		///#DEBUG
		//>>excludeStart("WASSERT", true);
		WAssert(true, !isNode && window.intellisense && function WAssertExtending() {
			//trigger intellisense on VS2012 for base class members, because same as IE, VS2012 doesn't support __proto__
			//for (var i in extendeePrototype)
			//	if (!creatorResult.hasOwnProperty(i)) {
			//		creatorResult[i] = extendeePrototype[i];
			//	}
			//inject properties from the new constructor
			//extendeePrototype = {};
			//intellisense.logMessage("injecting ctor.properties into " + JSON.stringify(creatorResult) + /function (.*)\(.*\)/gi.exec(arguments.callee.caller.caller.caller.toString())[1])
			__.prototype = extendeePrototype;
			var proto = new __;
			constructor.call(proto);
			for (var i in proto) {
				//intellisense.logMessage(i)
				if (i !== "constructor")
					//if (proto.hasOwnProperty(i))
					if (!creatorResult.hasOwnProperty(i))
						creatorResult[i] = proto[i];
			}

		});
		//>>excludeEnd("WASSERT");
		///#ENDDEBUG 
		return this;
	}


	Function.define = function Function_define(func, prototype, mixins) {
		/// <signature>
		/// <summary>Extends the given func's prototype with provided members of prototype and ensures calling the mixins in the constructor</summary>
		/// <param name="func" type="Function">Specify the constructor function you want to define i.e. function() {}</param>
		/// <param name="prototype" type="Plain Object" optional="true">Specify an object that contain the functions or members that should defined on the provided func's prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the returned func's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		/// <signature>
		/// <summary>Extends the given constructor's prototype with provided members of prototype and ensures calling the mixins in the constructor</summary>
		/// <param name="prototype" type="Plain Object">Specify an object that contain the constructor and functions or members that should defined on the provided constructor's prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the returned func's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		var result;
		var constructor = func || function defineDefaultConstructor() { }; //automatic constructor if ommited
		var applyDefine = arguments.length > 1;
		if (typeof func !== "function") {
			constructor = func.hasOwnProperty("constructor") ? func.constructor : function constructorDefaultObjConstructor() { };

			constructor.prototype = func;
			///#DEBUG
			//>>excludeStart("WASSERT", true);
			WAssert(true, !isNode && window.intellisense && function WAssert() {
				//VS2012 intellisense don't forward the actual creator as the function's prototype b/c we want to "inject" constructor's members into it
				function clone() {
					for (var i in func)
						if (func.hasOwnProperty(i))
							this[i] = func[i];
				}
				clone.prototype = Object.getPrototypeOf(func);
				constructor.prototype = new clone;
			});
			//>>excludeEnd("WASSERT");
			///#ENDDEBUG 


			applyDefine = true;
		}
		else {
			func = prototype;
			prototype = null;
		}
		applyDefine && Function_prototype.define.apply(constructor, arguments);

		result = function defineInitMixinsConstructor() {
			// automatically call initMixins and then the first constructor
			Function.initMixins(this);
			return constructor.apply(this, arguments) || this;
		}
		//we are sharing constructor's prototype
		result.prototype = constructor.prototype;
		//forward the VS2012 intellisense to the given constructor function
		///#DEBUG
		//>>excludeStart("WASSERT", true);
		WAssert(true, !isNode && window.intellisense && function WAssert() {
			window.intellisense && intellisense.redirectDefinition(result, constructor);
		});
		//>>excludeEnd("WASSERT");
		///#ENDDEBUG 
		result.constructor = result.prototype.constructor = constructor.constructor = constructor.prototype.constructor = result;
		return result;
	};

	Function_prototype.defineStatic = function (copyPropertiesFrom) {
		/// <summary>Copies all the members of the given object, including those on its prototype if any, to this function (and not on its prototype)<br/>For extending this functions' prototype use .define()
		/// <param name="copyPropertiesFrom" type="Object">The object to copy the properties from<br/><br/>
		/// You can sepcify enumerable: false, which will define the members as non-enumerable making use of Object.defineProperty(this, key, {enumerable: false, value: copyPropertiesFrom[key]})</summary>
		/// </param>
		var key;
		if (typeof copyPropertiesFrom == "object")
			if (copyPropertiesFrom.enumerable === false) {
				for (key in copyPropertiesFrom)
					if (key !== 'enumerable')
					Object.defineProperty(this, key, { enumerable: false, configurable: true, value: copyPropertiesFrom[key] });
			}
			for (key in copyPropertiesFrom) {
				this[key] = copyPropertiesFrom[key];
			}
		return this;
	}
	function defaultAbstractMethod() {
		///#DEBUG
		//>>excludeStart("WASSERT", true);
		WAssert(false, "Not implemented")();
		//>>excludeEnd("WASSERT");
		///#ENDDEBUG 
	}
	defaultAbstractMethod.defineStatic({ abstract: true });
	Function.abstract = function (message, func) {
		/// <summary>Returns an abstract function that asserts the given message. Optionally you can add some code to happen before assertion too</summary>
		/// <param name="message" type="String || Function">The message to be thrown when the newly method will be called. <br/>Defaults to: Not implemented</param>
		/// <param name="func" type="Function" optional="true">Specify a custom function to be called before the assertion is thrown.</param>
		var result = message || func ? (function () {
			if (typeof message === "function")
				message.apply(this, arguments);
			if (typeof func === "function")
				func.apply(this, arguments);
			///#DEBUG
			//>>excludeStart("WASSERT", true);
			if (typeof message === "xstring")
				WAssert(false, message)();
			else defaultAbstractMethod();
			//>>excludeEnd("WASSERT");
			///#ENDDEBUG 

		}).defineStatic({ abstract: true }) : defaultAbstractMethod;

		///#DEBUG
		//>>excludeStart("WASSERT", true);
		WAssert(true, !isNode && window.intellisense && function () {
			if (result != defaultAbstractMethod) {
				if (typeof message === "function")
					intellisense.redirectDefinition(result, message);
				if (typeof func === "function")
					intellisense.redirectDefinition(result, func);
			}
		});
		//>>excludeEnd("WASSERT");
		///#ENDDEBUG 

		return result;
	}

	Function.initMixins = supportsProto ? function initMixins(objectInstance) {
		/// <signature>
		/// <summary>Initializes the mixins on all of the prototypes of the given object instance<br/>This should only be called once per object, usually in the first constructor (the most base class)</summary>
		/// <param name="objectInstance" type="Object">The object instance for which the mixins needs to be initialized</param>
		/// </signature>
		if (objectInstance && !objectInstance.__initMixins__) {
			var p = objectInstance, mixins, length, i, mixin, calledMixins = {};
			objectInstance.__initMixins__ = 1;
			///#DEBUG
			//>>excludeStart("WASSERT", true);
			WAssert(true, !isNode && window.intellisense && function WAssert() {
				//hide __initMixins from VS2012 intellisense
				objectInstance.__initMixins__ = { __hidden: true };
			});
			//>>excludeEnd("WASSERT");
			///#ENDDEBUG 
			while (p) {
				p = p.__proto__;
				if (p && p.hasOwnProperty("__mixins__") && (mixins = p.__mixins__) && (length = mixins.length))
					for (i = 0; mixin = mixins[i], i < length; i++) {
						//WAssert(true, window.intellisense && function WAssert() {
						//	//for correct VS2012 intellisense, at the time of mixin declaration we need to execute new mixin() rather than mixin.call(objectInstance, p, p.constructor) otherwise the glyph icons will look like they are defined on mixin / prototype rather than on the mixin itself
						//	if (!(mixin in calledMixins)) {
						//		calledMixins[mixin] = 1;
						//		new mixin(p, p.constructor);
						//	}
						//});
						if (!(mixin in calledMixins)) {
							calledMixins[mixin] = 1;
							mixin.call(objectInstance, p, p.constructor);
						}
					}
			}
			objectInstance.__initMixins__ = undefined;
		}
	}: function initMixinsWithoutProto(objectInstance) {
		/// <signature>
		/// <summary>Initializes the mixins on all of the prototypes of the given object instance<br/>This should only be called once per object, usually in the first constructor (the most base class)</summary>
		/// <param name="objectInstance" type="Object">The object instance for which the mixins needs to be initialized</param>
		/// </signature>
		if (objectInstance && !objectInstance.__initMixins__) {
			var p = objectInstance, mixins, length, i, mixin, calledMixins = {};
			objectInstance.__initMixins__ = 1;
			///#DEBUG
			//>>excludeStart("WASSERT", true);
			WAssert(true, !isNode && window.intellisense && function WAssert() {
				//hide __initMixins from VS2012 intellisense
				objectInstance.__initMixins__ = { __hidden: true };
			});
			//>>excludeEnd("WASSERT");
			///#ENDDEBUG 
			while (p) {
				p = Object.getPrototypeOf(p);
				if (p && p.hasOwnProperty("__mixins__") && (mixins = p.__mixins__) && (length = mixins.length))
					for (i = 0; mixin = mixins[i], i < length; i++) {
						//WAssert(true, window.intellisense && function WAssert() {
						//	//for correct VS2012 intellisense, at the time of mixin declaration we need to execute new mixin() rather than mixin.call(objectInstance, p, p.constructor) otherwise the glyph icons will look like they are defined on mixin / prototype rather than on the mixin itself
						//	if (!(mixin in calledMixins)) {
						//		calledMixins[mixin] = 1;
						//		new mixin(p, p.constructor);
						//	}
						//});
						if (!(mixin in calledMixins)) {
							calledMixins[mixin] = 1;
							mixin.call(objectInstance, p, p.constructor);
						}
					}
			}
			objectInstance.__initMixins__ = undefined;
		}
	};;

	if (Object_defineProperties) {
		var o = {
			0: [Function, "initMixins", "define", "abstract"],
			1: [Function_prototype, "fastClass", "inheritWith", "define", "defineStatic"]
		}
		for (var p in o)
			for (var props = o[p], obj = props[0], i = 1, prop; prop = props[i], i < props.length; i++) {
				Object_defineProperty(obj, prop, { enumerable: false, value: obj[prop] });
			}
	}

})();
////Uncomment this for a quick demo & self test
//////////////////OPTION 1: inheritWith////////////////////////
////Using Define: 
////Function.prototype.define(proto) copies the given value from proto to function.prototype i.e. A in this case

//////Aternative for Function.define we can do this:
////var A = function (val) {
////     Function.initMixins(this);// since this is a top function, we need to call initMixins to make sure they will be initialized.
////	this.val = val;
////}.define({
////	method1: function (x, y, z) {
////		this.x = x;
////		this.y = y;
////		this.z = z;
////	}
////});

////To define the top level (first) function there is a sugar (as well as the above alternative)
//var A = Function.define(function(val) {
//     // when we are definin a top function with Function.define we DON'T need to call initMixins because they will be called automatically for us
//	this.val = val;
//}, {
//	method1: function (x, y, z) {
//		this.x = x;
//		this.y = y;
//		this.z = z;
//	}
//});


////Follow derrivations using inheritWith

//var B = A.inheritWith(function (base, baseCtor) {
//	return {
//		constructor: function (val) { baseCtor.call(this, val) },
//		method1: function (y, z) {
//			base.method1.call(this, 'x', 'y', z);
//		}
//	};
//});

//var C = B.inheritWith(function (base, baseCtor) {
//	return {
//		constructor: function (val) { baseCtor.call(this, val) },
//		method1: function (z) {
//			base.method1.call(this, 'y', z);
//		}
//	};
//});

//var D = C.inheritWith(function (base, baseCtor) {
//	return {
//		constructor: function (val) { baseCtor.call(this, val) },
//		method1: function (z) {
//			base.method1.call(this, z);
//		}
//	};
//});


//selfTest();

//////////////////OPTION 2: fastClass////////////////////////
////Using Define:

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

////To define the top level (first) function there is a sugar (as well as the above alternative)
//var A = Function.define(function A(val) {
//     // when we are definin a top function with Function.define we DON'T need to call initMixins because they will be called automatically for us
//	this.val = val;
//}, {
//	method1: function (x, y, z) {
//		this.x = x;
//		this.y = y;
//		this.z = z;
//	}
//});


////Follow derrivations using fastClass
//var B = A.fastClass(function (base, baseCtor) {
//	this.constructor = function B(val) { baseCtor.call(this, val) };
//	this.method1 = function (y, z) {
//		base.method1.call(this, 'x', y, z);
//	}
//});
//var C = B.fastClass(function (base, baseCtor) {
//	this.constructor = function C(val) { baseCtor.call(this, val) };
//	this.method1 = function (z) {
//		base.method1.call(this, 'y', z);
//	};
//});

//var D = C.fastClass(function (base, baseCtor) {
//	this.constructor = function D(val) { baseCtor.call(this, val) };
//	this.method1 = function (z) {
//		base.method1.call(this, z);
//	};
//});

////selfTest();

//function selfTest() {
//	var a = new A("a");
//	a.method1("x", "y", "z");
//	console.assert(a.x == "x", "a.x should be set to 'x'");
//	console.assert(a.y == "y", "a.y should be set to 'y'");
//	console.assert(a.z == "z", "a.z should be set to 'z'");
//	var b = new B("b");
//	b.method1("y", "z");
//	console.assert(b.x == "x", "b.x should be set to 'x'");
//	console.assert(b.y == "y", "b.y should be set to 'y'");
//	console.assert(b.z == "z", "b.z should be set to 'z'");
//	var c = new C("c");
//	c.method1("z");
//	console.assert(c.x == "x", "c.x should be set to 'x'");
//	console.assert(c.y == "y", "c.y should be set to 'y'");
//	console.assert(c.z == "z", "c.z should be set to 'z'");

//	var d = new D("d");
//	d.method1("w");
//	console.assert(d.x == "x", "d.x should be set to 'x'");
//	console.assert(d.y == "y", "d.y should be set to 'y'");
//	console.assert(d.z == "w", "d.z should be set to 'w'");

//	var expecteds = {
//		"d instanceof A": true,
//		"d instanceof B": true,
//		"d instanceof C": true,
//		"d instanceof D": true,
//		"c instanceof A": true,
//		"c instanceof B": true,
//		"c instanceof C": true,
//		"b instanceof A": true,
//		"b instanceof B": true,
//		"b instanceof C": false,
//		"a instanceof A": true,
//		"a instanceof B": false,
//		"a instanceof C": false,
//"A.prototype.constructor === a.constructor && a.constructor === A.constructor": true,//this should not equal to A itself due to mixins base function
//"B.prototype.constructor === b.constructor && b.constructor === B && B == B.constructor": true,
//"C.prototype.constructor === c.constructor && c.constructor === C && B == B.constructor": true,
//"D.prototype.constructor === d.constructor && d.constructor === D && B == B.constructor": true,
//}
//	for (var expectedKey in expecteds) {
//		var expected = expecteds[expectedKey];
//		var actual = eval(expectedKey);//using eval for quick demo self test purposing -- using eval is not recommended otherwise
//		console.assert(!(expected ^ actual), expectedKey + " expected: " + expected + ", actual: " + actual);
//	}
//}
//console.log("If there are no asserts in the console then all tests have passed! yey :)")

////defining a mixin
//var Point = function Point() {
//	this.point = { x: 1, y: 2 };
//}.define({
//	x: function x(x) {
//		/// <param name="x" optional="true">Specify a value to set the point.x. Don't specify anything will retrieve point.x</param>
//		return arguments.length ? (this.point.x = x) && this || this : this.point.x;
//	},
//	y: function y(y) {
//		/// <param name="y" optional="true">Specify a value to set the point.y. Don't specify anything will retrieve point.y</param>
//		return arguments.length ? (this.point.y = y) && this || this : this.point.y;
//	}
//});

////referencing the mixin:
//var E = D.inheritWith(function (base, baseCtor) {
//	return {
//		//no constructor !! - it will be added automatically for us
//		method1: function (z) {
//			base.method1.call(this, z);
//		}
//	};
//}, Point//specifying zero or more mixins - comma separated
//);

//var e = new E();
//e.x(2);//sets e.point.x to 2
//console.log("mixin Point.x expected to return 2. Actual: ", e.x());//returns 2
