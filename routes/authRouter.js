const express = require('express');

const authRouter = express.Router();
const authcontroller = require('../controller/authController');


authRouter.get('/login',authcontroller.getlogin);
authRouter.get('/SignUp',authcontroller.getSignUp);
authRouter.post('/login',authcontroller.postlogin);
authRouter.post('/logout',authcontroller.postlogout);
authRouter.post('/SignUp',authcontroller.postsignup);


module.exports = authRouter;

