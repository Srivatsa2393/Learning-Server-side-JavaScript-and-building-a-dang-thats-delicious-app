const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers.js');

// Do work here
// router.get('/',storeController.myMiddleware, storeController.homePage);
//router.get('/', storeController.homePage);
router.get('/',catchErrors(storeController.getStores));
router.get('/stores',catchErrors(storeController.getStores));
router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore));

// router.get('/reverse/:name', (req,res) => {
//   const reverse = [...req.params.name].reverse().join('')
//   res.send(reverse);
// });

module.exports = router;
