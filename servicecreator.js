function createLevelDBService(execlib, ParentServicePack, leveldblib) {
  'use strict';
  var lib = execlib.lib,
    q =lib.q,
    ParentService = ParentServicePack.Service,
    LevelDBHandler = leveldblib.LevelDBHandler;

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')) 
    };
  }

  function LevelDBService(prophash) {
    ParentService.call(this, prophash);
    prophash.starteddefer = this.readyToAcceptUsersDefer;
    LevelDBHandler.call(this, prophash);
  }
  
  ParentService.inherit(LevelDBService, factoryCreator);
  lib.inheritMethods(LevelDBService, LevelDBHandler, 'setDB', 'createDB');
  
  LevelDBService.prototype.__cleanUp = function() {
    this.dbget = null;
    this.dbput = null;
    this.db = null;
    ParentService.prototype.__cleanUp.call(this);
  };

  LevelDBService.prototype.isInitiallyReady = function (propertyhash) {
    return !propertyhash.initiallyemptydb;
  };

  LevelDBService.prototype.propertyHashDescriptor = {
    dbname: {
      type: 'string'
    }
  };
  
  return LevelDBService;
}

module.exports = createLevelDBService;
