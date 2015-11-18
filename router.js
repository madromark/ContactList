var express = require('express');
var router = new express.Router;
var passport = require('passport');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.flash('info', 'A kért tartalom megjelenítéséhez bejelentkezés szükséges');
    res.redirect('/auth/login');
}

router.route('/auth/login')
    .get(function (req, res) {
        res.render('auth/login');
    })
    .post(passport.authenticate('local-login', {
        successRedirect:    '/list',
        failureRedirect:    '/auth/login',
        failureFlash:       true,
        badRequestMessage:  'Hiányzó adatok'
    }));

router.route('/auth/signup')
    .get(function (req, res) {
        res.render('auth/signup');
    })
    .post(passport.authenticate('local-signup', {
        successRedirect:    '/add',
        failureRedirect:    '/auth/signup',
        failureFlash:       true,
        badRequestMessage:  'Hiányzó adatok'
    }));

router.use('/auth/logout', function (req, res) {
    req.logout();
    res.redirect('/auth/login');
});

// Itt kellene megoldani a végpontokat
router.get('/', function (req, res) {
    res.render('info', {
       title: 'Contact list'
    });
});

router.route('/list')
    .get(ensureAuthenticated, function (req, res) {
        var result;
        if (req.query.query) {
            var keresettNev = req.query.query;
            result = req.app.Models.contact.find({
                 nev: keresettNev,
                 user: req.user.id
            });
        } else {
            result = req.app.Models.contact.find({
                user: req.user.id
            });
        }
        result
            // Ha nem volt hiba fusson le ez
            .then(function (data) {
                res.render('list', {
                    title: 'Contact list',
                    data: data,
                    query: req.query.query,
                    uzenetek: req.flash()
                });
            })
            // Ha volt hiba fusson le ez
            .catch(function () {
                console.log('Hiba!!');
                throw 'error';
            });
        //console.log(req.session.data);
    });
    
router.route('/list/:id')
    .get(ensureAuthenticated, function (req, res) {
        req.app.Models.contact.find({ id: req.params.id })
        .then(function (data) {
            res.render('list', {
                title: 'Contact list',
                data: data,
                uzenetek: req.flash()
            });  
        })
        .catch(function () {
            console.log('Hiba!!');
            throw 'error';
        });
    });
router.route('/add')
    .get(ensureAuthenticated, function (req, res) {
        res.render('add', {
            title: 'Contact list',
            uzenetek: req.flash()
        });
    })
    .post(ensureAuthenticated, function (req, res) {
        req.checkBody('nev', 'Nem adott meg nevet')
            .notEmpty();
        req.checkBody('telszam', 'Nem adott meg telefonszámot')
            .notEmpty();
        req.checkBody('datum', 'Hiba a születésnappal')
            .isDate()
            .withMessage('Nem megfelelő dátumformátum');
        
        if (req.validationErrors()) {
            req.validationErrors().forEach(function (error) {
                req.flash('error', error.msg);
            });
            res.redirect('/add');
        } else {
            req.app.Models.contact.create({
                nev: req.body.nev,
                datum: req.body.datum,
                telszam: req.body.telszam,
                mail: req.body.mail,
                user: req.user.id
            })
            .then(function () {
                req.flash('success', 'Névjegy felvéve');
                res.redirect('/add');
            })
            .catch(function () {
                req.flash('error', 'Névjegy felvétele sikertelen!');
                res.redirect('/add');
            });
        }
        //console.log(req.session.data);
    });
    
router.route('/edit/:id')
    .get(ensureAuthenticated, function (req, res) {
        req.app.Models.contact.find({ id: req.params.id })
        .then(function (data) {
            
            //console.log(data);
            //console.log(data[0].nev);
            
            res.render('edit', {
                title: 'Szerkesztés',
                nev: data[0].nev,
                telszam: data[0].telszam,
                mail: data[0].mail,
                datum: data[0].datum,
            });  
            
        })
        .catch(function () {
            console.log('Hiba!!');
            throw 'error';
        })
    })
    .post(ensureAuthenticated, function (req, res) {
        console.log("ittvagyok");
        req.checkBody('nev', 'Nem adott meg nevet')
            .notEmpty();
        req.checkBody('telszam', 'Nem adott meg telefonszámot')
            .notEmpty();
        req.checkBody('datum', 'Hiba a születésnappal')
            .isDate()
            .withMessage('Nem megfelelő dátumformátum');
        
        if (req.validationErrors()) {
            req.validationErrors().forEach(function (error) {
                req.flash('error', error.msg);
            });
            res.redirect('/edit');
        } else {
            req.app.Models.contact.find({ id: req.params.id })
                .then(function (data) {
                    data[0].nev = req.params.nev 
                })
            .then(function () {
                req.flash('success', 'Névjegy módosítva');
                res.redirect('/list');
            })
            .catch(function () {
                req.flash('error', 'Névjegy módosítás sikertelen!');
                res.redirect('/edit');
            });
        }
        console.log(req.session.data);
    });
    
router.use('/delete/:id', ensureAuthenticated, function (req, res) {
        /*req.session.data = req.session.data || [];
        req.session.data = req.session.data.filter(function (elem) {
            return elem.id != req.params.id;
        });*/
        req.app.Models.contact.destroy({ id: req.params.id })
        .then(function () {
            req.flash('success', 'Névjegy törölve');
            res.redirect('/list'); 
        })
        .catch(function () {
            req.flash('error', 'Névjegy törlése sikertelen');
            res.redirect('/list');
        });;
    });

module.exports = router;