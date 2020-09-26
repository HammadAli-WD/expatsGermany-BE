const router = require("express").Router();
const fetch = require("node-fetch")
const _ = require('lodash');


router.get('/liveData', (req, res, next) => {
try {
    let url    = process.env.COVIDAPI_GER_LIVEDATA        
    fetch(url)
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

module.exports = router;