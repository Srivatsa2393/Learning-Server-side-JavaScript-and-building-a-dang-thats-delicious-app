// exports.myMiddleware = (req,res,next) => {
//   req.name = 'Sri';
//   if(req.name === 'Sri'){
//     throw Error('This is a stupid name');
//   }
//   next();
// };

const mongoose = require('mongoose');
const Store = mongoose.model('Store')

exports.homePage = (req,res) => {
  console.log(req.name);
  res.render('index')
}

exports.addStore = (req,res) => {
  //res.send('It works');
  res.render('editStore', { title : 'Add Store'})
}

exports.createStore = async (req,res) => {
  // console.log(req.body);
  // res.json(req.body);
  const store = new Store(req.body);
  await store.save();
  //console.log('It works');
  res.redirect('/');
}
