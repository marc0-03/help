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
        .query('SELECT * FROM meeps')
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
    const sql = 'INSERT INTO meeps (body,description) VALUES (?,?)'; 
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

router.get('/:id', async (req, res, next) => {
    const id = req.params.id;

    if (isNaN(req.params.id)) {
        res.status(400).json({
            meep : {
                error: 'Bad request'
            }
        })
    } else {
        await pool.promise()
        .query('SELECT * FROM meeps WHERE id = ?', [id])
        .then(([rows, fields]) => {
            res.render('mep.njk', {
                flash: null,
                flashcolor: null,
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
        .query('DELETE from meeps WHERE id = ?', [id])
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

module.exports = router;
