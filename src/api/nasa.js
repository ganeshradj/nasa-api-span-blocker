const express = require('express');
const axios = require('axios');
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");

const router = express.Router();
const NASA_API_URL = "https://api.nasa.gov/insight_weather/?";

const limiter = rateLimit({
  windowMs: 10 * 1000, // 15 minutes
  max: 5, // limit each IP to 100 requests per windowMs,
  message:
  "Please dont spam"
});
const speedLimiter = slowDown({
  windowMs: 60 * 1000, // 1 minutes
  delayAfter: 1, // allow 1 requests per 1 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 100:
});

let cacheData;
let cacheTime;
const APIKEYS = new Map();
APIKEYS.set("abcde",true);

router.get('/',limiter,speedLimiter, (req,res,next)=>{
  if(APIKEYS.has(req.get('X-API-KEY'))){
    next();
  } else {
    const error = new Error("Not a Valid API KEY");
    next(error);
  }
}, async (req, res, next) => {
  if(cacheData && cacheTime > (new Date() - 5 * 60 * 1000)){
    return res.json(cacheData);
  }
  const params = new URLSearchParams({
    api_key:process.env.NASA_API_KEY,
    feedtype:"json",
    ver:'1.0'
  })
  try {
    console.log(process.env)
    const {data} = await axios.get(`${NASA_API_URL}${params}`);
    cacheData = data;
    cacheTime = new Date();
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
