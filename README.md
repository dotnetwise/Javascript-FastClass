Javascript-FastClass
====================

Fast Javascript Inheritance 

*  <a href="http://jsperf.com/js-inheritance-performance/25" target="_blank"><code>Performance Tests</code></a>
*  <a href="http://jsperf.com/js-inheritance-performance/26" target="_blank"><code>Performance Tests among fastest only</code></a>

## Why?
Native Javascript Inheritance is a pin in the ass. Even if you understand it perfectly it still requires some hideous repetivie code.

There are a lot of libraries which aims to help you with such that, but the main question is:

What is <a href="http://jsperf.com/js-inheritance-performance/25" target="_blank"><code>the fastest</code></a> vs <a target="_blank" href="https://github.com/njoubert/inheritance.js/blob/master/INHERITANCE.md"><code>most convenient</code></a> to create <a href="http://msdn.microsoft.com/en-us/magazine/ff852808.aspx" target="_blank"><code>Prototypal Inheritance</code></a> with?

## When?
You do need this library when you can't use a language that <a href="https://github.com/jashkenas/coffee-script/wiki/List-of-languages-that-compile-to-JS" target="_blank"><code>compiles</code></a> into javascript.

e.g. <a href="https://developers.google.com/closure/" target="_blank">Google Closure</a>, <a href="http://www.typescriptlang.org/Playground/" target="_blank">TypeScript</a>, <a href="http://arcturo.github.com/library/coffeescript/03_classes.html" target="_blank">Coffee Script</a> etc.

## What?
FastClass is a very tiny library (<0.5KB minified and gzipped) that helps you quickly derrive your `classes` so to speak. 
It comes into two flavours:
* [`Function.prototype.fastClass(creator)`](#fastclass-flavour) - fastest, does not iterate the members when creates the derrived function
* [`Function.prototype.inheritWith(creator)`](#inheritwith-flavour) - a little bit slower as it iterates the members `for (var i in newPrototype)` of the new prototype
In both cases creator should be a function that looks like this:
```javascript
function(base, baseCtor) { return ... }
```
whereas `baseCtor` is the function we want to inherit and base is it's prototype *(`baseCtor.prototype` that is).*

## How?

The `base class`:
```javascript
var Figure = function(name) {
    this.name = name;
}
Figure.prototype.draw = function() { console.log("figure " + name); }
```

A classical example to use inheritance when you have a base class called `Figure` and a derrived class called `Square`.

### `.fastClass` flvaour:

To define the `derrived class` Square:
```javascript
var Square = Figure.fastClass(function(base, baseCtor) {
    return function() {
        this.constructor = function(name, length) { 
          this.length = length;
          baseCtor.call(this, name);
        }
        this.draw = function() {
          console.log("square with length " + this.length);
          base.draw.call(this);
        }
    }   
})
```

### `.inheritWith` flavour:

To define the `derrived class` Square:
```javascript
var Square = Figure.inheritWith(function(base, baseCtor) {
    return function() {
        return { 
          constructor:  function(name, length) { 
            this.length = length;
            baseCtor.call(this, name);
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

Whichever flavour you have chosen the usage code is the same. Firstly you need to instantiate the constructors with the `new` operator:
```javascript
var figure = new Figure("generic");
figure.draw();
//figure generic
var square = new Square("10cm square", 10);
figure.draw(); 
//square with length 10
//figure 10cm square
```

### Some gems
Although it could hurt `hard-core performance` in real live it doesn't feel much of a difference betweeen `.innerWith` and `.fastClass` upon same browser. 
Between different browsers is a whole different story.

However, for those cases where you don't count every performance bit then you can also define de primary function like this:
```javascript
var A = function(name) { 
    this.name = name; 
}.define({
    draw: function() {
        console.log("figure "+ this.name);
    }
}) 
```

The `define` function sets all the members of the provided object to the `function.prorortpe` *(`A.prototype` that is)* and returns it *(`A` that is)*


## Where?
Beside GitHub, you can download it as a <a href="http://nuget.org/packages/Javascript-FastClass/" target="_blank"><code>Nuget package</code></a> in Visual Studio from<a href="http://nuget.org/packages/Javascript-FastClass/" target="_blank"><code>here</code></a>
```javascript
Install-Package Javascript-FastClass
```

## What's next?
Do you have a better & faster way? Share it! We would love to seeing creativity in action!
