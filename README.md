Javascript-fastClass
====================
A faster and easier way to define Javascript Prototypal Inheritance: `classes` and `mixins`


## Performance tests
*  Among <a href="http://jsperf.com/js-inheritance-performance/36" target="_blank"><code>popular libraries define + usage</code></a> - 3 classes and 3 methods * 500 instances each
*  <a href="http://jsperf.com/js-inheritance-performance/35" target="_blank"><code>Fastest libraries define + usage</code></a> - 3 classes and 3 methods * 500 instances each
*  <a href="http://jsperf.com/js-inheritance-performance/34" target="_blank"><code>Fastest libraries define only</code></a> - 3 classes and 3 methods * 1 instances each

<div align="center">
<img src="../../wiki/images/NugetIcon.png"/>
</div>

## Why yet another library?
Native javascript inheritance is a pin in the ass. Even if you understand it perfectly it still requires some hideous repetivie code.

There are a lot of libraries which aim to help you with such that, but the main question is:

What is <a href="http://jsperf.com/js-inheritance-performance/36" target="_blank"><code>the fastest</code></a> vs <a target="_blank" href="https://github.com/njoubert/inheritance.js/blob/master/INHERITANCE.md"><code>most convenient</code></a> (also known as: with the most `[sugar](http://en.wikipedia.org/wiki/Syntactic_sugar)`) to create <a href="http://msdn.microsoft.com/en-us/magazine/ff852808.aspx" target="_blank"><code>Prototypal Inheritance</code></a> with?

## When to use it?
You do need this library when you can't use a language that <a href="https://github.com/jashkenas/coffee-script/wiki/List-of-languages-that-compile-to-JS" target="_blank"><code>compiles</code></a> into javascript code.

e.g. <a href="https://developers.google.com/closure/" target="_blank">Google Closure</a>, <a href="http://www.typescriptlang.org/Playground/" target="_blank">TypeScript</a>, <a href="http://arcturo.github.com/library/coffeescript/03_classes.html" target="_blank">Coffee Script</a> etc.

