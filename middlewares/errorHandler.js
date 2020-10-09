// ERROR HANDLERS

// catch not found errors
const notFoundHandler = (err, req, res, next) => {
    if (err.httpStatusCode === 404) {
      res.status(404).send("Resource not found!")
    }
    next(err) // if it is not the last in chain remember to add next(err)!
  }
  
  // catch unauthorized errors
  
  const unauthorizedHandler = (err, req, res, next) => {
    if (err.httpStatusCode === 401) {
      res.status(401).send("Unauthorized!")
    }
    next(err)
  }
  
  // catch forbidden errors
  const forbiddenHandler = (err, req, res, next) => {
    if (err.httpStatusCode === 403) {
      res.status(403).send("Operation Forbidden")
    }
    next(err)
  }
  
  // catch all
  const catchAllHandler = (err, req, res, next) => {
    if (!res.headersSent) {
      res.status(err.httpStatusCode || 500).send(err.message)
    }
    next(err)
  }
  
  module.exports = {
    notFoundHandler,
    unauthorizedHandler,
    forbiddenHandler,
    catchAllHandler,
  }