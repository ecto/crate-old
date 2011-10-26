
var fs = require('fs'),
    path = require('path');

var crate = {
  dir: __dirname,
  hidden: false,

  analyze: function(dir){
    var paths = [];
    crate.dir = dir || __dirname;
    crate.crawl(function(files){
      console.log(files);
    });
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
  inspect: function(){

  },

  resolveVersion: function(){

  },
  
  // return full path of file
  resolvePath: function(){

  },

  save: function(){

  }
}

module.exports = crate;
