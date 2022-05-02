import { Signal } from '@hmans/signal';

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function F() {};

      return {
        s: F,
        n: function n() {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function e(_e) {
          throw _e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function s() {
      it = it.call(o);
    },
    n: function n() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function e(_e2) {
      didErr = true;
      err = _e2;
    },
    f: function f() {
      try {
        if (!normalCompletion && it["return"] != null) it["return"]();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function entityIsArchetype(entity, query) {
  return query.every(function (name) {
    return name in entity;
  });
}

var Archetype = /*#__PURE__*/function () {
  /** A list of entities belonging to this archetype. */

  /** Listeners on this event are invoked when an entity is added to this archetype's index. */

  /** Listeners on this event are invoked when an entity is removed from this archetype's index. */
  function Archetype(query) {
    _classCallCheck(this, Archetype);

    _defineProperty(this, "entities", new Array());

    _defineProperty(this, "onEntityAdded", new Signal());

    _defineProperty(this, "onEntityRemoved", new Signal());

    this.query = query;
  }

  _createClass(Archetype, [{
    key: "indexEntity",
    value: function indexEntity(entity) {
      /* If the entity is of the archetype, it should be indexed by us. */
      var shouldBeIndexed = entityIsArchetype(entity, this.query);
      /* The entity might already be indexed by us, so let's check. */

      var isIndexed = entity.__miniplex.archetypes.includes(this);
      /* If the entity should be indexed, but isn't, add it. */


      if (shouldBeIndexed && !isIndexed) {
        entity.__miniplex.archetypes.push(this);

        this.entities.push(entity);
        this.onEntityAdded.emit(entity);
        return;
      }
      /* If the entity should not be indexed, but is, let's remove it. */


      if (!shouldBeIndexed && isIndexed) {
        this.entities.splice(this.entities.indexOf(entity, 0), 1);
        this.onEntityRemoved.emit(entity);

        var apos = entity.__miniplex.archetypes.indexOf(this, 0);

        entity.__miniplex.archetypes.splice(apos, 1);

        return;
      }
    }
  }, {
    key: "removeEntity",
    value: function removeEntity(entity) {
      var pos = this.entities.indexOf(entity, 0);

      if (pos >= 0) {
        this.entities.splice(pos, 1);
        this.onEntityRemoved.emit(entity);
      }
    }
  }]);

  return Archetype;
}();

function commandQueue() {
  var queue = new Array();

  function add(command) {
    queue.push(command);
  }

  function flush() {
    queue.forEach(function (fun) {
      return fun();
    });
    queue.length = 0;
  }

  function clear() {
    queue.length = 0;
  }

  return {
    add: add,
    flush: flush,
    clear: clear
  };
}
/**
 * Normalize a list of component names, removing blank/undefined component names and sorting the resulting list.
 */


function normalizeComponentList(names) {
  return names.filter(function (n) {
    return typeof n === "string" && n !== "";
  }).sort();
}
/**
 * Normalize an archetype by sorting the component names it references.
 */


function normalizeQuery(query) {
  return normalizeComponentList(query);
}
/**
 * A tag is just an "empty" component. For convenience and nicer type support, we're
 * providing a Tag type and constant, both of which are simply equal to `true`.
 */


var Tag = true;

var World = /*#__PURE__*/function () {
  function World() {
    var _this = this;

    _classCallCheck(this, World);

    _defineProperty(this, "entities", new Array());

    _defineProperty(this, "archetypes", new Map());

    _defineProperty(this, "unregisterEntity", function (entity) {
      delete entity.__miniplex;
      return entity;
    });

    _defineProperty(this, "createEntity", function () {
      var entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      for (var _len = arguments.length, extraComponents = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        extraComponents[_key - 1] = arguments[_key];
      }
      /* Mix in extra components into entity. */


      for (var _i = 0, _extraComponents = extraComponents; _i < _extraComponents.length; _i++) {
        var extra = _extraComponents[_i];
        Object.assign(entity, extra);
      }
      /* Mix in internal component into entity. */


      var registeredEntity = Object.assign(entity, {
        __miniplex: {
          id: _this.entities.length,
          world: _this,
          archetypes: []
        }
      });
      /* Store the entity... */

      _this.entities.push(registeredEntity);
      /* ...and add it to relevant indices. */


      _this.indexEntity(registeredEntity);

      return registeredEntity;
    });

    _defineProperty(this, "destroyEntity", function (entity) {
      var _entity$__miniplex;

      if (((_entity$__miniplex = entity.__miniplex) === null || _entity$__miniplex === void 0 ? void 0 : _entity$__miniplex.world) !== _this) return;
      /* Remove it from our global list of entities */

      _this.entities[entity.__miniplex.id] = null;
      /* Remove entity from all archetypes */

      var _iterator = _createForOfIteratorHelper(entity.__miniplex.archetypes),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var archetype = _step.value;
          archetype.removeEntity(entity);
        }
        /* Remove its miniplex component */

      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      _this.unregisterEntity(entity);
    });

    _defineProperty(this, "addComponent", function (entity) {
      var _entity$__miniplex2;
      /* Sanity check */


      if (((_entity$__miniplex2 = entity.__miniplex) === null || _entity$__miniplex2 === void 0 ? void 0 : _entity$__miniplex2.world) !== _this) {
        throw "Tried to add components to an entity that is not managed by this world.";
      }

      for (var _len2 = arguments.length, partials = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        partials[_key2 - 1] = arguments[_key2];
      }

      for (var _i2 = 0, _partials = partials; _i2 < _partials.length; _i2++) {
        var partial = _partials[_i2];

        for (var name in partial) {
          if (name in entity) {
            throw new Error("Component \"".concat(name, "\" is already present in entity. Aborting!"));
          }
          /* Set entity */


          entity[name] = partial[name];
        }
      }
      /* Trigger a reindexing of the entity */


      _this.indexEntity(entity);
    });

    _defineProperty(this, "removeComponent", function (entity) {
      var _entity$__miniplex3;

      for (var _len3 = arguments.length, components = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        components[_key3 - 1] = arguments[_key3];
      }

      if (((_entity$__miniplex3 = entity.__miniplex) === null || _entity$__miniplex3 === void 0 ? void 0 : _entity$__miniplex3.world) !== _this) {
        throw "Tried to remove ".concat(components, " from an entity that is not managed by this world.");
      }

      for (var _i3 = 0, _components = components; _i3 < _components.length; _i3++) {
        var name = _components[_i3];

        if (!(name in entity)) {
          throw "Tried to remove component \"".concat(name, " from an entity that doesn't have it.");
        }

        delete entity[name];
      }

      _this.indexEntity(entity);
    });

    _defineProperty(this, "queuedCommands", commandQueue());

    _defineProperty(this, "queue", {
      createEntity: function createEntity(entity) {
        _this.queuedCommands.add(function () {
          return _this.createEntity(entity);
        });
      },
      destroyEntity: function destroyEntity(entity) {
        _this.queuedCommands.add(function () {
          return _this.destroyEntity(entity);
        });
      },
      addComponent: function addComponent(entity) {
        for (var _len4 = arguments.length, partials = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          partials[_key4 - 1] = arguments[_key4];
        }

        _this.queuedCommands.add(function () {
          return _this.addComponent.apply(_this, [entity].concat(partials));
        });
      },
      removeComponent: function removeComponent(entity) {
        for (var _len5 = arguments.length, names = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
          names[_key5 - 1] = arguments[_key5];
        }

        _this.queuedCommands.add(function () {
          return _this.removeComponent.apply(_this, [entity].concat(names));
        });
      },
      flush: function flush() {
        _this.queuedCommands.flush();
      }
    });
  }

  _createClass(World, [{
    key: "archetype",
    value: function archetype() {
      for (var _len6 = arguments.length, query = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        query[_key6] = arguments[_key6];
      }

      var normalizedQuery = normalizeQuery(query);
      var stringifiedQuery = JSON.stringify(normalizedQuery);
      /* We may already have an archetype representing the same query */

      if (this.archetypes.has(stringifiedQuery)) {
        return this.archetypes.get(stringifiedQuery);
      }
      /* Once we reach this point, we need to create a new archetype... */


      var archetype = new Archetype(normalizedQuery);
      this.archetypes.set(stringifiedQuery, archetype);
      /* ...and refresh the indexing of all our entities. */

      var _iterator2 = _createForOfIteratorHelper(this.entities),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var entity = _step2.value;
          if (entity) archetype.indexEntity(entity);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return archetype;
    }
  }, {
    key: "indexEntity",
    value: function indexEntity(entity) {
      /*
      We absolutely never want to add entities to our indices that are not actually
      part of this world, so let's do a sanity check.
      */
      if (entity.__miniplex.world !== this) return;

      var _iterator3 = _createForOfIteratorHelper(this.archetypes.values()),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var archetype = _step3.value;
          archetype.indexEntity(entity);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
    /* MUTATION FUNCTIONS */

  }, {
    key: "clear",
    value:
    /**
     * Clear the entire world by discarding all entities and indices.
     */
    function clear() {
      /* Remove all entities */
      this.entities.length = 0;
      /* Remove all archetype indices */

      this.archetypes.clear();
      /* Clear queue */

      this.queuedCommands.clear();
    }
  }]);

  return World;
}();

export { Archetype, Tag, World };
