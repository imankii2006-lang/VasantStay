const express = require('express');

const StoreRouter = express.Router();
const storecontroller = require('../controller/storeController');


StoreRouter.get('/',storecontroller.getindex);
StoreRouter.get('/bookings',storecontroller.getBooking);
StoreRouter.get('/favourites',storecontroller.getfavouritelist);

StoreRouter.get('/homes',storecontroller.gethome);
StoreRouter.get('/homes/:homeId',storecontroller.gethomedetails);
StoreRouter.post("/favourites/:id",storecontroller.postAddToFavourite),
StoreRouter.post('/favourites/delete/:homeId',storecontroller.postRemoveFromFavourite);
StoreRouter.get('/ConfirmBooking/:bookId',storecontroller.getConfirmBooking);
StoreRouter.get('/search',storecontroller.getsearch);
StoreRouter.post('/Cancel-Booking/:id',storecontroller.postCancelBooking);
StoreRouter.get('/availability',storecontroller.isAvailability);



module.exports = StoreRouter;