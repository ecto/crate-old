#!/usr/bin/env node

var crate = require('crate'),
    dir = process.cwd();

crate.analyze(dir);
