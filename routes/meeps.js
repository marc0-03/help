const { response } = require('express');
var express = require('express');
var router = express.Router();
const pool = require('../database');

/* GET users listing. */
router.get('/', async (req, res, next) => {
    const flash = req.session.flash;
    const flashcolor = req.session.flashcolor;
    console.log(flash);
    req.session.flash = null;
    req.session.flashcolor = null;
    await pool.promise()
        .query('SELECT * FROM marnyd_meeps')
        .then(([rows, fields]) => {
            res.render('meeps.njk', {
                flash: flash,
                flashcolor: flashcolor,
                meeps: rows,
                title:  'meeps',
                layout: 'layout.njk'
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                meeps: {
                    error: 'Error getting meeps'
                }
            })
        })
});

router.post('/', async (req, res, next) => {
    const sql = 'INSERT INTO marnyd_meeps (body,description) VALUES (?,?)'; 
    console.log(req.body);
    const meep = req.body.meep;
    const description = req.body.description;
    if (meep.length < 3) {
        res.status(400).json({
            meeps: {
                error: "Invalid meep"
            }
        });
    } else if (description.length < 3) {
        res.status(400).json({
            meeps: {
                error: "Invalid meep"
            }
        });
    }
    await pool.promise()
    .query(sql, [meep, description])
    .then((response) => {
        if (response[0].affectedRows==1) {
            req.session.flash = 'Meep: [' + meep + "] successfully posted";
            req.session.flashcolor = 'success';
        res.redirect('/meeps');
        } else {
            res.status(400).json({
                meeps: {
                    error: "Invalid meep"
                }
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            meeps: {
                error: "Cannot retrieve meeps"
            }
        });
    });
});

router.post('/search', async (req, res, next) => {
    console.log(req.body);
    console.log(req.body.search);

    const search = "SELECT * FROM marnyd_meeps WHERE body LIKE '%"+req.body.search+"%'";
    console.log(search)   
    
    const flash = req.session.flash;
    const flashcolor = req.session.flashcolor;
    console.log(flash);
    req.session.flash = null;
    req.session.flashcolor = null;
    await pool.promise()
        .query(search)
        .then(([rows, fields]) => {
            res.render('meeps.njk', {
                flash: flash,
                flashcolor: flashcolor,
                meeps: rows,
                title:  'meeps',
                layout: 'layout.njk'
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                tasks: {
                    error: 'Error getting tasks'
                }
            })
        })
});

router.get('/:id', async (req, res, next) => {
    const flash = req.session.flash;
    const flashcolor = req.session.flashcolor;
    console.log(flash);
    req.session.flash = null;
    req.session.flashcolor = null;
    const id = req.params.id;

    if (isNaN(req.params.id)) {
        res.status(400).json({
            meep : {
                error: 'Bad request'
            }
        })
    } else {
        await pool.promise()
        .query('SELECT * FROM marnyd_meeps WHERE id = ?', [id])
        .then(([rows, fields]) => {
            res.render('mep.njk', {
                flash: flash,
                flashcolor: flashcolor,
                meeps: rows,
                title:  'meeps',
                layout: 'layout.njk'
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                meeps: {
                    error: 'Error getting meeps'
                }
            })
        })
    }
});

router.get('/:id/delete', async (req, res, next) => {
    const id = req.params.id;
    await pool.promise()
        .query('DELETE from marnyd_meeps WHERE id = ?', [id])
        .then((response) => {
            if (response[0].affectedRows==1) {
            req.session.flash = 'Meep deleted';
            req.session.flashcolor = 'success';
            res.redirect('/meeps');
            } else {
            req.session.flash = 'Meep not found';
            req.session.flashcolor = 'danger';
            res.status(400).redirect('/meeps');
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                meeps: {
                    error: 'Error getting meeps'
                }
            })
        })
})

router.get('/:id/edit', async (req, res, next) => {
    const flash = req.session.flash;
    const flashcolor = req.session.flashcolor;
    console.log(flash);
    req.session.flash = null;
    req.session.flashcolor = null;
    const id = req.params.id;

    if (isNaN(req.params.id)) {
        res.status(400).json({
            meep : {
                error: 'Bad request'
            }
        })
    } else {
        await pool.promise()
        .query('SELECT * FROM marnyd_meeps WHERE id = ?', [id])
        .then(([rows, fields]) => {
            res.render('medit.njk', {
                flash: flash,
                flashcolor: flashcolor,
                meeps: rows,
                title:  'meeps',
                layout: 'layout.njk'
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                meeps: {
                    error: 'Error getting meeps'
                }
            })
        })
    }
});

router.post('/:id/edit', async (req, res, next) => {
    const id = req.params.id;
    const sql = 'UPDATE marnyd_meeps SET body = ?, description= ?, updated_at=CURRENT_TIMESTAMP WHERE id = ?'
    const meep = req.body.meep;
    const description = req.body.description;
    
        await pool.promise()
        .query(sql, [meep, description, id])
        .then((response) => {
            if (response[0].affectedRows==1) {
                req.session.flash = 'Meep: [' + meep + "] successfully changed";
                req.session.flashcolor = 'success';
            res.redirect('/meeps/'+id);
            } else {
                res.status(400).json({
                    meeps: {
                        error: "Invalid meep"
                    }
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                meeps: {
                    error: "Cannot retrieve meeps"
                }
            });
        });
});

router.get('/sort/:sort', async (req, res, next) => {
    let sort = "ORDER BY ";
    if (req.params.sort==1) {
        sort+="body"
    } else if (req.params.sort==2) {
        sort+="updated_at"
    } else {
        sort+="id"
    }

    const flash = req.session.flash;
    const flashcolor = req.session.flashcolor;
    console.log(flash);
    req.session.flash = null;
    req.session.flashcolor = null;
    await pool.promise()
        .query('SELECT * FROM marnyd_meeps '+sort)
        .then(([rows, fields]) => {
            res.render('meeps.njk', {
                flash: flash,
                flashcolor: flashcolor,
                meeps: rows,
                title:  'meeps',
                layout: 'layout.njk'
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                tasks: {
                    error: 'Error getting tasks'
                }
            })
        })
});

module.exports = router;
