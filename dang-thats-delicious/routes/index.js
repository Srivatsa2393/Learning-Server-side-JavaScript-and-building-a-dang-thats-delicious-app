const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  // console.log('Hey!!!')
  const sri = { name: 'Srivatsa', age: 24, color: 'white', cool: true};
  // res.json(sri);
  // res.send('Hey! It works!');
  // res.send(req.query.name);
  res.json(req.query);
});

router.get('/reverse/:name', (req,res) => {
  const reverse = [...req.params.name].reverse().join('')
  res.send(reverse);
});

module.exports = router;
