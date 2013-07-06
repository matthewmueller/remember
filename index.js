/**
 * Module Dependencies
 */

var query = require('query'),
    delegate = require('delegate'),
    bind = require('bind'),
    unique = require('unique-selector'),
    store = require('store');

/**
 * Selectors
 */

var inputs = 'input, textarea',
    buttons = 'input[type=checkbox], input[type=radio]';

/**
 * Regex
 */

var rbutton = /radio|checkbox/;
var rclass = /\.\w+/g;

/**
 * Expose `Remember`
 */

module.exports = Remember;

/**
 * Remember
 *
 * @param {Object} options
 * @return {Remember}
 * @api public
 */

function Remember(options) {
  if(!(this instanceof Remember)) return new Remember(options);
  options = options || {};
  this.excepts = [];
  this.ids = {};
  var self = this;

  // localstorage namespace
  this.namespace = options.namespace || 'remember:';

  // pull from storage
  this.pull();

  this.oninput = bind(this, this.input);
  this.onselect = bind(this, this.select);

  // bindings
  delegate.bind(document, inputs, 'input', this.oninput);
  delegate.bind(document, buttons, 'click', this.onselect);
}

/**
 * Except
 *
 * @param {String} str
 * @return {Remember}
 */

Remember.prototype.except = function(str) {
  var els = query.all(str),
      excepts = this.excepts;

  for (var i = 0, len = els.length; i < len; i++) {
    this.excepts.push(els[i]);
  }

  return this;
};

/**
 * Manipulate each stored item
 *
 * @return {Remember}
 * @api private
 */

Remember.prototype.each = function(fn) {
  var obj = store.getAll(),
      ns = this.namespace;

  for(var key in obj) {
    if(~key.indexOf(ns)) fn.call(this, key);
  }

  return this;
};

/**
 * Clear remember
 *
 * @return {Remember}
 * @api public
 */

Remember.prototype.clear = function() {
  this.each(function(key) {
    store.remove(key);
  });
};

/**
 * Unbind all inputs
 *
 * @return {Remember}
 * @api public
 */

Remember.prototype.unbind = function() {
  delegate.unbind(document, inputs, this.oninput);
  delegate.unbind(document, buttons, this.onselect);
};

/**
 * Pull in values from localstorage
 *
 * @return {Remember}
 * @api private
 */

Remember.prototype.pull = function() {
  var self = this;
  var ns = this.namespace;

  this.each(function(key) {
    var k = key.slice(ns.length);
    var val = store.get(key);
    this.ids[key] = setInterval(function() {
      self.fill(k, val);
    }, 200);
  });

  return this;
};

/**
 * Find and fill in elements
 *
 * @return {Remember}
 * @api private
 */

Remember.prototype.fill = function(sel, val) {
  var el = document.querySelector(sel);
  if(!el) return;

  if (rbutton.test(el.type)) {
    if (val) el.setAttribute('checked', 'checked');
    else el.removeAttribute('checked');
    dispatch(el, 'change');
  } else if (el.value !== undefined) {
    el.value = val;
    dispatch(el, 'input');
    dispatch(el, 'blur');
  }

  clearInterval(this.ids[this.namespace + sel]);

  return this;
};

/**
 * input
 *
 * @param {Event} e
 * @return {Remember}
 * @api private
 */

Remember.prototype.input = function(e) {
  var el = e.target;
  if(~this.excepts.indexOf(el)) return this;

  var sel = unique(el),
      val = el.value,
      ns = this.namespace;

  // ignore classes, too transient
  sel = sel.replace(rclass, '');

  store.set(ns + sel, val);
};

/**
 * select
 *
 * @param {Event} e
 * @return {Remember}
 * @api private
 */

Remember.prototype.select = function(e) {
  var el = e.target;
  if(~this.excepts.indexOf(el)) return this;

  var sel = unique(el),
      checked = el.checked,
      ns = this.namespace;

  // ignore classes, too transient
  sel = sel.replace(rclass, '');

  // If it's a radio button, uncheck all the others
  if(el.name && 'radio' === el.type) {
    var set = query.all('input[type=radio][name=' + el.name + ']');
    for (var i = 0, len = set.length; i < len; i++) {
      if(set[i] !== el) {
        store.set(ns + unique(set[i]), !checked);
      }
    }
  }

  store.set(ns + sel, checked);
};

/**
 * Dispatch a synthetic event
 */

function dispatch(el, event) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(event, true, true);
  el.dispatchEvent(e);
}
