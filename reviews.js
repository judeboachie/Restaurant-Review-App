const admin = require('firebase-admin'); // need to import firebase first, but it doesn't need to be initialized here... it was already initialized in server.js
const db = admin.firestore();
var express = require("express"); // import express 
var router = express.Router() // create the router


function checkAuth(req, res, next) { // creating the middleware
  if (req.headers.authtoken) { // the token is attached to the header of the get request on index.html "getRestaurants(authToken)"
    admin
      .auth()
      .verifyIdToken(req.headers.authtoken) // want to verify that this is a valid token 
      .then((user) => { // gives back a firebase user object 
        console.log("verified");
        res.locals.userId = user.user_id // store this id in res.locals
        next(); // accept the request and pass it over to the router 
      })
      .catch(() => {
        res.status(403).send("Unauthorized"); // verification failed, so reject the request
      });
  } else {
    res.status(403).send("Unauthorized"); // no auth token provided
  }
}

router.get("/:restaurantId", checkAuth); // use this middleware on the get request for route "/:restaurantId"
router.post("/:restaurantId", checkAuth);
router.put("/:restaurantId/:reviewID", checkAuth);
router.delete("/:restaurantId/:reviewID", checkAuth);




// a GET request to read all the reviews for a restaurant
router.route("/:restaurantId") 
    .get((req, res) => { //the : means we are expecting a parameter called restaurantId
        db 
        .collection("Review").where("restaurantID", "==", req.params.restaurantId) //this refers to :restaurantId 
        .get() 
        .then((querySnapshot) => {
             return querySnapshot.docs.map(item => {
             console.log(item.data())   
             let data = item.data()
             data["id"] = item.id
             console.log(item.id)
             return data
             })             
         })
         .then((data) => {
             res.send(data)
         })
});


// a POST request to create a review
router
    .route("/:restaurantId")
    .post((req, res) => {
      db.collection("Review")
      .add({
          author: req.body.author,
          name: req.body.name,
          restaurant: req.body.restaurant,
          restaurantID: req.body.restID,
          picture: "123.jpeg",
          review: req.body.review, // this is linked to body: JSON.stringify({review: ""}) in reviews.html
          reviewerId: req.body.reviewerId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          res.status(200);
          res.json({ error: null });
        })
        .catch(() => {
          res.status(400);
          res.json({ error: "Something went wrong" });
        });
});
    
    

// a PUT request to update a review. 
router
    .route("/:restaurantId/:reviewID") 
    .put((req, res) => {
      if (req.body.uid == req.body.reviewerId){ // a review can only be edited by the original poster 
      db.collection("Review").doc(req.params.reviewID)
        .set(req.body, {merge: true})         
        .then(() => {
          res.status(200);
          res.json({ error: null });
      })
        .catch((error) => {
          console.log(error)
          res.status(400);
          res.json({ error: "Something went wrong" });
        });
      } else {
        console.log("You can not edit this review.")
      }    
})



// a DELETE request to delete a review
router
    .route("/:ownerID/:restaurantId/:reviewID")
    .delete((req, res) => { 
      if(req.body.uid == req.body.owner){ // a review can only be deleted by the restaurant owner
      db.collection(`Review`).doc(req.params.reviewID)
        .delete() //Delete the document
        .then(() => {
          res.status(200);
          res.json({ error: null });
        })
        .catch(() => {
          res.status(400);
          res.json({ error: "Something went wrong" });
        });
       } else {
         console.log("You can't delete this review.")
       }         
})
        

module.exports = router // Exporting the router so it can be imported in other files. It's called reviewsRouter in the server.js file.
//This should always be the last line
