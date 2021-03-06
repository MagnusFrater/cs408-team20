const express = require('express');
const router = express.Router();
const path = require('path');

// root route => splash page
router.get('/', (req, res, next) => {
    res.sendFile(path.resolve('static/html/splash.html'));
});

const allowed = [
    'login', 'signup',
    'public', 'private',
    'profile', 'settings',
    'email-verification', 'forgot-password', 'renew-password',
    '404'
];
router.get('/:page', (req, res, next) => {
    if (!allowed.includes(req.params.page)) {
        next();
    }

    res.sendFile(path.resolve('static/html/' + req.params.page + '.html'));
});

module.exports = router;
