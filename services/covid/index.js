const router = require("express").Router();
const fetch = require("node-fetch")
const _ = require('lodash');
const covidModel = require('./schema')
const url = process.env.COVIDAPI_GER_LIVEDATA 

//Live data updates
router.get('/globalCases', (req, res, next) =>{
 try {
        fetch(url + '/summary')
         .then(res => res.json())
         .then(data => 
            res.send(data.Global))
    } catch (error) {
        
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
 }
    
})

//Data updates day wise
router.get('/casesIncreased', (req, res, next) => {
   
 try {
          
    fetch(url+ '/country/germany')
     .then(res => res.json())
     .then(data => {
    const recentCases = _.slice(data, -2)
                         .reduce((prev, cur) =>  (cur.Confirmed)-(prev.Confirmed))    
   const newCases = covidModel({newCases:recentCases});
   newCases.save()
   res.send(
    newCases
    )
    })    
    .catch(err =>{
        console.log(err)
    })
 } catch (error) {
    next(error)
}
    
})


module.exports = router;