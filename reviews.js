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
        .catch((error) => {
          console.log(error)
          res.status(400);
          res.json({ error: "Something went wrong" });
        });
      }    
})



// a DELETE request to delete a review
router
    .route("/:ownerID/:restaurantId/:reviewID")
    .delete((req, res) => { 
      console.log("Delete")
      console.log(res.locals);

      db.collection('Review').doc(req.params.reviewID)
      .get()
      .then((q) => {
        let reviewDoc = q.data()
        return reviewDoc.restaurantID
      })
      .then((restaurantID) => {
        return db.collection('Restaurants').doc(restaurantID)
        .get()
      })
      .then((q) => {
        let restaurantDoc = q.data()
        return restaurantDoc.ownerID
      })
      .then(ownerID => {
        console.log("Got owner:", res.locals.userId, ownerID)
        if (res.locals.userId == ownerID){
          console.log("Is owner")
          return db.collection(`Review`).doc(req.params.reviewID)
          .delete()
        } else {  
          console.log("Not owner")
          throw new Error("Not owner");   // So basically when we have a promise, we use .then to chain follow up actions. In the case where a .then statement fails, we use a catch statement to capture the failure. When we write .then statements, we can also prematurely exit the chain with a THROW, where we create our own error, which gets captured by the catch statement.
        }
      })
      .then(() => {
        res.status(200);
        res.json({ error: null });
      })
      .catch((error) => {
        res.status(400);
        res.json({ error: "Something went wrong" });
        console.log(error);
      });      
})
        

module.exports = router // Exporting the router so it can be imported in other files. It's called reviewsRouter in the server.js file.
//This should always be the last line
