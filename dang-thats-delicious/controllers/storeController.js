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
};

exports.addStore = (req,res) => {
  //res.send('It works');
  res.render('editStore', { title : 'Add Store'})
};

exports.createStore = async (req,res) => {
  // console.log(req.body);
  // res.json(req.body);
  const store = await (new Store(req.body)).save();
  //await store.save();
  //console.log('It works');
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req,res) => {
  //1.Query the database for a list of all stores
  const stores = await Store.find();
  console.log(stores);
  res.render('stores',{title: 'Stores', stores: stores});
};

exports.editStore = async (req,res) => {
  //1.Find the store for the given ID
  //res.json(req.params);
  const store = await Store.findOne({ _id: req.params.id });
  //res.json(store);
  //2.Confirm that are the owner of the store
  //3.Render out the edit form so the user can update their store
  res.render('editStore', {title: `Edit ${store.name}`, store});
};

exports.updateStore = async (req,res) => {
  //find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`);
  //Redirect them to store and tell them it worked
  res.redirect(`/stores/${store._id}/edit`);
};
