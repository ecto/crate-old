
var fs = require('fs'),
    path = require('path');

var crate = {
  dir: __dirname,
  hidden: false,
  blacklist: ['fs', 'module'],

  analyze: function(dir, cb){
    var paths = [];
    crate.dir = dir || __dirname;
    crate.crawl(function(files){
      var requires = [],
          inspectors = 0;
      for (var i in files) {
        inspectors++;
        crate.inspectFile(files[i], function(reqs){
          inspectors--;
          for (var i in reqs) {
            if (requires.indexOf(reqs[i]) == -1) requires.push(reqs[i]);
          }
        });
      }
      setInterval(function(){
        if (inspectors == 0) {
          cb(requires);
          clearInterval(this);
        }
      }, 1);
    });
  },

  filter: function(){
    for (var i in requires) {
      var modulePath = crate.resolvePath(requires[i]);
      var requirement = {
        name: requires[i],
        path: modulePath
      }
      requires[i] = requirement;
    }
  },

  crawl: function(dir, cb){
    if (typeof dir == 'function' && !cb) {
      cb = dir;
      dir = crate.dir;
    }
    var paths = [],
        crawlers = 0;
    crate.files(dir, function(err, files){
      for (var i in files) {
        var stat = fs.statSync(files[i]);
        if (stat.isFile()) {
          paths.push(files[i]);
        } else if (stat.isDirectory()) {
          if ((files[i].indexOf('/.') != -1 && crate.hidden) || files[i].indexOf('/.') == -1) {
            crawlers++;
            crate.crawl(files[i], function(p){
              for (var i in p) {
                paths.push(p[i]);
              }
              crawlers--;
            });
          }
        }
      }
      setInterval(function(){
        if (crawlers == 0) {
          cb(paths);
          clearInterval(this);
        }
      }, 1);
    });
  },

  files: function(directory, cb){
    if (typeof directory == 'function' && !cb) {
      cb = directory;
      directory = crate.dir;
    }
    fs.readdir(path.resolve(crate.dir, directory), function(err, files){
      if (err) cb(err);
      else {
        var paths = [];
        for (i in files) {
          paths.push(path.resolve(crate.dir, directory, files[i]));
        }
        cb(null, paths);
      }
    });
  },

  // inspect a js file and return an array of dependencies
  inspectFile: function(file, cb){
    fs.readFile(file, function(err, data){
      var reqs = [],
          data = data.toString(),
          matcher = /require\([\'|\"]?((?:[a-zA-Z0-9]+))[?\'|\"]?\)/gi,
          match;
      while (match = matcher.exec(data)) {
        if (match[1]) reqs.push(match[1].replace(/\'/g,'').replace(/\"/g,''));
      }
      cb(reqs);
    });
  },


  resolveVersion: function(name){
  },
  
  // return full path of file
  resolvePath: function(name){
    try {
      if (require.paths && require.paths.indexOf(crate.dir) == -1) {
        require.paths.unshift(crate.dir);
      } else if (process.env.NODE_PATH.indexOf(crate.dir)) {
        process.env.NODE_PATH = crate.dir + ':' + process.env.NODE_PATH;
      }
      var modulePath = require.resolve(name);
    } finally {
      return modulePath || '';
    }
  },

  save: function(){

  }
}

module.exports = crate;
