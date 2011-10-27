
var fs = require('fs'),
    path = require('path'),
    m = require('module');

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

  resolve: function(reqs, exclude, cb){
    if (exclude && typeof exclude == 'function' && !cb) {
      cb = exclude;
      exclude = true;
    }
    if (!cb) throw new Error('Must provide callback to resolve()');
    var exclude = exclude || true,
        full = [],
        resolvers = 0;
    for (var i in reqs) {
      var moduleName = reqs[i],
          modulePath = crate.resolvePath(moduleName);
      if ((exclude && modulePath.indexOf('/') != -1) || !modulePath) {
        var modulePath = crate.resolvePath(moduleName);
        if (!modulePath) continue;
        resolvers++;
        crate.resolvePackage(modulePath, function(err, module){
          if (err) console.log(err);
          if (module && module.name && module.version) {
            var requirement = {
              name: module.name,
              version: module.version
            }
            full.push(requirement);
          }
          resolvers--;
        });
      }
    }
    setInterval(function(){
      if (resolvers == 0) {
        clearInterval(this);
        cb(null, full);
      }
    }, 1);
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


  resolvePackage: function(file, cb){
    fs.readFile(file, function(err, data){
      var e = null;
      if (err) {
        cb(err);
        return;
      }
      data = data.toString();
      try {
        data = JSON.parse(data);
      } catch (e) {
        e = 'Could not parse package.json for ' + file;
      }
      cb(e, data);
    });
  },
  
  // return full path of file
  resolvePath: function(name){
    try {
      var paths = m._nodeModulePaths(crate.dir),
          mega = m._paths.concat(paths);
      var modulePath = m._findPath(name, mega);
    } finally {
      if (!modulePath) return '';
      var raw = modulePath.split('/'),
          possible = [],
          package;
      raw.pop();
      possible.push(raw.join('/') + '/package.json');
      raw.pop();
      possible.push(raw.join('/') + '/package.json');
      raw.pop();
      possible.push(raw.join('/') + '/package.json');
      do {
        var stat;
        try {
          var possiblePath = possible.shift();
              stat = fs.statSync(possiblePath);
        } catch(e) {

        } finally {
          if (stat && stat.isFile()) package = possiblePath;
        }
      } while (!package)
      return package || '';
    }
  },

  save: function(deps, cb){
    var packagePath = crate.dir + '/package.json',
        e;
    try {
      var package = fs.readFileSync(packagePath);
      package = JSON.parse(package.toString());
    } catch (e) {
      e = 'Could not read package.json at ' + packagePath;
    }
    if (e) {
      cb(e);
    } else {
      if (!package.dependencies) package.dependencies = {};
      for (var i in deps) {
        if (!package.dependencies[deps[i].name] && package.name != deps[i].name) {
          package.dependencies[deps[i].name] = deps[i].version;
        }
      }
      var result = JSON.stringify(package, null, 2);
      fs.writeFileSync(packagePath, result);
      cb(e, package);
    }
  }
}

module.exports = crate;
