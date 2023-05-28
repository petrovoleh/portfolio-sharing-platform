const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');

router.get('/search', function (req, res) {
    res.render('search', {
        session: req.session,
        users: []
    });
});

router.get('/searchusers', (req, res) => {
    const searchRequest = req.query.searchrequest;

    // Find users whose names contain the search request
    User.find({ name: { $regex: searchRequest, $options: 'i' } }, (err, users) => {
        if (err) {
            console.error(err);
            res.render("search", { session: req.session, users: [] });
            return;
        }

        res.render("search", { session: req.session, users: users });
    });
});

router.get('/admin/search', function (req, res) {
    if (req.session.isLoggedIn !== true || req.session.user.type !== "admin") {
        res.redirect('/');
    }
    res.render('searchadmin', {
        session: req.session,
        users: []
    });
});
router.get('/searchadmin', (req, res) => {
    const searchRequest = req.query.searchrequest;

    // Find users whose names contain the search request
    User.find({ name: { $regex: searchRequest, $options: 'i' } }, (err, users) => {
        if (err) {
            console.error(err);
            res.render("searchadmin", { session: req.session, users: [], posts: [] });
            return;
        }

        // Find posts with text containing the search request
        Post.find({ text: { $regex: searchRequest, $options: 'i' } }, (err, posts) => {
            if (err) {
                console.error(err);
                res.render("searchadmin", { session: req.session, users: [], posts: [] });
                return;
            }

            res.render("searchadmin", { session: req.session, users: users, posts: posts });
        });
    });
});

module.exports = router;