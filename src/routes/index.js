const fs = require('fs');
const path = require('path');
const router = require('express').Router();

fs.readdirSync(__dirname)
    .filter(file => file !== 'index.js' && file.endsWith('.js'))
    .forEach(file => {
        const routeModule = require(path.join(__dirname, file));
        const name = '/' + file
            .replace('Routes.js', '')
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            .toLowerCase();
        router.use(name, routeModule);
    });

module.exports = router;