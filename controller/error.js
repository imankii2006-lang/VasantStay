exports.get404 = (req,res,next) =>{
  res.status(404).render('404',{pageTitle: 'page not Found',currentPage:'404',isLoggedIn: req.session.isLoggedIn,user:req.session.user});
}