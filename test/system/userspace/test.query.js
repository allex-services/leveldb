var _lookup = {};

function initialPutter (res) {
  if (res) {
    _lookup[res[0]] = res[1];
  }
}

function initialDeler (res) {
  if (res) {
    delete _lookup[res[0]];
  }
}

function QueryChecker (sink, filter, initdefer) {
  this.initdefer = initdefer;
  this.phase = 1;
  this.task = taskRegistry.run('queryLevelDB', {
    sink: sink,
    filter: filter,
    scanInitially: true,
    onPut: this.onPut.bind(this),
    onDel: this.onDel.bind(this),
    onInit: this.onInit.bind(this)
  });
}
QueryChecker.prototype.destroy = function () {
  if (this.task) {
    this.task.destroy();
  }
  this.task = null;
  this.phase = null;
  this.initdefer = null;
}
QueryChecker.prototype.onInit = function (recordcount) {
  this.phase = 2;
  if (this.initdefer) {
    this.initdefer.resolve(recordcount);
  }
};
QueryChecker.prototype.phaseName = function () {
  if (this.phase === 1) {
    return 'init';
  }
  if (this.phase === 2) {
    return 'post-init';
  }
  return 'Unknown phase name: '+this.phase;
};
QueryChecker.prototype.onPut = function (kva) {
  console.log(this.phaseName(), kva);
};
QueryChecker.prototype.onDel = function (key) {
  console.log(this.phaseName(), key);
};


function doWrite (res) {
  var key, value;
  if (!LDB.destroyed) {
    return;
  }
  initialPutter(res);
  key = 'a'+String.fromCharCode(~~(Math.random()*5)+64);
  value = ''+(~~(Math.random()*100));
  console.log('will put', [key, value]);
  LDB.call('put', key, value).then(
    doWrite
  );
}

describe('Testing Query', function () {
  loadClientSide(['allex_leveldblib']);
  findSinkIt({
    sinkname: 'LDB'
  });
  it('Scan LDB initially', function () {
    var taskobj = {task: null, defer: q.defer()}, ret = taskobj.defer.promise;
    taskobj.task = taskRegistry.run('queryLevelDB', {
      sink: LDB,
      filter: {},
      scanInitially: true,
      onPut: initialPutter,
      onDel: initialDeler,
      onInit: function () {
        if (taskobj && taskobj.task && taskobj.defer) {
          taskobj.task.destroy();
          taskobj.task = null;
          taskobj.defer.resolve(true);
          taskobj.defer = null;
          taskobj = null;
        }
      }
    });
    return ret;
  });
  it('Keep writing', function () {
    doWrite();
  });
  it('Query LDB', function () {
    var d = q.defer(), ret = d.promise;
    new QueryChecker(LDB, {
        keys: {
          op: 'startswith',
          field: null,
          value: 'a'
        }
      },d);
    return ret;
  });
  it('destroy LDB', function () {
    LDB.destroy();
  });
});
