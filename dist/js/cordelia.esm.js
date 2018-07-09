/*!
 *   Cordelia color picker
 *   version: 1.0.1
 *    author: Cevad Tokatli <cevadtokatli@hotmail.com>
 *   website: http://cevadtokatli.com
 *    github: https://github.com/cevadtokatli/cordelia-vue
 *   license: MIT
 */

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var es6Promise = createCommonjsModule(function (module, exports) {
  /*!
   * @overview es6-promise - a tiny implementation of Promises/A+.
   * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
   * @license   Licensed under MIT license
   *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
   * @version   v4.2.4+314e4831
   */

  (function (global, factory) {
    module.exports = factory();
  })(commonjsGlobal, function () {

    function objectOrFunction(x) {
      var type = typeof x === 'undefined' ? 'undefined' : _typeof(x);
      return x !== null && (type === 'object' || type === 'function');
    }

    function isFunction(x) {
      return typeof x === 'function';
    }

    var _isArray = void 0;
    if (Array.isArray) {
      _isArray = Array.isArray;
    } else {
      _isArray = function _isArray(x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    }

    var isArray = _isArray;

    var len = 0;
    var vertxNext = void 0;
    var customSchedulerFn = void 0;

    var asap = function asap(callback, arg) {
      queue[len] = callback;
      queue[len + 1] = arg;
      len += 2;
      if (len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (customSchedulerFn) {
          customSchedulerFn(flush);
        } else {
          scheduleFlush();
        }
      }
    };

    function setScheduler(scheduleFn) {
      customSchedulerFn = scheduleFn;
    }

    function setAsap(asapFn) {
      asap = asapFn;
    }

    var browserWindow = typeof window !== 'undefined' ? window : undefined;
    var browserGlobal = browserWindow || {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

    // node
    function useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function () {
        return process.nextTick(flush);
      };
    }

    // vertx
    function useVertxTimer() {
      if (typeof vertxNext !== 'undefined') {
        return function () {
          vertxNext(flush);
        };
      }

      return useSetTimeout();
    }

    function useMutationObserver() {
      var iterations = 0;
      var observer = new BrowserMutationObserver(flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function () {
        node.data = iterations = ++iterations % 2;
      };
    }

    // web worker
    function useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = flush;
      return function () {
        return channel.port2.postMessage(0);
      };
    }

    function useSetTimeout() {
      // Store setTimeout reference so es6-promise will be unaffected by
      // other code modifying setTimeout (like sinon.useFakeTimers())
      var globalSetTimeout = setTimeout;
      return function () {
        return globalSetTimeout(flush, 1);
      };
    }

    var queue = new Array(1000);
    function flush() {
      for (var i = 0; i < len; i += 2) {
        var callback = queue[i];
        var arg = queue[i + 1];

        callback(arg);

        queue[i] = undefined;
        queue[i + 1] = undefined;
      }

      len = 0;
    }

    function attemptVertx() {
      try {
        var vertx = Function('return this')().require('vertx');
        vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return useVertxTimer();
      } catch (e) {
        return useSetTimeout();
      }
    }

    var scheduleFlush = void 0;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (isNode) {
      scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
      scheduleFlush = useMutationObserver();
    } else if (isWorker) {
      scheduleFlush = useMessageChannel();
    } else if (browserWindow === undefined && typeof commonjsRequire === 'function') {
      scheduleFlush = attemptVertx();
    } else {
      scheduleFlush = useSetTimeout();
    }

    function then(onFulfillment, onRejection) {
      var parent = this;

      var child = new this.constructor(noop);

      if (child[PROMISE_ID] === undefined) {
        makePromise(child);
      }

      var _state = parent._state;

      if (_state) {
        var callback = arguments[_state - 1];
        asap(function () {
          return invokeCallback(_state, child, callback, parent._result);
        });
      } else {
        subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    }

    /**
      `Promise.resolve` returns a promise that will become resolved with the
      passed `value`. It is shorthand for the following:
    
      ```javascript
      let promise = new Promise(function(resolve, reject){
        resolve(1);
      });
    
      promise.then(function(value){
        // value === 1
      });
      ```
    
      Instead of writing the above, your code now simply becomes the following:
    
      ```javascript
      let promise = Promise.resolve(1);
    
      promise.then(function(value){
        // value === 1
      });
      ```
    
      @method resolve
      @static
      @param {Any} value value that the returned promise will be resolved with
      Useful for tooling.
      @return {Promise} a promise that will become fulfilled with the given
      `value`
    */
    function resolve$1(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(noop);
      resolve(promise, object);
      return promise;
    }

    var PROMISE_ID = Math.random().toString(36).substring(2);

    function noop() {}

    var PENDING = void 0;
    var FULFILLED = 1;
    var REJECTED = 2;

    var TRY_CATCH_ERROR = { error: null };

    function selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function getThen(promise) {
      try {
        return promise.then;
      } catch (error) {
        TRY_CATCH_ERROR.error = error;
        return TRY_CATCH_ERROR;
      }
    }

    function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
      try {
        then$$1.call(value, fulfillmentHandler, rejectionHandler);
      } catch (e) {
        return e;
      }
    }

    function handleForeignThenable(promise, thenable, then$$1) {
      asap(function (promise) {
        var sealed = false;
        var error = tryThen(then$$1, thenable, function (value) {
          if (sealed) {
            return;
          }
          sealed = true;
          if (thenable !== value) {
            resolve(promise, value);
          } else {
            fulfill(promise, value);
          }
        }, function (reason) {
          if (sealed) {
            return;
          }
          sealed = true;

          reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          reject(promise, error);
        }
      }, promise);
    }

    function handleOwnThenable(promise, thenable) {
      if (thenable._state === FULFILLED) {
        fulfill(promise, thenable._result);
      } else if (thenable._state === REJECTED) {
        reject(promise, thenable._result);
      } else {
        subscribe(thenable, undefined, function (value) {
          return resolve(promise, value);
        }, function (reason) {
          return reject(promise, reason);
        });
      }
    }

    function handleMaybeThenable(promise, maybeThenable, then$$1) {
      if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
        handleOwnThenable(promise, maybeThenable);
      } else {
        if (then$$1 === TRY_CATCH_ERROR) {
          reject(promise, TRY_CATCH_ERROR.error);
          TRY_CATCH_ERROR.error = null;
        } else if (then$$1 === undefined) {
          fulfill(promise, maybeThenable);
        } else if (isFunction(then$$1)) {
          handleForeignThenable(promise, maybeThenable, then$$1);
        } else {
          fulfill(promise, maybeThenable);
        }
      }
    }

    function resolve(promise, value) {
      if (promise === value) {
        reject(promise, selfFulfillment());
      } else if (objectOrFunction(value)) {
        handleMaybeThenable(promise, value, getThen(value));
      } else {
        fulfill(promise, value);
      }
    }

    function publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      publish(promise);
    }

    function fulfill(promise, value) {
      if (promise._state !== PENDING) {
        return;
      }

      promise._result = value;
      promise._state = FULFILLED;

      if (promise._subscribers.length !== 0) {
        asap(publish, promise);
      }
    }

    function reject(promise, reason) {
      if (promise._state !== PENDING) {
        return;
      }
      promise._state = REJECTED;
      promise._result = reason;

      asap(publishRejection, promise);
    }

    function subscribe(parent, child, onFulfillment, onRejection) {
      var _subscribers = parent._subscribers;
      var length = _subscribers.length;

      parent._onerror = null;

      _subscribers[length] = child;
      _subscribers[length + FULFILLED] = onFulfillment;
      _subscribers[length + REJECTED] = onRejection;

      if (length === 0 && parent._state) {
        asap(publish, parent);
      }
    }

    function publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) {
        return;
      }

      var child = void 0,
          callback = void 0,
          detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch (e) {
        TRY_CATCH_ERROR.error = e;
        return TRY_CATCH_ERROR;
      }
    }

    function invokeCallback(settled, promise, callback, detail) {
      var hasCallback = isFunction(callback),
          value = void 0,
          error = void 0,
          succeeded = void 0,
          failed = void 0;

      if (hasCallback) {
        value = tryCatch(callback, detail);

        if (value === TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value.error = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          reject(promise, cannotReturnOwn());
          return;
        }
      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        resolve(promise, value);
      } else if (failed) {
        reject(promise, error);
      } else if (settled === FULFILLED) {
        fulfill(promise, value);
      } else if (settled === REJECTED) {
        reject(promise, value);
      }
    }

    function initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value) {
          resolve(promise, value);
        }, function rejectPromise(reason) {
          reject(promise, reason);
        });
      } catch (e) {
        reject(promise, e);
      }
    }

    var id = 0;
    function nextId() {
      return id++;
    }

    function makePromise(promise) {
      promise[PROMISE_ID] = id++;
      promise._state = undefined;
      promise._result = undefined;
      promise._subscribers = [];
    }

    function validationError() {
      return new Error('Array Methods must be provided an Array');
    }

    var Enumerator = function () {
      function Enumerator(Constructor, input) {
        this._instanceConstructor = Constructor;
        this.promise = new Constructor(noop);

        if (!this.promise[PROMISE_ID]) {
          makePromise(this.promise);
        }

        if (isArray(input)) {
          this.length = input.length;
          this._remaining = input.length;

          this._result = new Array(this.length);

          if (this.length === 0) {
            fulfill(this.promise, this._result);
          } else {
            this.length = this.length || 0;
            this._enumerate(input);
            if (this._remaining === 0) {
              fulfill(this.promise, this._result);
            }
          }
        } else {
          reject(this.promise, validationError());
        }
      }

      Enumerator.prototype._enumerate = function _enumerate(input) {
        for (var i = 0; this._state === PENDING && i < input.length; i++) {
          this._eachEntry(input[i], i);
        }
      };

      Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
        var c = this._instanceConstructor;
        var resolve$$1 = c.resolve;

        if (resolve$$1 === resolve$1) {
          var _then = getThen(entry);

          if (_then === then && entry._state !== PENDING) {
            this._settledAt(entry._state, i, entry._result);
          } else if (typeof _then !== 'function') {
            this._remaining--;
            this._result[i] = entry;
          } else if (c === Promise$1) {
            var promise = new c(noop);
            handleMaybeThenable(promise, entry, _then);
            this._willSettleAt(promise, i);
          } else {
            this._willSettleAt(new c(function (resolve$$1) {
              return resolve$$1(entry);
            }), i);
          }
        } else {
          this._willSettleAt(resolve$$1(entry), i);
        }
      };

      Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
        var promise = this.promise;

        if (promise._state === PENDING) {
          this._remaining--;

          if (state === REJECTED) {
            reject(promise, value);
          } else {
            this._result[i] = value;
          }
        }

        if (this._remaining === 0) {
          fulfill(promise, this._result);
        }
      };

      Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
        var enumerator = this;

        subscribe(promise, undefined, function (value) {
          return enumerator._settledAt(FULFILLED, i, value);
        }, function (reason) {
          return enumerator._settledAt(REJECTED, i, reason);
        });
      };

      return Enumerator;
    }();

    /**
      `Promise.all` accepts an array of promises, and returns a new promise which
      is fulfilled with an array of fulfillment values for the passed promises, or
      rejected with the reason of the first passed promise to be rejected. It casts all
      elements of the passed iterable to promises as it runs this algorithm.
    
      Example:
    
      ```javascript
      let promise1 = resolve(1);
      let promise2 = resolve(2);
      let promise3 = resolve(3);
      let promises = [ promise1, promise2, promise3 ];
    
      Promise.all(promises).then(function(array){
        // The array here would be [ 1, 2, 3 ];
      });
      ```
    
      If any of the `promises` given to `all` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
      rejection handler. For example:
    
      Example:
    
      ```javascript
      let promise1 = resolve(1);
      let promise2 = reject(new Error("2"));
      let promise3 = reject(new Error("3"));
      let promises = [ promise1, promise2, promise3 ];
    
      Promise.all(promises).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(error) {
        // error.message === "2"
      });
      ```
    
      @method all
      @static
      @param {Array} entries array of promises
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
      @static
    */
    function all(entries) {
      return new Enumerator(this, entries).promise;
    }

    /**
      `Promise.race` returns a new promise which is settled in the same way as the
      first passed promise to settle.
    
      Example:
    
      ```javascript
      let promise1 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 1');
        }, 200);
      });
    
      let promise2 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 2');
        }, 100);
      });
    
      Promise.race([promise1, promise2]).then(function(result){
        // result === 'promise 2' because it was resolved before promise1
        // was resolved.
      });
      ```
    
      `Promise.race` is deterministic in that only the state of the first
      settled promise matters. For example, even if other promises given to the
      `promises` array argument are resolved, but the first settled promise has
      become rejected before the other promises became fulfilled, the returned
      promise will become rejected:
    
      ```javascript
      let promise1 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 1');
        }, 200);
      });
    
      let promise2 = new Promise(function(resolve, reject){
        setTimeout(function(){
          reject(new Error('promise 2'));
        }, 100);
      });
    
      Promise.race([promise1, promise2]).then(function(result){
        // Code here never runs
      }, function(reason){
        // reason.message === 'promise 2' because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```
    
      An example real-world use case is implementing timeouts:
    
      ```javascript
      Promise.race([ajax('foo.json'), timeout(5000)])
      ```
    
      @method race
      @static
      @param {Array} promises array of promises to observe
      Useful for tooling.
      @return {Promise} a promise which settles in the same way as the first passed
      promise to settle.
    */
    function race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      if (!isArray(entries)) {
        return new Constructor(function (_, reject) {
          return reject(new TypeError('You must pass an array to race.'));
        });
      } else {
        return new Constructor(function (resolve, reject) {
          var length = entries.length;
          for (var i = 0; i < length; i++) {
            Constructor.resolve(entries[i]).then(resolve, reject);
          }
        });
      }
    }

    /**
      `Promise.reject` returns a promise rejected with the passed `reason`.
      It is shorthand for the following:
    
      ```javascript
      let promise = new Promise(function(resolve, reject){
        reject(new Error('WHOOPS'));
      });
    
      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```
    
      Instead of writing the above, your code now simply becomes the following:
    
      ```javascript
      let promise = Promise.reject(new Error('WHOOPS'));
    
      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```
    
      @method reject
      @static
      @param {Any} reason value that the returned promise will be rejected with.
      Useful for tooling.
      @return {Promise} a promise rejected with the given `reason`.
    */
    function reject$1(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(noop);
      reject(promise, reason);
      return promise;
    }

    function needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.
    
      Terminology
      -----------
    
      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.
    
      A promise can be in one of three states: pending, fulfilled, or rejected.
    
      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.
    
      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.
    
    
      Basic Usage:
      ------------
    
      ```js
      let promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);
    
        // on failure
        reject(reason);
      });
    
      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```
    
      Advanced Usage:
      ---------------
    
      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.
    
      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          let xhr = new XMLHttpRequest();
    
          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();
    
          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }
    
      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```
    
      Unlike callbacks, promises are great composable primitives.
    
      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON
    
        return values;
      });
      ```
    
      @class Promise
      @param {Function} resolver
      Useful for tooling.
      @constructor
    */

    var Promise$1 = function () {
      function Promise(resolver) {
        this[PROMISE_ID] = nextId();
        this._result = this._state = undefined;
        this._subscribers = [];

        if (noop !== resolver) {
          typeof resolver !== 'function' && needsResolver();
          this instanceof Promise ? initializePromise(this, resolver) : needsNew();
        }
      }

      /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.
       ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```
       Chaining
      --------
       The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.
       ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });
       findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
       ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```
       Assimilation
      ------------
       Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.
       ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```
       If the assimliated promise rejects, then the downstream promise will also reject.
       ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```
       Simple Example
      --------------
       Synchronous Example
       ```javascript
      let result;
       try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```
       Errback Example
       ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```
       Promise Example;
       ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```
       Advanced Example
      --------------
       Synchronous Example
       ```javascript
      let author, books;
       try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```
       Errback Example
       ```js
       function foundBooks(books) {
       }
       function failure(reason) {
       }
       findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```
       Promise Example;
       ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```
       @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
      */

      /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.
      ```js
      function findAuthor(){
      throw new Error('couldn't find that author');
      }
      // synchronous
      try {
      findAuthor();
      } catch(reason) {
      // something went wrong
      }
      // async with promises
      findAuthor().catch(function(reason){
      // something went wrong
      });
      ```
      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
      */

      Promise.prototype.catch = function _catch(onRejection) {
        return this.then(null, onRejection);
      };

      /**
        `finally` will be invoked regardless of the promise's fate just as native
        try/catch/finally behaves
      
        Synchronous example:
      
        ```js
        findAuthor() {
          if (Math.random() > 0.5) {
            throw new Error();
          }
          return new Author();
        }
      
        try {
          return findAuthor(); // succeed or fail
        } catch(error) {
          return findOtherAuther();
        } finally {
          // always runs
          // doesn't affect the return value
        }
        ```
      
        Asynchronous example:
      
        ```js
        findAuthor().catch(function(reason){
          return findOtherAuther();
        }).finally(function(){
          // author was either found, or not
        });
        ```
      
        @method finally
        @param {Function} callback
        @return {Promise}
      */

      Promise.prototype.finally = function _finally(callback) {
        var promise = this;
        var constructor = promise.constructor;

        return promise.then(function (value) {
          return constructor.resolve(callback()).then(function () {
            return value;
          });
        }, function (reason) {
          return constructor.resolve(callback()).then(function () {
            throw reason;
          });
        });
      };

      return Promise;
    }();

    Promise$1.prototype.then = then;
    Promise$1.all = all;
    Promise$1.race = race;
    Promise$1.resolve = resolve$1;
    Promise$1.reject = reject$1;
    Promise$1._setScheduler = setScheduler;
    Promise$1._setAsap = setAsap;
    Promise$1._asap = asap;

    /*global self*/
    function polyfill() {
      var local = void 0;

      if (typeof commonjsGlobal !== 'undefined') {
        local = commonjsGlobal;
      } else if (typeof self !== 'undefined') {
        local = self;
      } else {
        try {
          local = Function('return this')();
        } catch (e) {
          throw new Error('polyfill failed because global object is unavailable in this environment');
        }
      }

      var P = local.Promise;

      if (P) {
        var promiseToString = null;
        try {
          promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
          // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
          return;
        }
      }

      local.Promise = Promise$1;
    }

    // Strange compat..
    Promise$1.polyfill = polyfill;
    Promise$1.Promise = Promise$1;

    return Promise$1;
  });

  
});

var es6Promise$1 = /*#__PURE__*/Object.freeze({
	default: es6Promise,
	__moduleExports: es6Promise
});

var require$$0 = ( es6Promise$1 && es6Promise ) || es6Promise$1;

var auto = require$$0.polyfill();

var defaultProps = {
    size: {
        type: String,
        default: 'medium'
    },
    embed: {
        type: Boolean,
        default: true
    },
    pickerStyle: {
        type: Number,
        default: 0
    },
    allowOpacity: {
        type: Boolean,
        default: true
    },
    allowClearColor: {
        type: Boolean,
        default: false
    },
    showColorValue: {
        type: Boolean,
        default: true
    },
    colorFormat: {
        type: String,
        default: 'hex'
    },
    color: {
        type: String,
        default: '#FF0000'
    },
    showButtons: {
        type: Boolean,
        default: true
    },
    showPalette: {
        type: Boolean,
        default: true
    },
    paletteColors: {
        type: Array,
        default: function _default() {
            return ['#FFFFB5', '#FBBD87', '#F45151', '#7AEA89', '#91C8E7', '#8EB4E6', '#B0A7F1'];
        }
    },
    allowPaletteAddColor: {
        type: Boolean,
        default: true
    },
    onOpen: {
        type: Function,
        default: function _default() {}
    },
    onClose: {
        type: Function,
        default: function _default() {}
    },
    onSave: {
        type: Function,
        default: function _default() {}
    },
    onCancel: {
        type: Function,
        default: function _default() {}
    },
    onChanged: {
        type: Function,
        default: function _default() {}
    }
};

var ColorConverter = {
    methods: {
        /**
         * Converts an RGB value to HEX.
         *
         * @param {Object} rgb
         * @returns {String}
         */
        rgbTohex: function rgbTohex(rgb) {
            var hex = '#' + ('0' + parseInt(rgb.r, 10).toString(16)).slice(-2) + ('0' + parseInt(rgb.g, 10).toString(16)).slice(-2) + ('0' + parseInt(rgb.b, 10).toString(16)).slice(-2);

            return hex.toUpperCase();
        },


        /**
         * Converts an RGB value to HSL.
         *
         * @param {Object} rgb
         * @returns {Object}
         */
        rgbTohsl: function rgbTohsl(rgb) {
            var r = rgb.r / 255,
                g = rgb.g / 255,
                b = rgb.b / 255;
            var maxColor = Math.max(r, g, b);
            var minColor = Math.min(r, g, b);
            // calculate L:
            var l = (maxColor + minColor) / 2;
            var s = 0;
            var h = 0;
            if (maxColor != minColor) {
                // calculate S:
                if (l < 0.5) {
                    s = (maxColor - minColor) / (maxColor + minColor);
                } else {
                    s = (maxColor - minColor) / (2.0 - maxColor - minColor);
                }
                // calculate h:
                if (r == maxColor) {
                    h = (g - b) / (maxColor - minColor);
                } else if (g == maxColor) {
                    h = 2.0 + (b - r) / (maxColor - minColor);
                } else {
                    h = 4.0 + (r - g) / (maxColor - minColor);
                }
            }

            l = Math.round(l * 100);
            s = Math.round(s * 100);
            h = Math.round(h * 60);
            if (h < 0) {
                h += 360;
            }

            return { h: h, s: s, l: l };
        }
    }
};

var Helper = {
    methods: {
        /**
         * Checks if a color is dark or not.
         *
         * @param {Object} rgb
         * @returns {Boolean}
         */
        isDark: function isDark(rgb) {
            var r = rgb.r,
                g = rgb.g,
                b = rgb.b,
                dark = Math.round((r * 299 + g * 587 + b * 114) / 1000);


            return dark > 125 ? true : false;
        },


        /**
         * Starts the opacity animation.
         *
         * @param {HTML Element} elm
         * @param {Boolean} status
         * @returns {Promise}
         */
        opacityAnimation: function opacityAnimation(elm, status) {
            return new Promise(function (resolve) {
                var style = elm.getAttribute('style') ? elm.getAttribute('style').replace(/opacity[^;]+;?/g, '') : null,
                    start = null,
                    duration = 100;

                if (status) {
                    elm.classList.remove('cdp-hidden');
                    elm.style.opacity = 0;
                } else {
                    elm.style.opacity = 1;
                }

                function opacityAnimation(timestamp) {
                    if (!start) {
                        start = timestamp || new Date.getTime();
                    }

                    var runtime = timestamp - start,
                        progress = runtime / duration;
                    progress = Math.min(progress, 1);

                    if (runtime < duration) {
                        var value = progress;
                        if (!status) {
                            value = Math.abs(progress - 1);
                        }
                        elm.style.opacity = value;
                        window.requestAnimationFrame(opacityAnimation);
                    } else {
                        if (!status) {
                            elm.classList.add('cdp-hidden');
                        }
                        elm.setAttribute('style', style);

                        resolve();
                    }
                }
                window.requestAnimationFrame(opacityAnimation);
            });
        }
    }
};

var picker = {
    props: ['init', 'color', 'rgbaColor', 'isDark', 'pickerUpdate', 'picker'],
    data: function data() {
        return {
            dragger: {
                left: 0,
                top: 0
            }
        };
    },

    watch: {
        init: function init() {
            this.setPosition();
        },
        color: function color() {
            if (this.pickerUpdate) {
                this.setPosition();
            }
        }
    },
    methods: {
        pickerClicked: function pickerClicked(e, dragStatus) {
            this.$emit('pickerClicked', e, dragStatus);
        }
    }
};

var MajorPicker = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { ref: "container", staticClass: "cdp-major-picker", on: { "mousedown": function mousedown(e) {
                    return _vm.pickerClicked(e, 'major');
                }, "touchstart": function touchstart(e) {
                    return _vm.pickerClicked(e, 'major');
                } } }, [_vm.pickerStyle == 0 ? _c('div', { staticClass: "cdp-major-picker-gradient cdp-background-type-current-color", style: { background: 'hsl(' + _vm.hslColor.h + ', 100%, 50%)' } }, [_c('div', { staticClass: "cdp-major-picker-gradient cdp-gradient-type-lr-white" }, [_c('div', { staticClass: "cdp-major-picker-gradient cdp-gradient-type-bt-black cdp-last-gradient-child" }, [_c('div', { ref: "dragger", staticClass: "cdp-major-dragger", class: { 'cdp-dark': _vm.isDark }, style: { left: _vm.dragger.left + 'px', top: _vm.dragger.top + 'px' } })])])]) : _c('div', { staticClass: "cdp-major-picker-gradient cdp-gradient-type-lr-colorful" }, [_c('div', { staticClass: "cdp-major-picker-gradient cdp-gradient-type-bt-gray cdp-last-gradient-child" }, [_c('div', { ref: "dragger", staticClass: "cdp-major-dragger", style: { left: _vm.dragger.left + 'px', top: _vm.dragger.top + 'px' } })])])]);
    }, staticRenderFns: [],
    name: 'MajorPicker',
    mixins: [picker],
    props: ['hslColor', 'pickerStyle'],
    methods: {
        /**
         * Sets the position of the picker according to the color.
         */
        setPosition: function setPosition() {
            if (this.color) {
                if (this.pickerStyle == 0) {
                    var _rgbaColor = this.rgbaColor,
                        r = _rgbaColor.r,
                        g = _rgbaColor.g,
                        b = _rgbaColor.b,
                        x = this.picker.height,
                        maxColor = Math.max(r, g, b),
                        topCV = Math.abs(Math.round(x / 255 * maxColor - x)),
                        minColor = Math.min(r, g, b),
                        leftV = Math.abs(Math.round(x / 255 * minColor - x)),
                        leftCV = leftV - Math.abs(Math.round(topCV / maxColor * minColor)),
                        left = leftCV - this.picker.subtractedValue,
                        top = topCV - this.picker.subtractedValue;
                } else {
                    var _hslColor = this.hslColor,
                        h = _hslColor.h,
                        s = _hslColor.s,
                        l = _hslColor.l,
                        x = this.picker.height,
                        leftCV = Math.round(x / 360 * h),
                        topCV = Math.abs(Math.round(x / 100 * s - x)),
                        left = leftCV - this.picker.subtractedValue,
                        top = topCV - this.picker.subtractedValue;
                }
            } else {
                var value = this.picker.subtractedValue * -1,
                    left = value,
                    top = value;
            }

            this.dragger = {
                left: left,
                top: top
            };
        }
    }
};

var MinorPicker = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { ref: "container", staticClass: "cdp-minor-picker", on: { "mousedown": function mousedown(e) {
                    return _vm.pickerClicked(e, 'minor');
                }, "touchstart": function touchstart(e) {
                    return _vm.pickerClicked(e, 'minor');
                } } }, [_vm.pickerStyle == 0 ? _c('div', { staticClass: "cdp-minor-picker-gradient cdp-gradient-type-tb-colorful cdp-last-gradient-child" }, [_c('div', { ref: "dragger", staticClass: "cdp-minor-dragger", style: { left: _vm.dragger.left + 'px', top: _vm.dragger.top + 'px' } })]) : _c('div', { staticClass: "cdp-minor-picker-gradient cdp-gradient-type-bt-white-current-color-black cdp-last-gradient-child", style: _vm.style }, [_c('div', { ref: "dragger", staticClass: "cdp-minor-dragger", class: { 'cdp-dark': _vm.isDark }, style: { left: _vm.dragger.left + 'px', top: _vm.dragger.top + 'px' } })])]);
    }, staticRenderFns: [],
    name: 'MinorPicker',
    mixins: [picker],
    props: ['hslColor', 'pickerStyle'],
    computed: {
        style: function style() {
            var h, s;

            if (this.color) {
                h = this.hslColor.h;
                s = this.hslColor.s;
            } else {
                h = 0;
                s = 100;
            }

            return {
                background: 'linear-gradient(to bottom, hsl(0, 100%, 100%), hsl(' + h + ', ' + s + '%, 50%), hsl(0, 0%, 0%))'
            };
        }
    },
    methods: {
        /**
         * Sets the position of the picker according to the color.
         */
        setPosition: function setPosition() {
            var left = (this.picker.width - this.picker.subtractedValue * 2) / 2;

            if (this.color) {
                if (this.pickerStyle == 0) {
                    var top = Math.round(this.picker.height / 360 * this.hslColor.h) - this.picker.subtractedValue;
                } else {
                    var y = this.picker.height,
                        top = Math.abs(Math.round(y / 100 * this.hslColor.l - y)) - this.picker.subtractedValue;
                }
            } else {
                var top = this.picker.subtractedValue * -1;
            }

            this.dragger = {
                left: left,
                top: top
            };
        }
    }
};

var OpacityPicker = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { ref: "container", staticClass: "cdp-opacity-picker", on: { "mousedown": function mousedown(e) {
                    return _vm.pickerClicked(e, 'opacity');
                }, "touchstart": function touchstart(e) {
                    return _vm.pickerClicked(e, 'opacity');
                } } }, [_c('div', { staticClass: "cdp-opacity-picker-gradient cdp-background-type-opacity" }, [_c('div', { staticClass: "cdp-opacity-picker-gradient cdp-gradient-type-bt-current-color cdp-last-gradient-child", style: { background: 'linear-gradient(to top, rgba(' + _vm.rgbaColor.r + ', ' + _vm.rgbaColor.g + ', ' + _vm.rgbaColor.b + ', 1), rgba(' + _vm.rgbaColor.r + ', ' + _vm.rgbaColor.g + ', ' + _vm.rgbaColor.b + ', 0))' } }, [_c('div', { ref: "dragger", staticClass: "cdp-opacity-dragger", class: { 'cdp-dark': _vm.isDark || _vm.rgbaColor.a < 0.25 }, style: { left: _vm.dragger.left + 'px', top: _vm.dragger.top + 'px' } })])])]);
    }, staticRenderFns: [],
    name: 'OpacityPicker',
    mixins: [picker],
    methods: {
        /**
         * Sets the position of the picker according to the color.
         */
        setPosition: function setPosition() {
            var left = (this.picker.width - this.picker.subtractedValue * 2) / 2,
                top;

            if (this.color) {
                top = Math.round(this.picker.height / 100 * (this.rgbaColor.a * 100)) - this.picker.subtractedValue;
            } else {
                top = this.picker.height - this.picker.subtractedValue;
            }

            this.dragger = {
                left: left,
                top: top
            };
        }
    }
};

var PickerContainer = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "cdp-picker-container" }, [_c('MajorPicker', { ref: "majorPicker", attrs: { "init": _vm.init, "color": _vm.color, "rgbaColor": _vm.rgbaColor, "hslColor": _vm.hslColor, "isDark": _vm.isDark, "pickerUpdate": _vm.pickerUpdate, "picker": _vm.majorPicker, "pickerStyle": _vm.pickerStyle }, on: { "pickerClicked": _vm.pickerClicked } }), _vm._v(" "), _c('MinorPicker', { ref: "minorPicker", attrs: { "init": _vm.init, "color": _vm.color, "rgbaColor": _vm.rgbaColor, "hslColor": _vm.hslColor, "isDark": _vm.isDark, "pickerUpdate": _vm.pickerUpdate, "picker": _vm.minorPicker, "pickerStyle": _vm.pickerStyle }, on: { "pickerClicked": _vm.pickerClicked } }), _vm._v(" "), _vm.allowOpacity ? _c('OpacityPicker', { ref: "opacityPicker", attrs: { "init": _vm.init, "color": _vm.color, "rgbaColor": _vm.rgbaColor, "isDark": _vm.isDark, "pickerUpdate": _vm.pickerUpdate, "picker": _vm.opacityPicker }, on: { "pickerClicked": _vm.pickerClicked } }) : _vm._e()], 1);
    }, staticRenderFns: [],
    name: 'PickerContainer',
    mixins: [ColorConverter],
    props: ['color', 'rgbaColor', 'isDark', 'pickerUpdate', 'majorPicker', 'minorPicker', 'opacityPicker', 'pickerStyle', 'allowOpacity', 'getRgbaValue', 'setColor'],
    components: { MajorPicker: MajorPicker, MinorPicker: MinorPicker, OpacityPicker: OpacityPicker },
    data: function data() {
        return {
            init: false,
            rgbColor: {}, //Holds the latest RGB value to calculate the new value when the picker position is changed on the palette
            hslColor: {}, //Holds the latest HSL value to calculate the new value when the picker position is changed on the palette
            dragStatus: null
        };
    },

    watch: {
        color: function color() {
            if (this.pickerUpdate) {
                this.setRgbHslValue();
            }
        }
    },
    mounted: function mounted() {
        this.setRgbHslValue();
        this.init = true;
    },

    methods: {
        /**
         * Sets RGB and HSL values according to the color.
         */
        setRgbHslValue: function setRgbHslValue() {
            if (this.color) {
                this.hslColor = this.rgbTohsl(this.rgbaColor);
                this.rgbColor = this.getRgbaValue('hsl(' + this.hslColor.h + ', 100%, 50%)');
            } else {
                this.rgbColor = {
                    r: 255,
                    g: 0,
                    b: 0
                };
                this.hslColor = {
                    h: 0,
                    s: 0,
                    l: 0
                };
            }
        },


        /**
         * This function is called when a color is chosen on the picker.
         * Sets the color.
         *
         * @param {Object} event
         * @param {String} dragStatus
         */
        pickerClicked: function pickerClicked(event, dragStatus) {
            this.dragStatus = dragStatus;
            document.body.classList.add('cdp-dragging-active');

            if (this.pickerStyle == 0 && dragStatus != 'minor' && !this.color) {
                var dragger = this.$refs.minorPicker.$refs.dragger;
                this.setColorWithPosition({ x: dragger.offsetLeft + this.minorPicker.subtractedValue, y: dragger.offsetTop + this.minorPicker.subtractedValue }, 'minor');
            } else if (this.pickerStyle == 1 && dragStatus != 'major' && !this.color) {
                var dragger = this.$refs.majorPicker.$refs.dragger;
                this.setColorWithPosition({ x: dragger.offsetLeft + this.majorPicker.subtractedValue, y: dragger.offsetTop + this.majorPicker.subtractedValue }, 'major');
            }

            this.pickerMoved(event);
            this.toggleDraggerListeners(true);
        },


        /**
         * This function is called when the picker is moved on the palette. Takes the event object as an argument. Calls the setColorWithPosition() to set the new color.
         *
         * @param {Object} event
         */
        pickerMoved: function pickerMoved(event) {
            var n;

            if (this.dragStatus == 'major') {
                n = this.newPosition(event, this.$refs.majorPicker);
            } else if (this.dragStatus == 'minor') {
                n = this.newPosition(event, this.$refs.minorPicker);
            } else {
                n = this.newPosition(event, this.$refs.opacityPicker);
            }
            this.setColorWithPosition(n, this.dragStatus, true);

            event.preventDefault();
        },


        /**
         * Sets and returns the new position of the picker.
         *
         * @param {Object} event
         * @param {Object} picker
         * @returns {Object} {x: Number, y: Number}
         */
        newPosition: function newPosition(event, picker) {
            var p = picker.picker,
                rect = picker.$refs.container.getBoundingClientRect(),
                eX = event.clientX ? event.clientX : event.pageX - window.pageXOffset,
                eY = event.clientY ? event.clientY : event.pageY - window.pageYOffset,
                x = eX - (rect.left + p.subtractedValue),
                y = eY - (rect.top + p.subtractedValue);

            if (x < -p.subtractedValue) {
                x = -p.subtractedValue;
            } else if (x > p.width - p.subtractedValue) {
                x = p.width - p.subtractedValue;
            }
            if (y < -p.subtractedValue) {
                y = -p.subtractedValue;
            } else if (y > p.height - p.subtractedValue) {
                y = p.height - p.subtractedValue;
            }

            picker.dragger = {
                left: x,
                top: y
            };

            return { x: x + p.subtractedValue, y: y + p.subtractedValue };
        },


        /**
         * Sets the color according to the new position.
         *
         * @param {Object} n
         * @param {String} type
         * @param {Boolean} eventCall
         */
        setColorWithPosition: function setColorWithPosition(n, type) {
            var eventCall = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var rgb = this.rgbColor;

            if (type == 'major') {
                if (this.pickerStyle == 0) {
                    var rgb = [rgb.r, rgb.g, rgb.b],
                        x = this.majorPicker.height,
                        topCV,
                        leftV,
                        leftCV,
                        netV;

                    for (var i = 0; i < rgb.length; i++) {
                        var v = rgb[i];
                        if (v == 255) {
                            netV = Math.abs(Math.round(255 / x * n.y - 255));
                        } else {
                            topCV = Math.round((x - n.y) * (v / x));
                            leftV = Math.round((x - n.x) * ((255 - v) / x));
                            leftCV = Math.abs(Math.round((x - n.y) * (leftV / x)));
                            netV = topCV + leftCV;
                        }
                        rgb[i] = netV;
                    }

                    var rgba = {
                        r: rgb[0],
                        g: rgb[1],
                        b: rgb[2],
                        a: this.rgbaColor.a
                    };

                    this.setColor(rgba, false, true, eventCall);
                } else {
                    var x = this.majorPicker.height,
                        h = Math.round(n.x * (360 / x)),
                        s = Math.abs(Math.round(n.y * (100 / x)) - 100);

                    this.hslColor.h = h;
                    this.hslColor.s = s;

                    var dragger = this.$refs.minorPicker.$refs.dragger,
                        minorX = dragger.offsetLeft + this.minorPicker.subtractedValue,
                        minorY = dragger.offsetTop + this.minorPicker.subtractedValue;

                    this.setColorWithPosition({ x: minorX, y: minorY }, 'minor', eventCall);
                }
            } else if (type == 'minor') {
                if (this.pickerStyle == 0) {
                    var x = this.minorPicker.height,
                        h = Math.round(n.y * (360 / x));

                    rgb = this.getRgbaValue('hsl(' + h + ', 100%, 50%)');
                    this.rgbColor = rgb;
                    this.hslColor.h = h;

                    var dragger = this.$refs.majorPicker.$refs.dragger,
                        majorX = dragger.offsetLeft + this.majorPicker.subtractedValue,
                        majorY = dragger.offsetTop + this.majorPicker.subtractedValue;

                    this.setColorWithPosition({ x: majorX, y: majorY }, 'major', eventCall);
                } else {
                    var x = this.minorPicker.height,
                        l = Math.abs(Math.round(n.y * (100 / x)) - 100),
                        rgba = this.getRgbaValue('hsl(' + this.hslColor.h + ', ' + this.hslColor.s + '%, ' + l + '%)');

                    this.hslColor.l = l;
                    rgba.a = this.rgbaColor.a;

                    this.setColor(rgba, false, true, eventCall);
                }
            } else if (type == 'opacity') {
                var _rgbaColor = this.rgbaColor,
                    r = _rgbaColor.r,
                    g = _rgbaColor.g,
                    b = _rgbaColor.b,
                    x = this.opacityPicker.height,
                    a = Math.round(100 / x * n.y) / 100;


                var rgba = { r: r, g: g, b: b, a: a };
                this.setColor(rgba, false, true, eventCall);
            }
        },


        /**
         * Ends dragging.
         */
        pickerReleased: function pickerReleased() {
            document.body.classList.remove('cdp-dragging-active');
            this.toggleDraggerListeners(false);
        },


        /**
         * Toggles dragger listeners according to status.
         *
         * @param {Boolean} status
         */
        toggleDraggerListeners: function toggleDraggerListeners(status) {
            if (status) {
                document.addEventListener('mousemove', this.pickerMoved);
                document.addEventListener('touchmove', this.pickerMoved);
                document.addEventListener('mouseup', this.pickerReleased);
                document.addEventListener('touchend', this.pickerReleased);
            } else {
                document.removeEventListener('mousemove', this.pickerMoved);
                document.removeEventListener('touchmove', this.pickerMoved);
                document.removeEventListener('mouseup', this.pickerReleased);
                document.removeEventListener('touchend', this.pickerReleased);
            }
        }
    }
};

var InitialColor = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "cdp-initial-color", class: { 'cdp-dark': _vm.isDark }, style: { background: _vm.color }, on: { "click": _vm.setInitialColorAsColor } }, [_c('i', { staticClass: "cdp-icons" })]);
    }, staticRenderFns: [],
    name: 'InitialColor',
    props: ['color', 'isDark', 'setInitialColorAsColor']
};

var ColorInput = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('input', { directives: [{ name: "model", rawName: "v-model", value: _vm.color_, expression: "color_" }], staticClass: "cdp-current-color", class: { 'cdp-dark': _vm.isDark || _vm.rgbaColor.a < 0.4 }, attrs: { "type": "text", "spellCheck": "false" }, domProps: { "value": _vm.color_ }, on: { "change": _vm.change, "input": function input($event) {
                    if ($event.target.composing) {
                        return;
                    }_vm.color_ = $event.target.value;
                } } });
    }, staticRenderFns: [],
    name: 'ColorInput',
    props: ['color', 'rgbaColor', 'isDark', 'inputUpdate', 'getRgbaValue', 'convertColor', 'setColor'],
    data: function data() {
        return {
            color_: this.color
        };
    },

    watch: {
        color: function color() {
            if (this.inputUpdate) {
                this.color_ = this.color;
            }
        }
    },
    methods: {
        change: function change(e) {
            if (e.target.value.trim()) {
                var rgba = this.getRgbaValue(e.target.value);
                this.setColor(rgba, true, false);
            }
        }
    }
};

var ClearColor = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "cdp-clear-color", class: { 'cdp-dark': _vm.isDark || _vm.rgbaColor.a < 0.4 }, on: { "click": _vm.clearColor } }, [_c('i', { staticClass: "cdp-icons" })]);
    }, staticRenderFns: [],
    name: 'ClearColor',
    props: ['rgbaColor', 'isDark', 'clearColor']
};

var CurrentColorConsole = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "cdp-current-color-console", style: _vm.style }, [_vm.showColorValue ? _c('ColorInput', { attrs: { "color": _vm.color, "rgbaColor": _vm.rgbaColor, "isDark": _vm.isDark, "inputUpdate": _vm.inputUpdate, "getRgbaValue": _vm.getRgbaValue, "convertColor": _vm.convertColor, "setColor": _vm.setColor } }) : _vm._e(), _vm._v(" "), _vm.allowClearColor ? _c('ClearColor', { attrs: { "rgbaColor": _vm.rgbaColor, "isDark": _vm.isDark, "clearColor": _vm.clearColor } }) : _vm._e()], 1);
    }, staticRenderFns: [],
    name: 'CurrentColorConsole',
    props: ['color', 'rgbaColor', 'isDark', 'inputUpdate', 'showColorValue', 'allowClearColor', 'getRgbaValue', 'convertColor', 'setColor', 'clearColor'],
    components: { ColorInput: ColorInput, ClearColor: ClearColor },
    computed: {
        style: function style() {
            return {
                background: this.color ? this.color : 'transparent'
            };
        }
    }
};

var ColorConsole = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "cdp-color-console-container cdp-background-type-opacity" }, [_c('InitialColor', { attrs: { "color": _vm.initialColor, "isDark": _vm.isDarkInitial, "setInitialColorAsColor": _vm.setInitialColorAsColor } }), _vm._v(" "), _c('CurrentColorConsole', { attrs: { "color": _vm.color, "rgbaColor": _vm.rgbaColor, "isDark": _vm.isDarkCurrent, "inputUpdate": _vm.inputUpdate, "showColorValue": _vm.showColorValue, "allowClearColor": _vm.allowClearColor, "getRgbaValue": _vm.getRgbaValue, "convertColor": _vm.convertColor, "setColor": _vm.setColor, "clearColor": _vm.clearColor } })], 1);
    }, staticRenderFns: [],
    name: 'ColorConsole',
    props: ['color', 'rgbaColor', 'initialColor', 'isDarkCurrent', 'isDarkInitial', 'inputUpdate', 'showColorValue', 'allowClearColor', 'getRgbaValue', 'convertColor', 'setColor', 'clearColor', 'setInitialColorAsColor'],
    components: { InitialColor: InitialColor, CurrentColorConsole: CurrentColorConsole }
};

var Buttons = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "cdp-button-container" }, [_c('div', { staticClass: "cdp-button", attrs: { "cdp-function": "save" }, on: { "click": _vm.save } }, [_c('i', { staticClass: "cdp-icons" }), _vm._v(" SAVE ")]), _vm._v(" "), _c('div', { staticClass: "cdp-button", attrs: { "cdp-function": "cancel" }, on: { "click": _vm.cancel } }, [_c('i', { staticClass: "cdp-icons" }), _vm._v(" CANCEL ")])]);
    }, staticRenderFns: [],
    name: 'Buttons',
    props: ['save', 'cancel']
};

var Console = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "cdp-console-container", class: [!_vm.showColorValue && !_vm.allowClearColor ? 'cdp-color-console-non-showing' : !_vm.showColorValue ? 'cdp-current-color-non-showing' : !_vm.allowClearColor ? 'cdp-clear-color-non-showing' : ''] }, [_vm.showColorValue || _vm.allowClearColor ? _c('ColorConsole', { attrs: { "color": _vm.color, "rgbaColor": _vm.rgbaColor, "initialColor": _vm.initialColor, "isDarkCurrent": _vm.isDarkCurrent, "isDarkInitial": _vm.isDarkInitial, "inputUpdate": _vm.inputUpdate, "showColorValue": _vm.showColorValue, "allowClearColor": _vm.allowClearColor, "getRgbaValue": _vm.getRgbaValue, "convertColor": _vm.convertColor, "setColor": _vm.setColor, "clearColor": _vm.clearColor, "setInitialColorAsColor": _vm.setInitialColorAsColor } }) : _vm._e(), _vm._v(" "), _vm.showButtons ? _c('Buttons', { attrs: { "save": _vm.save, "cancel": _vm.cancel } }) : _vm._e()], 1);
    }, staticRenderFns: [],
    name: 'Console',
    props: ['color', 'rgbaColor', 'initialColor', 'isDarkCurrent', 'isDarkInitial', 'inputUpdate', 'showColorValue', 'allowClearColor', 'showButtons', 'getRgbaValue', 'convertColor', 'setColor', 'clearColor', 'setInitialColorAsColor', 'save', 'cancel'],
    components: { ColorConsole: ColorConsole, Buttons: Buttons }
};

var Arrow = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "cdp-arrow-div" }, [_c('i', { staticClass: "cdp-icons", on: { "click": _vm.togglePalette } })]);
    }, staticRenderFns: [],
    name: 'Arrow',
    methods: {
        togglePalette: function togglePalette() {
            this.$emit('togglePalette');
        }
    }
};

var PaletteAddColor = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "cdp-palette-add-element", on: { "click": _vm.addColor } }, [_c('i', { staticClass: "cdp-icons" })]);
    }, staticRenderFns: [],
    name: 'PaletteAddColor',
    props: ['addColor']
};

var PaletteColor = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "cdp-palette-element cdp-background-type-opacity", on: { "click": function click($event) {
                    _vm.setColor(_vm.rgba, true, true);
                } } }, [_c('div', { style: { background: _vm.color.value } })]);
    }, staticRenderFns: [],
    name: 'PaletteColor',
    props: ['color', 'setColor'],
    computed: {
        rgba: function rgba() {
            var _color = this.color,
                r = _color.r,
                g = _color.g,
                b = _color.b,
                a = _color.a;

            return {
                r: r,
                g: g,
                b: b,
                a: a
            };
        }
    }
};

var PaletteColors = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "cdp-palette" }, [_vm.allowPaletteAddColor ? _c('PaletteAddColor', { attrs: { "addColor": _vm.addColor } }) : _vm._e(), _vm._v(" "), _vm._l(_vm.paletteColors_, function (p) {
            return _c('PaletteColor', { key: p.value, attrs: { "color": p, "setColor": _vm.setColor } });
        })], 2);
    }, staticRenderFns: [],
    name: 'PaletteColors',
    props: ['paletteColors', 'allowPaletteAddColor', 'color', 'rgbaColor', 'getRgbaValue', 'setColor'],
    components: { PaletteAddColor: PaletteAddColor, PaletteColor: PaletteColor },
    data: function data() {
        return {
            paletteColors_: []
        };
    },
    mounted: function mounted() {
        var _this = this;

        this.paletteColors.forEach(function (i) {
            var rgba = _this.getRgbaValue(i),
                r = rgba.r,
                g = rgba.g,
                b = rgba.b,
                a = rgba.a,
                color = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';


            _this.paletteColors_.push({
                value: color,
                r: r,
                g: g,
                b: b,
                a: a
            });
        });
    },

    methods: {
        /**
         * Adds a color to the palette.
         */
        addColor: function addColor() {
            if (this.color) {
                var _rgbaColor = this.rgbaColor,
                    r = _rgbaColor.r,
                    g = _rgbaColor.g,
                    b = _rgbaColor.b,
                    a = _rgbaColor.a,
                    color = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';


                var check = this.paletteColors_.find(function (i) {
                    return i.value == color;
                });
                if (!check) {
                    this.paletteColors_.push({
                        value: color,
                        r: r,
                        g: g,
                        b: b,
                        a: a
                    });
                }
            }
        }
    }
};

var Palette = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "cdp-palette-container" }, [_c('hr', { staticClass: "cdp-palette-line" }), _vm._v(" "), _c('PaletteColors', { attrs: { "paletteColors": _vm.paletteColors, "allowPaletteAddColor": _vm.allowPaletteAddColor, "color": _vm.color, "rgbaColor": _vm.rgbaColor, "getRgbaValue": _vm.getRgbaValue, "setColor": _vm.setColor } })], 1);
    }, staticRenderFns: [],
    name: 'Palette',
    props: ['paletteColors', 'allowPaletteAddColor', 'color', 'rgbaColor', 'getRgbaValue', 'setColor'],
    components: { PaletteColors: PaletteColors }
};

var cordelia = { render: function render() {
        var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _vm.embed ? _c('transition', { on: { "enter": _vm.containerEnter, "leave": _vm.containerLeave } }, [_c('div', { directives: [{ name: "show", rawName: "v-show", value: _vm.pickerOpen, expression: "pickerOpen" }], ref: "container", staticClass: "cdp-container", attrs: { "cdp-size": _vm.size_ } }, [_c('div', { ref: "rgbaColor", staticClass: "cdp-hidden" }), _vm._v(" "), _c('PickerContainer', { attrs: { "color": _vm.color_, "rgbaColor": _vm.rgbaColor, "isDark": _vm.isDarkCurrent, "pickerUpdate": _vm.pickerUpdate, "majorPicker": _vm.majorPicker, "minorPicker": _vm.minorPicker, "opacityPicker": _vm.opacityPicker, "pickerStyle": _vm.pickerStyle, "allowOpacity": _vm.allowOpacity, "getRgbaValue": _vm.getRgbaValue, "setColor": _vm.setColor } }), _vm._v(" "), _vm.showColorValue || _vm.allowClearColor || _vm.showButtons ? _c('Console', { attrs: { "color": _vm.color_, "rgbaColor": _vm.rgbaColor, "initialColor": _vm.initialColor, "isDarkCurrent": _vm.isDarkCurrent, "isDarkInitial": _vm.isDarkInitial, "inputUpdate": _vm.inputUpdate, "showColorValue": _vm.showColorValue, "allowClearColor": _vm.allowClearColor, "showButtons": _vm.showButtons, "getRgbaValue": _vm.getRgbaValue, "convertColor": _vm.convertColor, "setColor": _vm.setColor, "clearColor": _vm.clearColor, "setInitialColorAsColor": _vm.setInitialColorAsColor, "save": _vm.save, "cancel": _vm.cancel } }) : _vm._e(), _vm._v(" "), _vm.showPalette ? _c('Arrow', { on: { "togglePalette": function togglePalette($event) {
                    _vm.paletteOpen = !_vm.paletteOpen;
                } } }) : _vm._e(), _vm._v(" "), _c('transition', { on: { "enter": _vm.paletteEnter, "leave": _vm.paletteLeave } }, [_vm.showPalette ? _c('Palette', { directives: [{ name: "show", rawName: "v-show", value: _vm.paletteOpen, expression: "paletteOpen" }], attrs: { "paletteColors": _vm.paletteColors, "allowPaletteAddColor": _vm.allowPaletteAddColor, "color": _vm.color_, "rgbaColor": _vm.rgbaColor, "getRgbaValue": _vm.getRgbaValue, "setColor": _vm.setColor } }) : _vm._e()], 1)], 1)]) : _c('div', { ref: "main", staticClass: "cdp-wrapper cdp-background-type-opacity", on: { "click": _vm.openPicker } }, [_c('div', { staticClass: "cdp-wrapper-overlay", style: { background: _vm.color_ } }, [_c('transition', { on: { "enter": _vm.containerEnter, "leave": _vm.containerLeave } }, [_c('div', { directives: [{ name: "show", rawName: "v-show", value: _vm.pickerOpen, expression: "pickerOpen" }], ref: "container", staticClass: "cdp-container", class: { 'cdp-right': _vm.pickerPosition.right, 'cdp-bottom': _vm.pickerPosition.bottom }, attrs: { "cdp-size": _vm.size_ } }, [_c('div', { ref: "rgbaColor", staticClass: "cdp-hidden" }), _vm._v(" "), _c('PickerContainer', { attrs: { "color": _vm.color_, "rgbaColor": _vm.rgbaColor, "isDark": _vm.isDarkCurrent, "pickerUpdate": _vm.pickerUpdate, "majorPicker": _vm.majorPicker, "minorPicker": _vm.minorPicker, "opacityPicker": _vm.opacityPicker, "pickerStyle": _vm.pickerStyle, "allowOpacity": _vm.allowOpacity, "getRgbaValue": _vm.getRgbaValue, "setColor": _vm.setColor } }), _vm._v(" "), _vm.showColorValue || _vm.allowClearColor || _vm.showButtons ? _c('Console', { attrs: { "color": _vm.color_, "rgbaColor": _vm.rgbaColor, "initialColor": _vm.initialColor, "isDarkCurrent": _vm.isDarkCurrent, "isDarkInitial": _vm.isDarkInitial, "inputUpdate": _vm.inputUpdate, "showColorValue": _vm.showColorValue, "allowClearColor": _vm.allowClearColor, "showButtons": _vm.showButtons, "getRgbaValue": _vm.getRgbaValue, "convertColor": _vm.convertColor, "setColor": _vm.setColor, "clearColor": _vm.clearColor, "setInitialColorAsColor": _vm.setInitialColorAsColor, "save": _vm.save, "cancel": _vm.cancel } }) : _vm._e(), _vm._v(" "), _vm.showPalette ? _c('Arrow', { on: { "togglePalette": function togglePalette($event) {
                    _vm.paletteOpen = !_vm.paletteOpen;
                } } }) : _vm._e(), _vm._v(" "), _c('transition', { on: { "enter": _vm.paletteEnter, "leave": _vm.paletteLeave } }, [_vm.showPalette ? _c('Palette', { directives: [{ name: "show", rawName: "v-show", value: _vm.paletteOpen, expression: "paletteOpen" }], attrs: { "paletteColors": _vm.paletteColors, "allowPaletteAddColor": _vm.allowPaletteAddColor, "color": _vm.color_, "rgbaColor": _vm.rgbaColor, "getRgbaValue": _vm.getRgbaValue, "setColor": _vm.setColor } }) : _vm._e()], 1)], 1)])], 1)]);
    }, staticRenderFns: [],
    name: 'Cordelia',
    mixins: [ColorConverter, Helper],
    components: { PickerContainer: PickerContainer, Console: Console, Arrow: Arrow, Palette: Palette },
    props: defaultProps,
    data: function data() {
        return {
            size_: this.size,
            color_: this.color,
            initialColor: null,
            isDarkCurrent: false,
            isDarkInitial: false,
            pickerUpdate: true,
            inputUpdate: true,

            // Stores RGBA values of the current color.
            rgbaColor: {},

            // Picker size
            majorPicker: {},
            minorPicker: {},
            opacityPicker: {},

            pickerOpen: this.embed ? true : false,
            animationProcessing: false,
            pickerPosition: {
                right: false,
                bottom: false
            },
            paletteOpen: false
        };
    },
    created: function created() {
        this.init();
    },

    methods: {
        /**
         * Loads the picker.
         */
        init: function init() {
            // size
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && !this.embed) {
                this.size_ = 'small';
            }

            if (this.size_ == 'small') {
                this.majorPicker.width = 125;
                this.majorPicker.height = 125;
                this.minorPicker.width = 20;
                this.minorPicker.height = 125;
            } else if (this.size_ == 'medium') {
                this.majorPicker.width = 175;
                this.majorPicker.height = 175;
                this.minorPicker.width = 30;
                this.minorPicker.height = 175;
            } else {
                this.majorPicker.width = 250;
                this.majorPicker.height = 250;
                this.minorPicker.width = 30;
                this.minorPicker.height = 250;
            }
            this.majorPicker.subtractedValue = 9;
            this.minorPicker.subtractedValue = 7;

            if (this.allowOpacity) {
                this.opacityPicker.width = this.minorPicker.width;
                this.opacityPicker.height = this.minorPicker.height;
                this.opacityPicker.subtractedValue = this.minorPicker.subtractedValue;
            }

            if (!this.color_ && !this.allowClearColor) {
                if (this.colorFormat == 'hex') {
                    this.color_ = '#FF0000';
                } else if (this.colorFormat == 'rgb') {
                    this.color_ = 'rgb(255,0,0)';
                } else if (this.colorFormat == 'rgba') {
                    this.color_ = 'rgba(255,0,0,1)';
                } else if (this.colorFormat == 'hsl') {
                    this.color_ = 'hsl(0,100%,50%)';
                } else if (this.colorFormat == 'hsla') {
                    this.color_ = 'hsla(0,100%,50%,1)';
                }
            }

            var rgbaColor = {},
                isDark;
            if (this.color_) {
                var rgbaColorElm = document.createElement('div');
                rgbaColorElm.style.display = 'none';
                document.body.appendChild(rgbaColorElm);
                rgbaColor = this.getRgbaValue(this.color_, rgbaColorElm);
                document.body.removeChild(rgbaColorElm);

                this.color_ = this.convertColor(rgbaColor).value;
                isDark = this.isDark(rgbaColor);
            } else {
                rgbaColor = {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 1
                };
                isDark = true;
            }
            this.rgbaColor = rgbaColor;
            this.initialColor = this.color_;
            this.isDarkCurrent = isDark;
            this.isDarkInitial = rgbaColor.a < 0.4 ? true : isDark;
        },


        /**
         * Converts any color type to RGBA by using the getComputedStyle method.
         *
         * @param {String} color
         * @param {HTML Element} RgbaColorElm
         * @retuns {Object}
         */
        getRgbaValue: function getRgbaValue(color) {
            var rgbaColorElm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.$refs.rgbaColor;

            rgbaColorElm.style.background = color;

            var backgroundValue = window.getComputedStyle(rgbaColorElm, false, null).getPropertyValue('background-color'),
                rgba = backgroundValue.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');

            rgba = {
                r: parseInt(rgba[0]),
                g: parseInt(rgba[1]),
                b: parseInt(rgba[2]),
                a: rgba[3] ? parseFloat(rgba[3]) : 1
            };

            return rgba;
        },


        /**
         * Converts and returns the current color according to the selected format that user has chosen.
         *
         * @param {Object} rgba
         * @returns {Object}
         */
        convertColor: function convertColor(rgba) {
            var r = rgba.r,
                g = rgba.g,
                b = rgba.b,
                a = rgba.a;


            if (a == 1 || !this.allowOpacity) {
                if (this.colorFormat == 'hex') {
                    return {
                        value: this.rgbTohex({ r: r, g: g, b: b })
                    };
                } else if (this.colorFormat == 'rgb') {
                    return {
                        value: 'rgb(' + r + ', ' + g + ', ' + b + ')', r: r, g: g, b: b
                    };
                } else if (this.colorFormat == 'rgba') {
                    return {
                        value: 'rgba(' + r + ', ' + g + ', ' + b + ', 1)', r: r, g: g, b: b, a: 1
                    };
                } else {
                    var _rgbTohsl = this.rgbTohsl({ r: r, g: g, b: b }),
                        h = _rgbTohsl.h,
                        s = _rgbTohsl.s,
                        l = _rgbTohsl.l;

                    if (this.colorFormat == 'hsl') {
                        return {
                            value: 'hsl(' + h + ', ' + s + '%, ' + l + '%)', h: h, s: s, l: l
                        };
                    } else {
                        return {
                            value: 'hsla(' + h + ', ' + s + '%, ' + l + '%, 1)', h: h, s: s, l: l, a: 1
                        };
                    }
                }
            } else {
                if (this.colorFormat != 'hsl' && this.colorFormat != 'hsla') {
                    return {
                        value: 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')', r: r, g: g, b: b, a: a
                    };
                } else {
                    var _rgbTohsl2 = this.rgbTohsl({ r: r, g: g, b: b }),
                        h = _rgbTohsl2.h,
                        s = _rgbTohsl2.s,
                        l = _rgbTohsl2.l;

                    return {
                        value: 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')', h: h, s: s, l: l, a: a
                    };
                }
            }
        },


        /**
         * Sets the new color.
         *
         * @param {Object} rgba
         * @param {Boolean} pickerUpdate
         * @param {Boolean} inputUpdate
         * @param {Boolean} eventCall
         */
        setColor: function setColor(rgba, pickerUpdate, inputUpdate) {
            var eventCall = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

            var color = this.convertColor(rgba);

            if (this.color_ != color.value) {
                this.color_ = color.value;
                this.rgbaColor = rgba;
                this.isDarkCurrent = this.isDark(rgba);
                this.pickerUpdate = pickerUpdate;
                this.inputUpdate = inputUpdate;

                if (eventCall) {
                    this.onChanged();
                }
            }
        },


        /**
         * Clears the color.
         */
        clearColor: function clearColor() {
            if (this.color_) {
                this.color_ = null;
                this.rgbaColor = {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 1
                };
                this.isDarkCurrent = true;
                this.pickerUpdate = true;
                this.inputUpdate = true;

                this.onChanged();
            }
        },


        /**
         * Sets the initial color as the current color.
         */
        setInitialColorAsColor: function setInitialColorAsColor() {
            if (this.color_ != this.initialColor) {
                if (this.initialColor) {
                    var rgba = this.getRgbaValue(this.initialColor);
                    this.setColor(rgba, true, true);
                } else {
                    this.clearColor();
                }
            }
        },


        /**
         * Shows the color picker.
         */
        openPicker: function openPicker() {
            if (!this.pickerOpen && !this.animationProcessing) {
                this.animationProcessing = true;
                this.pickerOpen = true;
            }
        },


        /**
         * Hides the picker if the click target is not the picker itself.
         *
         * @param {Object} event
         * @param {Boolean} pass
         */
        closePicker: function closePicker(event) {
            var pass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if ((event && !this.$refs.container.contains(event.target) || pass) && !this.animationProcessing) {
                this.animationProcessing = true;

                if (!this.embed) {
                    window.removeEventListener('resize', this.setPosition, true);

                    if (!this.showButtons) {
                        document.removeEventListener('mousedown', this.closePicker, true);
                        document.removeEventListener('touchstart', this.closePicker, true);
                    }
                }

                this.onClose();
                this.pickerOpen = false;
            }
        },


        /**
         * Set the picker's position.
         */
        setPosition: function setPosition() {
            var rect = this.$refs.main.getBoundingClientRect(),
                left = rect.left + window.pageXOffset,
                top = rect.top + window.pageYOffset,
                x = left + this.$refs.container.offsetWidth + 10,
                _x = left - this.$refs.container.offsetWidth,
                y = top + this.$refs.container.offsetHeight + 40,
                _y = top - (this.$refs.container.offsetHeight + 10),
                w = window.innerWidth + window.pageXOffset,
                h = window.innerHeight + window.pageYOffset,
                right = false,
                bottom = false;

            if (x >= w && _x > 0) {
                right = true;
            }

            if (y >= h && _y > 0) {
                bottom = true;
            }

            this.pickerPosition = {
                right: right,
                bottom: bottom
            };
        },
        containerEnter: function containerEnter(elm, done) {
            var _this = this;

            if (!this.embed) {
                elm.classList.add('cdp-visibility-hidden');
                this.setPosition();
                elm.classList.remove('cdp-visibility-hidden');

                window.addEventListener('resize', this.setPosition, true);

                if (!this.showButtons) {
                    document.addEventListener('mousedown', this.closePicker, true);
                    document.addEventListener('touchstart', this.closePicker, true);
                }
            }

            this.onOpen();
            this.opacityAnimation(elm, true).then(function () {
                _this.animationProcessing = false;
                done();
            });
        },
        containerLeave: function containerLeave(elm, done) {
            var _this2 = this;

            this.opacityAnimation(elm, false).then(function () {
                _this2.animationProcessing = false;
                done();
            });
        },
        paletteEnter: function paletteEnter(elm, done) {
            this.opacityAnimation(elm, true).then(done);
        },
        paletteLeave: function paletteLeave(elm, done) {
            this.opacityAnimation(elm, false).then(done);
        },


        /**
         * Returns the current color.
         *
         * @returns {Object}
         */
        get: function get() {
            return !this.color_ ? { value: null } : this.convertColor(this.rgbaColor);
        },


        /**
         * Sets a new color.
         *
         * @param {String} newColor
         */
        set: function set(newColor) {
            if (!newColor && this.allowClearColor) {
                this.clearColor();
            } else if (!newColor) {
                newColor = this.color_;
            } else {
                var rgba = this.getRgbaValue(newColor);
                this.setColor(rgba, true, true);
            }
        },


        /**
         * Shows the picker.
         */
        show: function show() {
            this.openPicker();
        },


        /**
         * Hides the picker.
         */
        hide: function hide() {
            if (this.pickerOpen) {
                this.closePicker(null, true);
            }
        },


        /**
         * Sets the current color as initial color and fires the save callback.
         */
        save: function save() {
            this.initialColor = this.color_;
            this.isDarkInitial = this.rgbaColor.a < 0.4 ? true : this.isDarkCurrent;

            if (!this.embed) {
                this.hide();
            }

            this.onSave();
        },


        /**
         * Sets initial color as current color and fires the cancel callback.
         */
        cancel: function cancel() {
            this.setInitialColorAsColor();

            if (!this.embed) {
                this.hide();
            }

            this.onCancel();
        }
    }
};

export default cordelia;
