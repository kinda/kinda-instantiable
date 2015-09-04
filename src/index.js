'use strict';

let KindaExtendable = require('kinda-extendable');
let pkg = require('../package.json');

let KindaInstantiable = KindaExtendable.extend('KindaInstantiable', pkg.version, function() {
  // class methods

  this.instantiate = function() {
    let obj = Object.create(this.prototype);
    if (this.initializer) this.initializer.apply(obj);
    return obj;
  };

  this.create = function(...args) {
    let obj = this.instantiate();
    if (this.creator) this.creator.apply(obj, args);
    return obj;
  };

  this.unserialize = function(...args) {
    let obj = this.instantiate();
    if (!this.unserializer) throw new Error('\'unserializer\' is undefined.');
    this.unserializer.apply(obj, args);
    return obj;
  };

  this.isClassOf = function(instance) {
    let klass = instance && instance.class;
    if (!klass) return false;
    if (!klass.isSameAsOrOlderThan) return false;
    if (klass.isSameAsOrOlderThan(this)) return true;
    if (!klass.superclasses) return false;
    let hasSuperclassSameAsOrOlderThan = klass.superclasses.some(superclass => {
      return superclass.isSameAsOrNewerThan(this);
    });
    if (hasSuperclassSameAsOrOlderThan) return true;
    return false;
  };

  // instance methods

  if (!this.prototype.hasOwnProperty('class')) {
    // since the 'class' property is not configurable, it cannot be overrided
    Object.defineProperty(this.prototype, 'class', {
      get() {
        return this.constructor;
      }
    });
  }

  this.prototype.serialize = function() {
    let klass = this.constructor;
    if (!klass.serializer) throw new Error('\'serializer\' is undefined.');
    return klass.serializer.apply(this);
  };

  this.prototype.toJSON = this.prototype.serialize;

  this.prototype.isInstanceOf = function(klass) {
    if (klass && klass.isClassOf) {
      return klass.isClassOf(this);
    } else {
      return false;
    }
  };
});

module.exports = KindaInstantiable;
