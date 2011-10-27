#!/usr/bin/env node

var crate = require('crate'),
    colors = require('colors'),
    dir = process.cwd();

crate.analyze(dir, function(reqs){
  crate.resolve(reqs, function(err, resolved){
    if (!resolved || resolved.length < 1) {
      console.log('No proprietary node module requirements found in this directory.');
    } else {
      console.log('Your app requires the following proprietary modules to run:');
      for (var i in resolved) {
        console.log('  ' + resolved[i].name + ' v' + resolved[i].version);
      }
    }
  });
});
