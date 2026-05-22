const express = require('express');

const HostRouter = express.Router();

const hostcontroller = require('../controller/hostController');

HostRouter.get('/host/add-home',hostcontroller.getaddhome);
HostRouter.get('/host/host-home-list',hostcontroller.getHostHomes);


HostRouter.post('/host/add-home', hostcontroller.postaddhome);
HostRouter.get('/host/edit-home/:homeId', hostcontroller.getEditHome);
HostRouter.post('/host/edit-home', hostcontroller.postEditHome);
HostRouter.post('/host/delete-home/:homeId',hostcontroller.postDeleteHome);

  
exports.HostRouter = HostRouter;



