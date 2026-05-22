require("dotenv").config();

const paymentRouter = require("./routes/paymentRouter");

//core modules
const path = require('path');
const express = require('express');
const multer = require('multer');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);



const dbUrl = process.env.DB_PATH;


//local module
const StoreRouter = require("./routes/StoreRouter");
const reviewRouter = require("./routes/reviewRouter");
const {HostRouter} = require('./routes/HostRouter');
const rootDir = require('./utils/pathutil');
const errorcontroller = require('./controller/error');
//const {mongoConnect} = require('./utils/databaseutil'); 
const {default: mongoose} = require('mongoose');
//const authcontroller = require('./controller/authController');
const authRouter = require("./routes/authRouter");


const app = express();
//after ejs install for adding registeredhomes in html or makng dynamic UI with html
app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new MongoDBStore({
    uri:dbUrl,
    collection:'sessions'
});
const randomString = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  //multer start
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, randomString(10) + '-' + file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
  
  const multerOptions = {
    storage, fileFilter
  };
  

//middleware for bodyobject
app.use(express.urlencoded()); 
//multer end
app.use(multer(multerOptions).single('photo'));
app.use(express.static(path.join(rootDir,'public')));//ye css ke liye public karne ke liye
app.use("/uploads",express.static(path.join(rootDir,'uploads')));
app.use("/host/uploads",express.static(path.join(rootDir,'uploads')));
app.use("/homes/uploads",express.static(path.join(rootDir,'uploads')));
app.use("/ConfirmBooking/uploads",express.static(path.join(rootDir,'uploads')));


app.use(session({
    secret:"My Project is airBnB",
    resave:false,
    saveUninitialized:true,
    store
}))

app.use((req,res,next) =>{
        req.isLoggedIn = req.session.isLoggedIn;
    next();

})
app.use("/",reviewRouter);

app.use(express.json());
app.use(paymentRouter);

app.use(authRouter);

app.use(StoreRouter);
app.use('/host',(req,res,next) =>{
    if(req.isLoggedIn){
     next();
    }else{
    res.redirect('/login');
    }
   
});

app.use(HostRouter);




app.use(errorcontroller.get404);



const PORT =  process.env.PORT || 3000;

mongoose.connect(dbUrl).then(() =>{
    console.log('connected to Mongo')
app.listen(PORT, () => {
console.log(`server is running on port ${PORT}`)
});

}).catch(err =>{
    console.log('Error while connecting to Mongo:',err);

})