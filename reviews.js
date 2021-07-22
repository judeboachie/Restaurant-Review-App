const admin = require('firebase-admin'); // need to import firebase first, but it doesn't need to be initialized here... it was already initialized in server.js
const db = admin.firestore();
var express = require("express"); // import express 
var router = express.Router() // create the router

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
      db.collection("Review").doc(req.params.reviewID)
        .set(req.body, {merge: true}) 
        .then((q) => {
          res.send(
            q.docs.map((item) => {
              return item.data();
            })
          );
        })
        .then(() => {
          res.status(200);
          res.json({ error: null });
        })
        .catch(() => {
          res.status(400);
          res.json({ error: "Something went wrong" });
        });
    })

    
// a DELETE request to delete a review
router
    .route("/:restaurantId/:reviewID") // reviews/:id
    .delete((req, res) => { 
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
    })

module.exports = router // Exporting the router so it can be imported in other files. It's called reviewsRouter in the server.js file.
//This should always be the last line
