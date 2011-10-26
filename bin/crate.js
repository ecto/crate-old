#!/usr/bin/env node

var crate = require('crate'),
    dir = process.cwd();

crate.analyze(dir, function(reqs){
  console.log(crate.resolve(reqs));
  return;
  if (!reqs || reqs.length < 1) {
    console.log('No node module requirements found in this directory.');
  } else {
    console.log('Your app requires the following modules to run:');
    for (var i in reqs) {
      console.log('  ' + reqs[i]);
    }
  }
});
