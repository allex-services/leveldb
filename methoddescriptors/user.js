module.exports = {
  put: [{
    title: 'Key',
    anyOf: [{type: 'array'}, {type: 'object'}, {type: 'string'}, {type: 'number'}]
  },{
    title: 'Value',
    anyOf: [{type: 'array'}, {type: 'object'}, {type: 'string'}, {type: 'number'}]
  }],
  get: [{
    title: 'Key',
    anyOf: [{type: 'array'}, {type: 'object'}, {type: 'string'}, {type: 'number'}]
  }],
  del: [{
    title: 'Key',
    anyOf: [{type: 'array'}, {type: 'object'}, {type: 'string'}, {type: 'number'}]
  }],
  read: [{
    title: 'Read stream Options',
    type: 'object'
  }],
  getControllableReadStream: [{
    title: 'Read stream Options',
    type: 'object'
  }],
  readStreamControl: [{
    title: 'Read stream id',
    type: 'string'
  },{
    title: 'Method name',
    type: 'string'
  },{
    title: 'Array of parameters',
    type: 'array'
  }]
};
