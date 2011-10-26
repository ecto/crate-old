#!/usr/bin/env node

var crate = require('crate'),
    dir = process.cwd();

crate.analyze(dir, function(reqs){
  console.log('Your app requires the following modules to run:');
  for (var i in reqs) {
  console.log('  ' + reqs[i]);
  }
});
