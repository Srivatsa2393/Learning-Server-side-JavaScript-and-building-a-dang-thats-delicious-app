// exports.myMiddleware = (req,res,next) => {
//   req.name = 'Sri';
//   if(req.name === 'Sri'){
//     throw Error('This is a stupid name');
//   }
//   next();
// };


exports.homePage = (req,res) => {
  console.log(req.name);
  res.render('index')
}

exports.addStore = (req,res) => {
  //res.send('It works');
  res.render('editStore', { title : 'Add Store'})
}

exports.createStore = (req,res) => {
  console.log(req.body);
  res.json(req.body);
}
