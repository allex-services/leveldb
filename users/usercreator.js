function createUser(execlib, ParentUser, leveldblib) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    _readStreamHandlers = new lib.Map(),
    HookableUserSessionMixin = leveldblib.HookableUserSessionMixin;

  if (!ParentUser) {
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  var UserSession = ParentUser.prototype.getSessionCtor('.'),
    Channel = UserSession.Channel;

  function HookChannel (usersession){
    Channel.call(this, usersession);
  }
  lib.inherit(HookChannel, Channel);
  HookChannel.prototype.name = 'l';

  function HookSession (user, session, gate) {
    UserSession.call(this, user, session, gate);
    HookableUserSessionMixin.call(this, this.user.__service);
    this.addChannel(HookChannel);
  }

  UserSession.inherit(HookSession, HookableUserSessionMixin.__methodDescriptors);
  HookableUserSessionMixin.addMethods(HookSession);

  HookSession.prototype.__cleanUp = function () {
    HookableUserSessionMixin.prototype.destroy.call(this);
    UserSession.prototype.__cleanUp.call(this);
  };

  HookSession.Channel = HookChannel;




  function User(prophash) {
    ParentUser.call(this, prophash);
  }
  
  ParentUser.inherit(User, require('../methoddescriptors/user'), [/*visible state fields here*/]/*or a ctor for StateStream filter*/);
  User.prototype.__cleanUp = function () {
    ParentUser.prototype.__cleanUp.call(this);
  };

  User.prototype.put = function (key, value, defer) {
    qlib.promise2defer(this.__service.put(key, value), defer);
  };

  function geterrorer (defer, error) {
  }

  User.prototype.get = function (key, defer) {
    var error = lib.Error;
    this.__service.get(key).then(
      function (result) {
        defer.resolve(result);
        defer = null;
        error = null;
      },
      function (err) {
        if (error.NotFound) {
          defer.reject(new error('VALUE_NOT_FOUND'));
        } else {
          defer.reject(error);
        }
        defer = null;
        error = null;
      }
    );
  };

  User.prototype.safeGet = function (key, deflt, defer) {
    qlib.promise2defer(this.__service.safeGet(key, deflt), defer);
  };

  User.prototype.del = function (key, defer) {
    qlib.promise2defer(this.__service.del(key), defer);
  };

  User.prototype.read = function (options, defer) {
    new ReadStreamHandler(null, options, this.__service.getReadStream(options), defer);
  };

  User.prototype.getControllableReadStream = function (options, defer) {
    var id = lib.uid();
    new ReadStreamHandler(id, options, this.__service.getReadStream(options), null);
    defer.resolve(id);
  };

  User.prototype.readStreamControl = function (id, command, params, defer) {
    var rsh = _readStreamHandlers.get(id);
    if (!rsh) {
      defer.reject(new lib.Error('INVALID_READ_STREAM_ID', id+' is not a valid ReadStreamHandler id'));
      return;
    }
    var m = rsh[command];
    if ('function' !== typeof m) {
      defer.reject(new lib.Error('INVALID_READ_STREAM_METHOD', command+' is not a ReadStreamHandler method'));
      return;
    }
    params.push(defer);
    m.apply(rsh, params);
  };

  function ReadStreamHandler (id, options, stream, defer) {
    if (!stream) {
      this.destroy();
      return;
    }
    if (id) {
      _readStreamHandlers.add(id, this);
      stream.pause();
    } else if (!defer) {
      this.destroy();
      return;
    }
    this.stream = stream;
    this.defer = defer;
    this.cursor = 0;
    this.count = 0;
    this.buffer = null;
    this.id = id;
    if (!isNaN(options.chunksize)) {
      this.buffer = new Array(options.chunksize);
    }
    stream.on('data', this.onData.bind(this));
    stream.on('end', this.onEnd.bind(this));
    stream.on('close', this.destroy.bind(this));
  }
  ReadStreamHandler.prototype.destroy = function () {
    if (!this.stream) {
      return;
    }
    if (this.defer) {
      this.defer.resolve(this.count);
    }
    if (this.id) {
      _readStreamHandlers.remove(this.id);
    }
    this.id = null;
    this.buffer = null;
    this.count = null;
    this.defer = null;
    this.stream = null;
  };
  ReadStreamHandler.prototype.resume = function (count, defer) {
    this.stream.resume();
    if (this.id) {
      if (this.defer) {
        defer.reject(new lib.Error('CHUNK_STILL_IN_PROGRESS', 'Chunk still in progress'));
        return;
      }
      if (count !== this.buffer.length) {
        this.buffer = new Array (count);
      }
      this.cursor = 0;
      this.defer = defer;
    }
  };
  ReadStreamHandler.prototype.notify = function (something) {
    if (this.defer) {
      this.defer.notify(something);
      if (this.id) {
        this.defer.resolve(true);
        this.defer = null;
        this.stream.pause();
      }
    }
  };
  ReadStreamHandler.prototype.onData = function (item) {
    if (this.buffer) {
      if (this.cursor < this.buffer.length) {
        this.buffer[this.cursor] = item;
        this.cursor++;
      } else {
        this.notify(this.buffer);
        this.cursor = 0;
      }
    } else {
      this.notify(item);
    }
  };
  ReadStreamHandler.prototype.onEnd = function () {
    if (this.cursor) {
      this.defer.notify(this.buffer.splice(0, this.cursor));
    }
    this.destroy();
  };

  User.prototype.getSessionCtor = execlib.execSuite.userSessionFactoryCreator(HookSession);

  return User;
}

module.exports = createUser;
