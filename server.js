const admin = require('firebase-admin');
const serviceAccount = require('./tutorial-47d32-firebase-adminsdk-4kuzo-dff1b09ca6.json'); // auth key... don't share this with anyone
admin.initializeApp({ // authentification with the key above
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore(); 

const express = require("express");
const app = express();
const hostname = "127.0.0.1";
const port = 3000;

const cors = require("cors") // middleware
app.use(cors())

app.use((req, res, next) => {
    console.log("TIME:", Date.now());
    next(); // middleware finished
   });

app.use(express.json()) // gets json data and converts to object
const reviewsRouter = require("./routes/reviews") // Inside a folder called "routes", there is a js file called "reviews" that we are importing here

app.use("/reviews" , reviewsRouter) // Any endpoint that begins with /reviews will be handled by the reviews.js file

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

app.use("/", checkAuth); // use this middleware on the get request for route "/"

app.get("/", (req, res) => { // Landing page that displays all restaurants
    db 
   .collection("Restaurants") // specify the collection to be queried
   .get() // get request
   .then((querySnapshot) => { // an object
        return querySnapshot.docs.map(item => {
        console.log(item.data()) // similar to .json()
        let data = item.data()
         data["id"] = item.id
         console.log(item.id)
        return data;
        })             
    })
    .then((items) => {
        res.send(items)
    }) 
    });



const server = app.listen(3000, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
      });
