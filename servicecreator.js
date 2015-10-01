var levelup = require('level'),
  child_process = require('child_process');

function createLevelDBService(execlib, ParentServicePack) {
  'use strict';
  var lib = execlib.lib,
    q =lib.q,
    ParentService = ParentServicePack.Service;

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')) 
    };
  }

  function LevelDBService(prophash) {
    ParentService.call(this, prophash);
    this.db = null;
    this.dbput = null;
    this.dbget = null;
    if (prophash.initiallyemptydb) {
      child_process.exec('rm -rf '+prophash.dbname, this.createDB.bind(this, prophash));
    } else {
      this.createDB(prophash);
    }
  }
  
  ParentService.inherit(LevelDBService, factoryCreator);
  
  LevelDBService.prototype.__cleanUp = function() {
    this.dbget = null;
    this.dbput = null;
    this.db = null;
    ParentService.prototype.__cleanUp.call(this);
  };

  LevelDBService.prototype.isInitiallyReady = function (propertyhash) {
    return !propertyhash.initiallyemptydb;
  };

  LevelDBService.prototype.createDB = function (prophash) {
    this.db = levelup(prophash.dbname, lib.extend({}, prophash.dbcreationoptions));
    this.dbput = q.nbind(this.db.put, this.db);
    this.dbget = q.nbind(this.db.get, this.db);
    if (this.readyToAcceptUsersDefer) {
      this.readyToAcceptUsersDefer.resolve(true);
    }
  };

  LevelDBService.prototype.propertyHashDescriptor = {
    dbname: {
      type: 'string'
    }
  };
  
  return LevelDBService;
}

module.exports = createLevelDBService;
