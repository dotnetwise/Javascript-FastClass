Javascript-FastClass
====================

Fast Javascript Inheritance 

*  <a href="http://jsperf.com/js-inheritance-performance/25" target="_blank"><code>Performance Tests</code></a>
*  <a href="http://jsperf.com/js-inheritance-performance/26" target="_blank"><code>Performance Tests among fastest only</code></a>

## Why?
Native Javascript Inheritance is a pin in the ass. Even if you understand it perfectly it still requires some hidous repetivie code.

There are a lot of libraries which aims to help you with such that, but the main question is:
What is <a href="http://jsperf.com/js-inheritance-performance/25" target="_blank"><code>the fastest</code></a> vs <a target="_blank" href="https://github.com/njoubert/inheritance.js/blob/master/INHERITANCE.md"><code>most convenient</code></a> to create <a href="http://msdn.microsoft.com/en-us/magazine/ff852808.aspx" target="_blank"><code>Prototypal Inheritance</code></a> with?

## When?
You do need this library when you can't use a language that [`compiles`](https://github.com/jashkenas/coffee-script/wiki/List-of-languages-that-compile-to-JS){:target="_blank"} into javascript

## What?
FastClass is a very tiny library (<0.5KB minified and gzipped) that helps you quickly derrive your `classes` so to speak. 
It comes into two flavours:
* [`Function.prototype.fastClass(creator)`](#fastClass-flavour) - fastest, does not iterate the members when creates the derrived function
* [`Function.prototype.inheritWith(creator)`](#inheritWith-flavour) - a little bit slower as it iterates the members `for (var i in newPrototype)` of the new prototype
In both cases creator should be a function that looks like this:
```javascript
function(base, baseCtor) { return ... }
```
whereas `baseCtor` is the function we want to inherit and base is it's prototype (`baseCtor.prototype` that is).

## How?

A classical example to use inheritance when you have a `base class` called `Figure` and a derrived class called `Square`.

The `base class`:
```javascript
var Figure = function() {
}
Figure.prototype.draw = function() { console.log("figure"); }
```


### `.fastClass` flvaour:

To define the `derrived class` Square:
```javascript
var Square = Figure.fastClass(function(base, baseCtor) {
    return function() {
        this.constructor = function(length) { 
          this.length = length;
          baseCtor.call(this);
        }
        this.draw = function() {
          console.log("square with length " + this.length);
          base.draw.call(this);
        }
    }   
})
```

### `.inheritWith` flvaour:

To define the `derrived class` Square:
```javascript
var Square = Figure.inheritWith(function(base, baseCtor) {
    return function() {
        return { 
          constructor:  function(length) { 
            this.length = length;
            baseCtor.call(this);
          },
          draw: function() {
            console.log("square with length " + this.length);
            base.draw.call(this);
          }
        }
    }   
})
```

As you can see in both cases the definition is pretty simple and very similar. 
However the `.inheritWith` flavour comes with about 15-25% <a href="http://jsperf.com/js-inheritance-performance/25" target="_blank"><code>performance cost</code></a> depending on the actual browser and number of members.

### Usage

Whichever flavour you have chosenm the usage code is the same. You need to use the constructors:
```javascript
var figure = new Figure(10);
figure.draw();
//figure
var square = new Square(10);
figure.draw(); 
//square with length 10
//figure
```

# Where?
Beside GitHub, you can download it as a <a href="http://nuget.org/packages/Javascript-FastClass/" target="_blank"><code>Nuget package</code></a> in Visual Studio from<a href="http://nuget.org/packages/Javascript-FastClass/" target="_blank"><code>here</code></a>
```javascript
Install-Package Javascript-FastClass
```

# How?
