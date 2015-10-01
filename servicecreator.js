var leveldown = require('level');

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
    this.db = level(prophash.dbname, lib.extend({}, prophash.dbcreationoptions));
  }
  
  ParentService.inherit(LevelDBService, factoryCreator);
  
  LevelDBService.prototype.__cleanUp = function() {
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
