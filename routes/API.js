const { response } = require('express');
var express = require('express');
var router = express.Router();
const pool = require('../database');

/* GET users listing. */
router.get('/', async (req, res, next) => {
  await pool.promise()
      .query('SELECT * FROM marnyd_meeps')
      .then(([rows, fields]) => {
          res.json({
              tasks: {
                  data: rows
              }
          });
      })
      .catch(err => {
          console.log(err);
          res.status(500).json({
              tasks: {
                  error: 'Error getting meeps'
              }
          })
      });
});

module.exports = router;
