var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', async (req, res, next) => {
    //const flash = req.session.flash;
    //const flashcolor = req.session.flashcolor;
    //console.log(flash);
    //req.session.flash = null;
    //req.session.flashcolor = null;
    await pool.promise()
        .query('SELECT * FROM meeps')
        .then(([rows, fields]) => {
            res.render('meeps.njk', {
                //flash: flash,
                //flashcolor: flashcolor,
                tasks: rows,
                title:  'Tasks',
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

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
