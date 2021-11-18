const router = require("express").Router();
const fetch = require("node-fetch")
const _ = require('lodash');
const covidModel = require('../../Models/Covid')
const url = process.env.COVIDAPI_GER_LIVEDATA 

//Live data updates
router.get('/germanyCases', (req, res, next) =>{
 try {
        fetch(url + '/summary')
         .then(res => res.json())
         .then(data => 
            res.send(data.Countries[63]))
    } catch (error) {
      next(error)
      console.log(error);
 }
})

//Data updates day wise
router.get('/lastData', (req, res, next) => {
 try {
        
    fetch(url + '/country/germany')
     .then(res => res.json())
     .then(data => {
        res.send(_.last(data))
    })
    .catch(err =>{
        console.log(err)
    })
 } catch (error) {
   next(error)
   console.log(error);
 }
    
})

//https://ourworldindata.org/mortality-risk-covid#interpreting-the-case-fatality-rate
router.get('/CFR', (req, res, next) => {
   
 try {
          
    fetch(url+ '/country/germany')
     .then(res => res.json())
     .then(data => {
    const cfr = _.slice(data, -2)
                         .reduce((prev, cur) =>  ((cur.Deaths)/(prev.Confirmed))*100)    
   const caseFatalityRate = covidModel({caseFatalityRate:cfr});
   caseFatalityRate.save()
   res.send(
    caseFatalityRate
    )
    })    
    .catch(err =>{
        console.log(err)
    })
 } catch (error) {
   next(error)
   console.log(error);
}
    
})


module.exports = router;