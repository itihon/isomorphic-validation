#!/usr/bin/env node

console.log('this is bin');

import('rollup')
    .then(module => {
        console.log(module);
    })
    .catch(err => {
        console.log(err);
    });