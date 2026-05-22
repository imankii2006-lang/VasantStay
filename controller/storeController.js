const mongoose = require("mongoose");
const Booking = require("../models/Bookings");
const Review = require("../models/reviews");
//const RegisteredHomes = [];

//const { RegisteredHomes } = require('../../Lecture-12 dynamic-UI/routes/HostRouter');
const Home = require('../models/home');
const User = require('../models/user');

//ye nhi samajh aya copy paste kiya hun

exports.gethome = async (req, res, next) => {
  try {
      // 1. Saare homes database se fetch karein
      const RegisteredHomes = await Home.find();

      // 2. User ke favourites nikaalein
      let userFavs = [];
      if (req.session.user) {
          const currentUser = await User.findById(req.session.user._id);
          if (currentUser && currentUser.favourites) {
              // null values hatane ke liye filter aur string mein badalne ke liye map
              userFavs = currentUser.favourites
                  .filter(id => id != null)
                  .map(id => id.toString());
          }
      }

      // 3. NAYA OBJECT RETURN KARNE KA LOGIC
      // Hum 'RegisteredHomes' ko scan kar rahe hain aur har home ke liye naya object bana rahe hain
      const updatedHomes = RegisteredHomes.map(home => {
          // Check: Kya is home ki ID user ke favourites array mein hai?
          const isFav = userFavs.includes(home._id.toString());
          
          // Yahan hum naya object return kar rahe hain
          return {
              ...home._doc,      // Iska matlab: Home ka saara purana data copy kar lo
              isFavourite: isFav // Aur ye ek naya status (true/false) add kar do
          };
      });

      // 4. Ab updatedHomes ko render mein bhejein
      res.render('store/home-list', {
          RegisteredHomes: updatedHomes, // Naye objects wali list
          pageTitle: 'Homes List',
          currentPage: 'home',
          isLoggedIn: req.session.isLoggedIn,
          user: req.session.user
      });

  } catch (err) {
      console.log("Error logic mein hai:", err);
      next(err);
  }
};
  
  
  
  exports.getindex = (req,res,next) => {
    console.log("session value:",req.session);
    Home.find().then(RegisteredHomes=>{
     res.render('store/index',{RegisteredHomes: RegisteredHomes, pageTitle: 'index',currentPage : 'index',isLoggedIn: req.session.isLoggedIn,user:req.session.user});
   });
  }
  

  exports.getBooking = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        const bookings = await Booking.find({ user: userId })
            .populate("homeId");

        for (let bookedhome of bookings) {
            // 1. Saare reviews fetch karna (jo aap pehle se kar rahe hain)
            const reviews = await Review.find({ home: bookedhome.homeId._id })
                                      .populate("user", "firstName lastName"); 

            bookedhome.reviews = reviews;

            // 2. Average Rating calculate karna
            if (reviews.length > 0) {
                const total = reviews.reduce((sum, r) => sum + r.rating, 0);
                bookedhome.avgRating = (total / reviews.length).toFixed(1);
            } else {
                bookedhome.avgRating = "New";
            }

            // ✅ 3. NEW LOGIC: Check karna ki kya CURRENT USER ne is home par review diya hai
            // Hum 'reviews' array mein hi check kar lenge taaki extra DB call na karni pade
            const userReview = reviews.find(r => r.user._id.toString() === userId.toString());
            
            // Agar userReview mil jata hai, toh isReviewed true hoga
            bookedhome.isReviewed = !!userReview; 
        }

        res.render("store/Booking", {
            bookings: bookings,
            pageTitle: 'My Bookings',
            currentPage: 'bookings',
            isLoggedIn: req.session.isLoggedIn,
            user: req.session.user
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};
exports.postCancelBooking = async (req, res) => {
  try {
    console.log("full body:",req.body);
    const homeId = req.body.homeId;
    console.log("homeId",homeId);
    console.log("homeId",homeId);
      // req.params.id mein wahi single ID aayegi jo button se bheji gayi hai
      const bookingIdToCancel = req.params.id; 
      console.log("cancelledId",bookingIdToCancel);

      // Ye query sirf USI ID ko delete karegi, poori array ko nahi
      const result = await Booking.findByIdAndUpdate(bookingIdToCancel,{
        status:"Cancelled",
        cancelledAt: Date.now()
      });
        
      if (result) {
          console.log(`Booking ${bookingIdToCancel} has been cancelled.`);
          res.redirect('/bookings'); // Refresh page
      } else {
          res.status(404).send("Booking nahi mili");
      }
  } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
  }
};
 
    
  
  exports.getConfirmBooking = (req,res,next) => {
    const homeId = req.params.bookId;
    console.log(homeId);
    Home.findOne({_id: homeId}).then((home) =>{
      if(home){
        console.log('Already markes favourites',home);
        res.render('store/ConfirmBooking', {home: home ,  pageTitle: 'Confirm Your Booking',currentPage : 'bookings',isLoggedIn: req.session.isLoggedIn, user:req.session.user,availability:null, checkIn: '', checkOut: '' });
  }else{
  res.redirect('/');
  }
  })}
  exports.getfavouritelist = async (req,res,next) => {
    const userId = req.session.user._id;
    const user =  await User.findById(userId).populate('favourites');
    res.render('store/favourite-list',{favouriteHomes : user.favourites , pageTitle: 'My Favourite-list',currentPage : 'favourite-list',isLoggedIn: req.session.isLoggedIn, user:req.session.user,
});
}




exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.params.id; // Ensure routing mein :homeId use ho raha ho
  const userId = req.session.user._id;
  
  const user = await User.findById(userId);

  // YAHAN HAI ASLI LOGIC:
  if (user.favourites.includes(homeId)) {   
      // Agar pehle se hai, toh click karne par REMOVE kar do
      user.favourites = user.favourites.filter(fav =>fav && fav.toString() !== homeId.toString());
      await user.save();
      console.log("Removed from favourites");
  } else {
      // Agar nahi hai, toh click karne par ADD kar do
      user.favourites.push(homeId);
      await user.save();
      console.log("Added to favourites");
  }

  // Hard-coded path ki jagah yeh use karein:
  const backURL = req.get('Referrer') || '/homes'; 
  res.redirect(backURL);
};



    exports.postRemoveFromFavourite  = async (req, res, next) => {
      const homeId = req.params.homeId;
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      if (user.favourites.includes(homeId)) {
        user.favourites = user.favourites.filter(fav => fav != homeId);
        await user.save();
      }
      res.redirect("/favourites");
    };

    exports.gethomedetails = (req, res, next) => {
      const homeId = req.params.homeId;
      console.log("At home details page:", homeId);
    
      Home.findById(homeId).then(async (home) => { // async add kiya hai await use karne ke liye
        if (!home) {
          console.log("Home Not Found");
          return res.redirect("/homes");
        } else {
          // Default false rakhein
          home.isFavourite = false;
    
          // Agar user logged in hai, toh check karein
          if (req.session.isLoggedIn && req.session.user) {
            const User = require('../models/user'); // Apna User model path check kar lein
            const user = await User.findById(req.session.user._id);
            
            if (user && user.favourites) {
              home.isFavourite = user.favourites.some(
                (fav) => fav.toString() === homeId.toString()
              );
            }
          }
    
          Review.find({ home: homeId })
            .populate("user", "firstName lastName")
            .then((reviews) => {
              res.render('store/home-detail', {
                home: home,
                reviews: reviews,
                pageTitle: 'Home Details',
                currentPage: 'home',
                isLoggedIn: req.session.isLoggedIn,
                user: req.session.user,
              });
            });
        }
      });
    };

    exports.getsearch = async (req, res) => {
      const { q } = req.query;
    
      let filter = {};
    
      if (q && q.trim() !== "") {
        const words = q.toLowerCase().trim().split(/\s+/);
    
        let conditions = [];
    
        // 🔥 yahan ignore words define karo
        const ignoreWords = ["in", "the", "of", "a", "home", "stay", "place"];
    
        // 🔥 cheap words (typo bhi handle)
        const cheapWords = ["cheap", "chip", "cheep", "budget"];
    
        for (let i = 0; i < words.length; i++) {
          let word = words[i];
    
          // ❌ ignore useless words
          if (ignoreWords.includes(word)) continue;
    
          // 🔥 CHEAP / BUDGET
          if (cheapWords.includes(word)) {
            conditions.push({ price: { $lte: 2800 } });
            continue;
          }
    
          // 🔥 LUXURY
          if (word === "luxury" || word === "premium") {
            conditions.push({ price: { $gte: 7000 } });
            continue;
          }
    
          // 🔥 PRICE (under / above)
          if (word === "under" && words[i + 1]) {
            let price = Number(words[i + 1]);
            if (!isNaN(price)) {
              conditions.push({ price: { $lte: price } });
            }
            i++;
            continue;
          }
    
          if (word === "above" && words[i + 1]) {
            let price = Number(words[i + 1]);
            if (!isNaN(price)) {
              conditions.push({ price: { $gte: price } });
            }
            i++;
            continue;
          }
          // 🔥 RATING FILTER (rating 4)
// 🔥 RATING FILTER (advanced)
if (word === "rating") {

  // rating more than 4.3
  if (words[i + 1] === "more" && words[i + 2] === "than" && words[i + 3]) {
    let rating = parseFloat(words[i + 3]);

    if (!isNaN(rating)) {
      conditions.push({
        rating: { $gte: rating }
      });
    }

    i += 3;
    continue;
  }
  
  // rating less than 4
  if (words[i + 1] === "less" && words[i + 2] === "than" && words[i + 3]) {
    let rating = parseFloat(words[i + 3]);

    if (!isNaN(rating)) {
      conditions.push({
        rating: { $lte: rating }
      });
    }

    i += 3;
    continue;
  }

  // simple: rating 4
  if (words[i + 1]) {
    let rating = parseFloat(words[i + 1]);

    if (!isNaN(rating)) {
      conditions.push({
        rating: { $gte: rating }
      });
    }

    i++;
    continue;
  }
}
    
          // 🔥 skip numbers
          if (!isNaN(word)) continue;
    
          // 🔥 TEXT SEARCH (location + title)
          conditions.push({
            $or: [
              { housename: { $regex: word, $options: "i" } },
              { location: { $regex: word, $options: "i" } }
            ]
          });
        }
    
        // apply conditions
        if (conditions.length > 0) {
          filter.$and = conditions;
        }
      }     console.log(filter);
    
      const RegisteredHomes = await Home.find(filter);
    
      res.render('store/index',{RegisteredHomes: RegisteredHomes, pageTitle: 'search',currentPage : 'index',isLoggedIn: req.session.isLoggedIn,user:req.session.user});
    };


    exports.isAvailability = async (req, res, next) => {
      const checkIn = req.query.checkIn || '';
      const checkOut = req.query.checkOut || '';
      const homeId = req.query.homeId;
      const guests = req.query.guests;
  
      const home = await Home.findById(homeId);
  // 1. Strict Date Parsing
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const today = new Date();

  // 2. Time ko Normalize karein (Sabka time 00:00:00 karein)
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // 3. Terminal mein value check karne ke liye (Check VS Code Terminal)
  console.log("--- DEBUG START ---");
  console.log("Check-In Value:", d1.getTime());
  console.log("Today Value   :", today.getTime());
  console.log("Is Past?      :", d1.getTime() < today.getTime());
  console.log("--- DEBUG END ---");

  // 4. BACKEND VALIDATION LOGIC
  // Agar date purani hai YA check-in check-out se bada hai
  if (d1.getTime() < today.getTime() || d2.getTime() < d1.getTime()) {
      console.log("❌ Rejecting: Past Date detected in Backend!");
      
      // Green flag ko rokne ke liye yahan se hi RETURN kar dein
      return res.render('store/ConfirmBooking', {
          home: home,
          pageTitle: 'Confirm Your Booking',
          currentPage: 'bookings',
          isLoggedIn: req.session.isLoggedIn,
          user: req.session.user,
          availability: false, // <--- Yeh Red flag dikhayega
          checkIn: checkIn,
          checkOut: checkOut,
          guests: guests,
          totalNights: 1,
          errorMessage: "Past dates are not allowed!" 
      });
  }
      // 4. Ab Nights calculate karein
      const timeDiff = d2.getTime() - d1.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      const totalNights = nights > 0 ? nights : 1;
  
      // 5. 🔥 Overlap Logic (Sirf valid dates ke liye hi chalega)
      const existingBooking = await Booking.findOne({
          homeId: homeId,
          $or: [
              {
                  checkIn: { $lt: new Date(checkOut) },
                  checkOut: { $gt: new Date(checkIn) }
              }
          ]
      });
  
      if (existingBooking) {
          return res.render('store/ConfirmBooking', { 
              home: home, 
              pageTitle: 'Confirm Your Booking', 
              currentPage: 'bookings', 
              isLoggedIn: req.session.isLoggedIn, 
              user: req.session.user, 
              availability: false, 
              checkIn: checkIn, 
              checkOut: checkOut, 
              guests: guests, 
              totalNights: totalNights 
          });
      }
  
      return res.render('store/ConfirmBooking', { 
          home: home, 
          pageTitle: 'Confirm Your Booking', 
          currentPage: 'bookings', 
          isLoggedIn: req.session.isLoggedIn, 
          user: req.session.user, 
          availability: true, 
          checkIn: checkIn, 
          checkOut: checkOut, 
          guests: guests, 
          totalNights: totalNights 
      });
  };