// exports.myMiddleware = (req,res,next) => {
//   req.name = 'Sri';
//   if(req.name === 'Sri'){
//     throw Error('This is a stupid name');
//   }
//   next();
// };

const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next){
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto){
      next(null, true);
    }else{
      next({ message: 'That filetype isn\'t allowed!'}, false);
    }
  }
};


exports.homePage = (req,res) => {
  console.log(req.name);
  res.render('index')
};

exports.addStore = (req,res) => {
  //res.send('It works');
  res.render('editStore', { title : 'Add Store'})
};

//middleware to actually work with createStore, it just stores it memory it does not save it in disc
exports.upload = multer(multerOptions).single('photo');

//resize the image using another middlewaare
exports.resize = async (req, res, next) => {
  //check if there is no new file to resize
  if(!req.file){
    next();//skip to next middleware
    return;
  }
  //console.log(req.file);
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  //now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  //once we have written the photo to our filesysytem, keep going!
  next();
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
  //set the location data to be a point
  req.body.location.type = 'Point';
  //find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`);
  //Redirect them to store and tell them it worked
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
  // res.send('it works');
  //res.json(req.params);
  const store = await Store.findOne({ slug: req.params.slug });
  if(!store) return next();
  // res.json(store);
  res.render('store', {store, title: store.name});
};
