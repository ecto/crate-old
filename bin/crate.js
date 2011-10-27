#!/usr/bin/env node

var crate = require('crate'),
    colors = require('colors'),
    dir = process.cwd();

crate.analyze(dir, function(reqs){
  crate.resolve(reqs, function(err, resolved){
    if (!resolved || resolved.length < 1) {
      console.log('No proprietary node module requirements found in this directory.'.red);
    } else {
      console.log('Your app runs on the following proprietary modules:'.blue);
      for (var i in resolved) {
        console.log('  ' + resolved[i].name.magenta + ' v'.cyan + resolved[i].version.cyan);
      }
      crate.save(resolved, function(err, package){
        if (err) {
          console.log('An error was encountered on package.json save:'.red);
          console.log('  ' + err.red);
        } else {
          console.log('Saved to package.json!'.green);
          console.log(package);
        }
      });
    }
  });
});
