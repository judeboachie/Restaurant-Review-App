require('dotenv').config()
const admin = require('firebase-admin');


admin.initializeApp({ // authentification with the key above
  credential: admin.credential.cert(JSON.parse(Buffer.from(process.env.GOOGLE_CONFIG_BASE64, 'base64').toString('ascii'))
  )
});
const db = admin.firestore(); 

const express = require("express");
const app = express();
const hostname = "0.0.0.0";
const port = process.env.PORT || 3000; //process.env is a config file / environment file where variables can be set outside of our code. 


const cors = require("cors") // middleware
app.use(cors())

app.use((req, res, next) => {
    console.log("TIME:", Date.now());
    next(); // middleware finished
   });

app.use(express.json()) // gets json data and converts to object
const reviewsRouter = require("./routes/reviews") // Inside a folder called "routes", there is a js file called "reviews" that we are importing here

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

app.use("/reviews" , [checkAuth, reviewsRouter]) // Any endpoint that begins with /reviews will be handled by the reviews.js file


// a POST request to register a new USER 
app.post("/createUser", (req, res) => {
  db.collection("Users").doc(req.body.name)
      .set({
        name: req.body.name,
        picture:  "123.jpeg",
        userId: req.body.userId
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



const server = app.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
      });
