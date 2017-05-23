exports.myMiddleware = (req,res,next) => {
  req.name = 'S ri';
  if(req.name === 'Sri'){
    throw Error('This is a stupid name');
  }
  next();
};


exports.homePage = (req,res) => {
  console.log(req.name);
  res.render('index')
}