## What is it? 
FastClass is a very tiny library (~0.7KB minified and gzipped) that helps you quickly derrive your `classes` so to speak. 
It comes in two flavours:
* [`Function.prototype.fastClass(creator)`](#fastclass-flavour) - sets the `Base.prototype` to the `creator` function
```javascript
function(base, baseCtor) { this.somePrototypeMethod1 =  ...; this.somePrototypeMethod2 =  ...; } }
```

* [`Function.prototype.inheritWith(creator)`](#inheritwith-flavour) - **recommended** returns a `plain object` containing the members of the new prototype, including the constructor itself

It makes usage of __proto__ on all new browsers (which makes it blazing fast) except `Internet Explorer` and maybe other ancient browsers where it fallbacks to `for (var key in obj)` statement.

Note `__proto__` will become standard in <a href="http://javascript.spec.whatwg.org/#object.prototype.__proto__" target="_blank">ECMAScript 6</a>
```javascript
function(base, baseCtor) { return { somePrototypeMethod1: ..., somePrototypeMethod2: ...} }
```
whereas `baseCtor` is the function we want to inherit and base is it's prototype *(`baseCtor.prototype` that is).*

## How to use it?

### The base "class"
```javascript
var Figure = function(name) {
    this.name = name;
}
Figure.prototype.draw = function() { console.log("figure " + name); }
```

### `.define` sugar

You can define the first `class' constructor function` (same as above but with sugar syntax) as following:

```javascript
var A = function(name) { 
    this.name = name; 
}.define({
    draw: function() {
        console.log("figure "+ this.name);
    }
}) 
```

The `define` function copies all the members of the returned object to the `function.prorortpe` *(`A.prototype`)* and returns it *(`A`)*


### Inheritance

A classical example to use inheritance when you have a base class called `Figure` and a derrived class called `Square`.

#### `.fastClass` flvaour

To define the `derrived class` Square:
```javascript
var Square = Figure.fastClass(function(base, baseCtor) {
    this.constructor = function(name, length) { 
      this.length = length;
      baseCtor.call(this, name);//calls the bacse ctor
    }
    this.draw = function() {//redefines the draw function
      console.log("square with length " + this.length);
      base.draw.call(this);//calls the base class' draw function
    }
})
```

#### `.inheritWith` flavour 

To define the `derrived class` Square:
```javascript
var Square = Figure.inheritWith(function(base, baseCtor) {
    return { 
        constructor:  function(name, length) { 
            this.length = length;
            baseCtor.call(this, name);//calls the bacse ctor
        },
        draw: function() {//redefines the draw function
            console.log("square with length " + this.length);
            base.draw.call(this);//calls the base class' draw function
        }
    }
})
```

As you can see in both cases the definition is pretty simple and very similar. 

However the `.inheritWith` flavour comes with about 5-15% <a href="http://jsperf.com/js-inheritance-performance/34" target="_blank"><code>performance boost</code></a> depending on the actual browser and number of members.
That is because we are simply setting `__proto__` with the BaseClass.prototype for those browsers who support it (all nowdays browsers except `IE<=10`)

### The constructor
In both cases we the `constructor` is the function that is returned as the `derrived class' constructor`. 
The `constructor` is optional and we should only add it when we have some custom code as both functions will add it for us otherswise.

#### Usage

Whichever flavour you choose the code usage is the same. Firstly you need to instantiate the Constructor with the `new` operator:
```javascript
var figure = new Figure("generic");
figure.draw();
//figure generic
var square = new Square("10cm square", 10);
figure.draw(); 
//square with length 10
//figure 10cm square
```

## Mixins support
<a href="http://www.joezimjs.com/javascript/javascript-mixins-functional-inheritance/" target="_blank">Mixins</a> are some grouped functionalities that you can add to a `class` without inheritance

You can <a href="http://programmers.stackexchange.com/questions/123342/inheritance-vs-mixins-in-dynamic-languages" target="_blank">learn more</a> about `mixins` vs `inheritance` on <a href="http://programmers.stackexchange.com/questions/123342/inheritance-vs-mixins-in-dynamic-languages" target="_blank">this post</a>.

#### Example

```javascript
// Animal base class
function Animal() {
    // Private
    function private1(){}
    function private2(){}

    // Privileged - on instance
    this.privileged1 = function(){}
    this.privileged2 = function(){}
}.define({ 
    // Public - on prototype
    method1: function(){}
});
```

Alternatively the above can be defined as:
```javascript
var Animal = Function.fastClass(function(){
    // Private 
    function private1() {}
    function private2() {}
    return {
        constructor: function() {
            // Privileged - on instance
            this.privileged1 = function(){}
            this.privileged2 = function(){}
        },
        method1: function() { console.log("Animal::method1"); }
    };
});
```

The `function Animal` method acts as the constructor, which is invoked when an instance is created:

```javascript
var animal = new Animal(); // Create a new Animal instance
```

### Mixins

We can typically define a `move` action which is a set of methods grouped in our `Move mixin`
```javascript
function move() {//define the constructor of the mixin. This will be automatically called for every instance in the constructor of the class that is using this mixin
    this.position = { x: 0, y: 0};
}.define({//define mixin's prototype. These will be copied to the prototype of the classes that will use this `mixin`
   moveTo: function(x, y) {
       this.position.x = x;
       this.position.y = y;
   },
   resetPosition: function() {
       this.position.x = 0; 
       this.position.y = 0;
   },
   logPosition: function() {
       console.log("Position: ", this.position);
   }
});
```

### Inheritance

#### Usage using `.inheritWith` flavour

`[[constructor]].inheritWith( function(base, baseCtor) { return {...} }, mixins )` - that function should `return` methods for the derrived prototype

#### Example
```javascript
// Extend the Animal class with inheritWith flavor
var Dog = Animal.inheritWith(function(base, baseCtor) {
    //derrived class containing some private method(s)
    function someOtherPrivateMethod() { }
    
    return {
        // Override base class `method1`
        method1: function(){
            someOtherPrivateMethod.call(this);
            base.method1.call(this);//calling a methd from the base class: Animal.prtotype.method1
            console.log('Dog::method1');
        },
        scare: function(){
            console.log('Dog::I scare you');
        },
        //some new public method(s)
        method2: function() { }
    }
}, move);//specify any extra mixins to be added to the Dog's prototype
```

Create an instance of `Dog`:

```javascript
var husky = new Dog();
husky.method1(); 
// Animal::method1
// Dog::method1

husky.scare();
// Dog::I scare you'


/// testing the mixin:
husky.logPosition(); // Call the method of the mixin. 
// Position: {x: 0, y: 0}

husky.moveTo(10, 20);  
husky.logPosition();
// Position: {x: 10, y: 20}

husky.resetPosition();
husky.logPosition();
// Position: {x: 0, y: 0}
```

#### Same as above using `.fastClass` flavour

`[[constructor]].fastClass( function(base, baseCtor) { this.m = function {...} ... } )` - that function `populates` the derrived prototype
Every class definition has access to the parent's prototype via the first argument passed into the function. The second argument is the `base Class` itself (its constructor i.e. `Animal` in our case):

```javascript
// Same as above but Extend the Animal class using fastClass flavor
var Dog = Animal.fastClass(function(base, baseCtor) {
    //private functions
    function someOtherPrivateMethod() {};
    
    //since we don't set this.constructor, automatically will be added one for us which will call the baseCtor with all the provided arguments
    //this is importat so we can set the new prototype into it
    
    // Override base class `method1`
    this.method1 = function(){
        someOtherPrivateMethod.call(this);
        // Call the parent function
        base.method1.call(this);
        console.log('Dog::method1');
    };
    this.scare = function(){
        console.log('Dog::I scare you');
    };
    //some more public functions
    this.method2 = function() {}; 
});
```

## Where to get it from?
Beside GitHub, you can download it as a <a href="http://nuget.org/packages/Javascript-FastClass/" target="_blank"><code>Nuget package</code></a> in Visual Studio from<a href="http://nuget.org/packages/Javascript-FastClass/" target="_blank"><code>here</code></a>
```javascript
Install-Package Javascript-FastClass
```

## What's next?
* [Private methods support!](../../wiki/Private-Methods)
* [Self test](../../wiki/Self-Test)
* Mixins - to be added

Do you have a better & faster way? Share it! We would love to seeing creativity in action!

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/ced79a6263a52ce6aed7515d0cd0b0f3 "githalytics.com")](http://githalytics.com/dotnetwise/Javascript-FastClass)
