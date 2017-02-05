function createLevelDBService(execlib, ParentService, leveldblib) {
  'use strict';
  var lib = execlib.lib,
    q =lib.q,
    LevelDBHandler = leveldblib.LevelDBHandler;

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user'), leveldblib) 
    };
  }

  function LevelDBService(prophash) {
    ParentService.call(this, prophash);
    prophash.listenable = true;
    prophash.starteddefer = this.readyToAcceptUsersDefer;
    LevelDBHandler.call(this, prophash);
  }
  
  ParentService.inherit(LevelDBService, factoryCreator);
  lib.inheritMethods(LevelDBService, LevelDBHandler, 'setDB', 'createDB', 'safeGet', 'getReadStream', 'readInto', 'streamInto', 'traverse', 'onLevelDBCreated', 'query');
  
  LevelDBService.prototype.__cleanUp = function() {
    this.dbget = null;
    this.dbput = null;
    this.db = null;
    LevelDBHandler.prototype.destroy.call(this);
    ParentService.prototype.__cleanUp.call(this);
  };

  LevelDBService.prototype.isInitiallyReady = function (propertyhash) {
    return false;
  };

  LevelDBService.prototype.propertyHashDescriptor = {
    dbname: {
      type: 'string'
    }
  };
  
  execlib.leveldblib = leveldblib;
  
  return LevelDBService;
}

module.exports = createLevelDBService;
