'use strict';

let assert = require('chai').assert;
let KindaInstantiable = require('./src');

suite('KindaInstantiable', function() {
  test('instantiation', function() {
    let Company = KindaInstantiable.extend('Company', function() {
      this.initializer = function() {
        this.employees = [];
      };
    });

    let company1 = Company.instantiate();
    assert.isArray(company1.employees);
    assert.strictEqual(company1.employees.length, 0);

    company1.employees.push('Jean Dupont');
    assert.strictEqual(company1.employees.length, 1);

    let company2 = Company.instantiate();
    assert.isArray(company2.employees);
    assert.strictEqual(company2.employees.length, 0);
    assert.strictEqual(company1.employees.length, 1);
  });

  test('creation with create()', function() {
    let Company = KindaInstantiable.extend('Company', function() {
      this.initializer = function() {
        this.employees = [];
      };

      this.creator = function(boss) {
        this.boss = boss;
      };
    });

    let company = Company.create('Pierre Durand');
    assert.isArray(company.employees);
    assert.strictEqual(company.boss, 'Pierre Durand');
  });

  test('creation with new', function() {
    let Company = KindaInstantiable.extend('Company', function() {
      this.creator = function(boss) {
        this.boss = boss;
      };
    });

    let company = new Company('Pierre Durand');
    assert.strictEqual(company.boss, 'Pierre Durand');
  });

  test('serialization', function() {
    let Person = KindaInstantiable.extend('Person', function() {
      this.initializer = function() {
        this._internalProperty = 'magic value';
      };

      this.creator = function(name, age, country) {
        this.name = name;
        this.age = age;
        this.country = country || 'Japan'; // default value
      };

      this.serializer = function() {
        return { name: this.name, age: this.age, country: this.country };
      };

      this.unserializer = function(json) {
        this.name = json.name;
        this.age = json.age;
        this.country = json.country;
      };
    });

    let person1 = Person.create('Jean Dupont', 32);
    assert.deepEqual(person1.serialize(), {
      name: 'Jean Dupont',
      age: 32,
      country: 'Japan'
    });
    assert.deepEqual(person1.toJSON(), { // 'toJSON' is an alias of 'serialize'
      name: 'Jean Dupont',
      age: 32,
      country: 'Japan'
    });

    let person2 = Person.unserialize({ name: 'Jean Dupont', age: 32 });
    assert.strictEqual(person2.name, 'Jean Dupont');
    assert.strictEqual(person2.age, 32);
    assert.isUndefined(person2.country); // 'creator' is not called in case of unserialization
    assert.strictEqual(person2._internalProperty, 'magic value'); // 'unserializer' should be called
  });

  test('get the class of an instance', function() {
    let Class = KindaInstantiable.extend('Class');

    let obj = Class.create();
    assert.strictEqual(obj.constructor, Class);
    assert.strictEqual(obj.class, Class); // 'class' is just an alias of 'constructor'
  });

  test('test if an instance belongs to a class', function() {
    let Class = KindaInstantiable.extend('Class');
    let OtherClassWithSameName = KindaInstantiable.extend('Class');
    let OtherClassWithDifferentName = KindaInstantiable.extend('OtherClass');

    let obj1 = Class.create();
    assert.isTrue(Class.isClassOf(obj1));
    assert.isTrue(obj1.isInstanceOf(Class));
    assert.isTrue(OtherClassWithSameName.isClassOf(obj1));
    assert.isFalse(OtherClassWithDifferentName.isClassOf(obj1));

    let Mixin = KindaInstantiable.extend('Mixin');
    let Subclass = Class.extend('Subclass', function() {
      this.include(Mixin);
    });

    let obj2 = Subclass.create();
    assert.isTrue(Subclass.isClassOf(obj2));
    assert.isTrue(Class.isClassOf(obj2));
    assert.isTrue(Mixin.isClassOf(obj2));
    assert.isFalse(OtherClassWithDifferentName.isClassOf(obj2));
  });
});
