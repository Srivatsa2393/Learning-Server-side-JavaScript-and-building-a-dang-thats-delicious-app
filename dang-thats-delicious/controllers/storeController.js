// exports.myMiddleware = (req,res,next) => {
//   req.name = 'Sri';
//   if(req.name === 'Sri'){
//     throw Error('This is a stupid name');
//   }
//   next();
// };

const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
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
  req.body.author = req.user._id;
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

const confirmOwner = (store, user) => {
  if(!store.author.equals(user._id)){
    throw Error('You must own a store in order to edit it!');
  }
}

exports.editStore = async (req,res) => {
  //1.Find the store for the given ID
  //res.json(req.params);
  const store = await Store.findOne({ _id: req.params.id });
  //res.json(store);
  //2.Confirm that they are the owner of the store
  confirmOwner(store, req.user);
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
  const store = await Store.findOne({ slug: req.params.slug }).populate('author reviews');
  if(!store) return next();
  // res.json(store);
  res.render('store', {store, title: store.name});
};


exports.getStoresByTag = async (req, res) => {
  // res.send('It works');
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = await Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery});

  //passing multiple promises
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  //res.json(stores);
  //using destructuring
  // var tags = result[0];
  // var stores = result[1];
  // res.json(result);
  // res.json(tags);
  res.render('tag', {tags, title: 'Tags', tag, stores});
};


exports.searchStores = async(req, res) => {
  //res.json({ it: 'Worked' });
  //res.json(req.query);
  const stores = await Store
  //first find stores that match
  .find({
    $text: {
      $search: req.query.q
    }
  }, {
    score: { $meta: 'textScore' }
  })
  //then sort them
  .sort({
    score: { $meta: 'textScore'}
  })
  //llimit to only 5 results
  .limit(5);
  res.json(stores);
};


exports.mapStores = async (req, res) => {
  //res.json({it: 'worked'});
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  //res.json(coordinates);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000 //10km
      }
    }
  };

  const stores = await Store.find(q).select('slug name description location photo').limit(10);
  res.json(stores);

}

exports.mapPage = (req, res) => {
  res.render('map', { title : 'Map'});
}

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  //console.log(hearts);
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User
  .findByIdAndUpdate(req.user._id,
    { [operator] : {hearts: req.params.id}},
    { new: true}
  );
  res.json(user);
}

exports.getHearts = async (req, res) => {
  const stores = await Store.find({
    _id: { $in: req.user.hearts }
  });
  //res.json(stores);
  res.render('stores', {title: 'Hearted Stores', stores});
}
