const express = require('express');
const router = express.Router();
const auth = require('./auth');

// home route should always link to splash/
router.get('/', (req, res) => {
    res.redirect('/splash');
});

// these routes need auth to work
const authed_pages = ['/friends', '/personal', '/private', '/public', '/settings', '/tournament'];
router.use(authed_pages, (req, res, next) => {
    const authCheck = auth.validate(req, res);
    if (authCheck.code !== 200) {
        res.redirect('/splash');
        return;
    }

    next();
}); 

// all frontend pages
router.use('/', express.static('../webapp'));

module.exports = router;
