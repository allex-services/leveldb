var levelup = require('level');

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
    this.db = levelup(prophash.dbname, lib.extend({}, prophash.dbcreationoptions));
    this.dbput = q.nbind(this.db.put, this.db);
    this.dbget = q.nbind(this.db.get, this.db);
  }
  
  ParentService.inherit(LevelDBService, factoryCreator);
  
  LevelDBService.prototype.__cleanUp = function() {
    this.dbget = null;
    this.dbput = null;
    this.db = null;
    ParentService.prototype.__cleanUp.call(this);
  };

  LevelDBService.prototype.propertyHashDescriptor = {
    dbname: {
      type: 'string'
    }
  };
  
  return LevelDBService;
}

module.exports = createLevelDBService;
