const router = require("express").Router();
const fetch = require("node-fetch")


router.get('/city', (req, res, next) => {
try {
    let url    = 'http://api.openweathermap.org/data/2.5/group?id=2885657,2927043,2911288,2867714,2925533'
    
    let appId  = 'appid=18736655fd2b041bd52b9620fb92a408';
    let units  = '&units=metric';

    
    const apiUrl  = url +'&'+ appId + units
    
    fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
        res.send( data.list )
    })
    .catch(err =>{
        console.log(err)
    })
} catch (error) {
    error.httpStatusCode = 500
    next(error)
    console.log(error);
}
    
})

router.get('/forecast', async (req, res, next) => {
    try {
        
       let array = [] 
        
        let appId  = 'appid=18736655fd2b041bd52b9620fb92a408';
        let units  = '&units=metric';        

        await Promise.all([                    
            fetch("https://api.openweathermap.org/data/2.5/onecall?lat=52.44&lon=13.58&exclude=hourly,minutely"+'&'+ appId + units)
            .then((response) => response.json())
            .then(data => array.push(data)),
            fetch("https://api.openweathermap.org/data/2.5/onecall?lat=48.81&lon=9.16&exclude=hourly,minutely"+'&'+ appId + units)
            .then((response) => response.json())
            .then(data => array.push(data)),
            fetch("https://api.openweathermap.org/data/2.5/onecall?lat=53.55&lon=10.02&exclude=hourly,minutely"+'&'+ appId + units)
            .then((response) => response.json())
            .then(data => array.push(data)),
            fetch("https://api.openweathermap.org/data/2.5/onecall?lat=48.14&lon=11.58&exclude=hourly,minutely"+'&'+ appId + units)
            .then((response) => response.json())
            .then(data => array.push(data)),
            fetch("https://api.openweathermap.org/data/2.5/onecall?lat=50.12&lon=8.68&exclude=hourly,minutely"+'&'+ appId + units)
            .then((response) => response.json())
            .then(data => array.push(data))
        ])

        res.send(array)
        
    } catch (error) {
        error.httpStatusCode = 500
        next(error)
        console.log(error);
    }
        
    })

module.exports = router;

/* let zipcode
router.post('/locationSearch', (req, res, next) => {
    try {
        zipcode = req.body.zipcode
        if( !zipcode || zipcode.length < 5 || zipcode.length > 5) {
            res.send('Error')
        } else {
            res.redirect('/current-weather')
        }
    } catch (error) {
        next(error)
    }
}) */