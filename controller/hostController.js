const fs = require('fs');

const Home = require('../models/home');


exports.getHostHomes  = (req,res,next) => {
  Home.find().then((RegisteredHomes) => {
   res.render('host/host-home-list',{RegisteredHomes: RegisteredHomes, pageTitle: 'Host Home List',currentPage : 'host-homes',
    isLoggedIn: req.session.isLoggedIn,user:req.session.user});
 });
};



exports.getaddhome = (req,res,next) => {
    res.render('host/edit-home',{pageTitle: 'Add Home to airbnb',currentPage : 'add-home', editing: false,isLoggedIn: req.session.isLoggedIn,user:req.session.user, hideSearch:true}); 
    };



exports.postaddhome = (req,res,next) => {
    const{housename,price,location,rating } = req.body


    console.log(housename,price,location,rating);
    console.log(req.file);
    if (!req.file) {
      return res.status(422).send("No image provided");
    }
    const photo = req.file.path;
  
    const home = new Home({housename,price,location,rating,photo});
    home.save().then(() => {
      console.log('home saved Successfully');
      res.redirect('/host/host-home-list');
    });
    //res.redirect('/host/host-home-list');
    };



exports.postEditHome = (req,res,next) => {
    const{id,housename,price,location,rating } = req.body
        Home.findById(id).then((home)=>{
        home.housename = housename;
        home.price = price;
        home.location = location;
        home.rating = rating;
        if(req.file){
      fs.unlink(home.photo,(err)=>{
      if(err){
      console.log("Error while deleting file",err);
    }});
    home.photo = req.file.path; 
  }
        home.save().then(result =>{
          console.log('Home Updated ',result); 
        }).catch( err => {
          console.log('Error while updating',err);
        })
        res.redirect("/host/host-home-list")}
        ).catch(err=>{
        console.log("Error while finding home",err);
      })};

  
      

    exports.getEditHome = (req,res,next)=>{
      const homeId = req.params.homeId;
      const editing = req.query.editing === 'true';
      Home.findById(homeId).then (home =>{
        if(!home){
          console.log("Home not Found for editing.");
           return res.redirect("/host/host-home-list");
        }
        console.log(homeId,editing,home);
        res.render('host/edit-home',{home : home,pageTitle: 'Edit your Home',currentPage : 'host-homes', editing: editing,isLoggedIn: req.session.isLoggedIn,user:req.session.user, hideSearch:false}); 
        })}


    exports.postDeleteHome = (req,res,next) => {
    const homeId = req.params.homeId;
      console.log("Came to delete homeid",homeId);
    Home.findByIdAndDelete(homeId).then(()=>{ 
      res.redirect('/host/host-home-list');
    })
    .catch((error) =>{
     console.log(error);
    })};


        


      