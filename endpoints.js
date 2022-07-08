base_uri = "http://62.217.127.19:8010/";
let recommendedMovies = [];
let responses = []

document
  .getElementById("searchMovieByStringButton")
  .addEventListener("click", (e) => searchMovieByString());
document
  .getElementById("searchMovieByIdButton")
  .addEventListener("click", (e) => searchMovieById());
document
  .getElementById("searchRatingsByIDsButton")
  .addEventListener("click", (e) => searchMovieRatingsByIDs());
document
  .getElementById("searchRatingsByUserIDButton")
  .addEventListener("click", (e) => searchMovieRatingsByUserId());

document 
  .getElementById("recommendMovies")
  .addEventListener("click", (e) =>  FyncFilt() );
  let helper = 23074
  document
  .getElementById("myId")
  .addEventListener("click",(e)=>{ document.getElementById("myDiv").innerHTML = `<h3>Your Id : ${helper}</h3>`});
// function for endpoint 1
async function searchMovieByString() {
  const movieTerm = document.getElementById("movieTerm").value; // save ("Harry") in movieTerm
  try {
    data = { keyword: movieTerm };
    const response = await fetch(base_uri + "movie", {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data), // to object mou to opoio to metatrepw se string 
    });
    const res = await response.json();
    buildAndDisplayTable(res, ["movieId", "title", "genres"]);
  } catch (err) {
    document.getElementById("queryResults").innerHTML = err.message;
  }
}

// function for endpoint 2
function searchMovieById() {
  const xhr = new XMLHttpRequest();
  const movieId = document.getElementById("movieId").value;
  const uri = base_uri + "movie/" + movieId;

  xhr.open("GET", uri, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        const response = JSON.parse(xhr.responseText); // metatrepw to xhr.responseText se ena javascript object (object response)
        buildAndDisplayTable(response, ["movieId", "title", "genres"]);
      }
    }
  };

  xhr.send();
}

// function for endpoint 3
async function searchMovieRatingsByIDs() {
  const MovieIDs = document.getElementById("movieIDs").value;
  try {
    data = { movieList: MovieIDs.split(",").map(a => parseInt(a)) };
    const response = await fetch(base_uri + "ratings", {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data), // to object mou to opoio to metatrepw se string 
    });
    const res = await response.json();

    // STEP 1: we find the titles of the movies to make the dropdown menu
    // that we'll build later to look nicer.
    // the dropdown menu is the selector of the next line:
    const movieSelector = document.createElement("select");
    // create a placeholder option to start with
    // (no movie displayed when this option is selected)
    const op = new Option();
    op.value = 'no selection';
    op.text = "Select a movie";
    movieSelector.options.add(op);

    // here, we build one option of the dropdown selector
    // for each movie ID that the user requested.
    // here is the part where we get the movie titles from endpoint 2
    data.movieList.forEach(movieId => {
      const xhr = new XMLHttpRequest();
      const uri = base_uri + "movie/" + movieId;
      xhr.open("GET", uri, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            const response = JSON.parse(xhr.responseText); //
            const op = new Option();
            op.value = response[0].movieId;
            op.text = "[" + response[0].movieId + "] " + response[0].title;
            movieSelector.options.add(op);
          }
        }
      };
      xhr.send();
    });

    

    // STEP 2: we build one movie ratings table for each movieID requested by the user
    const movieRatingsTables = { 'no selection': [0, 0, document.createElement("div")] }; // placeholder for no selection
    data.movieList.forEach(movieId => {
      let currMovieRatingsArray = null;
      let currMovieID = -1;
      res.forEach(movieRatingsArray => {
        if (movieRatingsArray[0].movieId == movieId) {
          currMovieID = movieRatingsArray[0].movieId;
          currMovieRatingsArray = movieRatingsArray;
          return;
        }
      });
      // we store 3 pieces of info in the "movieRatingsTables" array:
      // 1. the number of ratings for the current movie
      // 2. the average rating of the current movie
      // 3. the movie ratings table, as built by the "buildMovieTable" function
      const numRatings = currMovieRatingsArray.length;
      const avgMovieRating = currMovieRatingsArray.reduce((a, b) => { return {rating: a.rating + b.rating} }).rating / currMovieRatingsArray.length;
      const movieRatingsTable = buildMovieTable(currMovieRatingsArray, ["userId", "rating", "timestamp"]);
      movieRatingsTables[currMovieID] = [numRatings, avgMovieRating, movieRatingsTable];
    });

    // STEP 3: we connect each option of the dropdown selector
    // with the corresponding ratings table
    // and the additional info we stored (number of ratings & average rating).
    // we do this with an event listener for whenever the user changes the option of the dropdown selector
    
    movieSelector.addEventListener("change", (e) => {
      const selectedMovieId = movieSelector.value;
      const queryResults = document.getElementById("queryResults");
      const movieRatingsDiv = queryResults.childNodes[0];
      movieRatingsDiv.removeChild(movieRatingsDiv.childNodes[movieRatingsDiv.childNodes.length - 1]);
      const numRatings = movieRatingsTables[selectedMovieId][0];
      if (selectedMovieId != "no selection") {
        const avgMovieRating = movieRatingsTables[selectedMovieId][1].toFixed(1);
        const movieRatingsTable = movieRatingsTables[selectedMovieId][2];
        const movieRatingsData = document.createElement("div");
        movieRatingsData.appendChild(document.createTextNode("Number of reviews: " + numRatings));
        movieRatingsData.appendChild(document.createElement("br"));
        movieRatingsData.appendChild(document.createTextNode("Average movie rating: " + avgMovieRating + "/5"));
        movieRatingsData.appendChild(movieRatingsTable);
        movieRatingsDiv.appendChild(movieRatingsData);
      }
    });

    // STEP 4: we display the dropdown selector, following the div architecture that we explained above
    const queryResults = document.getElementById("queryResults");
    if (queryResults.childNodes.length > 0) {
      // resets the table if it exists (from a previous query)
      // so that they don't stack
      queryResults.removeChild(queryResults.childNodes[0]);
    }
    const movieRatingsDiv = document.createElement("div");
    movieRatingsDiv.appendChild(movieSelector);
    movieRatingsDiv.appendChild(document.createElement("br"));
    movieRatingsDiv.appendChild(document.createElement("br"));
    queryResults.appendChild(movieRatingsDiv);

  } catch (err) {
    document.getElementById("queryResults").innerHTML = err.message;
  }
}

// function for endpoint 4
function searchMovieRatingsByUserId() { 
  const xhr = new XMLHttpRequest();
  const uid = document.getElementById("uid").value;
  const uri = base_uri + "ratings/" + uid;
  if (liveUser && uid == 23074) {
    console.log(liveUser)  
    buildAndDisplayTable(liveUser, ["userId", "movieId", "rating", "timestamp"]);
 
  } else{  
    xhr.open("GET", uri, true);
  
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          const response = JSON.parse(xhr.responseText);
          console.log(response)
          buildAndDisplayTable(response, ["userId", "movieId", "rating", "timestamp"]);
        }
      }
    };
  
    xhr.send();
  } 
}


const rateBtn = document.getElementById("rateBtn");
        let liveUser = []
        rateBtn.addEventListener("click", (e) => {
            const   ratingId    =  document.getElementById("ratingId").value,
                    ratingVal   =  document.getElementById("ratingVal").value;

                    
           
            
            obj = {
                'movieId': ratingId,
                'rating': ratingVal,
                'timestamp': Date.now(),
                'userId': 23074
            }
            liveUser.push(obj) 

            // save liveUser to localStorage
            window.localStorage.setItem("liveUser", JSON.stringify(liveUser));
        });



//..............................................

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}



//collaborative filtering 
// collaborativeFiltFunc
//voithithika apo ta eksis site: https://becominghuman.ai/introduction-to-recommendation-system-in-javascript-74209c7ff2f7
//https://www.youtube.com/watch?v=11c9cs6WpJU&t=4s
//https://en.wikipedia.org/wiki/Collaborative_filtering
const FyncFilt = () => {  
  let dataset = {} 
  
  new Promise((resolve, reject) => {
    for (i=1; i<=10; i++){    //10 tyxaious users
      dataset = {} 
  
      let usr = getRandomInt(1,23073);
      const xhr = new XMLHttpRequest();
      const uri = base_uri + "ratings/" + usr;
      xhr.open("GET", uri, true);
      xhr.onreadystatechange = function () { 
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            const response = JSON.parse(xhr.responseText);
            dataset[usr] = {}
  
            response.map( el =>{  //aferoume apo to json to timestamp gia na meinoun mono ta id kai to rating 
              delete el["timestamp"] 
              dataset[usr][el['movieId']] = el['rating'] 
              resolve()  
            })     
          } 
        } 
      }
      xhr.send();
      
    }
    
    let myUser = JSON.parse(window.localStorage.getItem("liveUser")); 

    const me = 23074
    dataset[me] = {}
    myUser.map(el => { 
      dataset[me][el.movieId] = Number(el.rating) 
    })  
    
  }).then(()=> {  
    setTimeout(()=>{  
      let returnedScore = similar_user(dataset,23074, 3, pearson_correlation)
      recommendedMovies = []

      returnedScore.forEach(score => {
        let moviesOfUser = dataset[score.p],
            i = 0;

        for (s in moviesOfUser) {
          if(i>1){
            continue;
          } else { 
            if (moviesOfUser[s]>=4){  
              recommendedMovies.push(s)
              i ++ 
            }
          } 
        } 
      }) 

      if(recommendedMovies){ 
        let requests = recommendedMovies.map(id => {
          return new Promise((resolve) => { 
            getResponsesForRecommendedMovies(id, resolve)
          });

        });
        Promise.all(requests).then(()=>{
          buildAndDisplayTable(responses, ["movieId", "title", "genres"])  
        })  
      }
    }, 1000) 
  })

  const getResponsesForRecommendedMovies = (id, resolve) => {
    responses = []
    const xhr = new XMLHttpRequest();
    let uri = base_uri + "movie/" + id; 
    xhr.open("GET", uri, true);

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          const response = JSON.parse(xhr.responseText);   
          responses.push(response[0]); 
          resolve()
        }
      }
    }; 
    xhr.send();  
  }

  
  var pearson_correlation = function(dataset,usr,me){
    var existUsrAndMe = {};

    for(item in dataset[usr]){ 
      if(item in dataset[me]){ 
          existUsrAndMe[item] = 1
      }
    }
 
    var num_existence = Object.keys(existUsrAndMe).length; 
    
    if(num_existence == 0) return 0; 
    //store the sum and the square sum of both p1 and p2
    //store the product of both
    var usr_sum=0,
        me_sum=0,
        usr_sq_sum=0,
        me_sq_sum=0,
        prod_usrAndme= 0;
    //calculate the sum and square sum of each data point
    //and also the product of both point
    for(var item in existUsrAndMe){
      usr_sum += dataset[usr][item];
      me_sum += dataset[me][item];


      usr_sq_sum += Math.pow(dataset[usr][item],2);
      me_sq_sum += Math.pow(dataset[me][item],2);
      prod_usrAndme += dataset[usr][item]*dataset[me][item];


    }

    var numerator =prod_usrAndme - (usr_sum*me_sum/num_existence); 
    var st1 = usr_sq_sum - Math.pow(usr_sum,2)/num_existence;
    var st2 = me_sq_sum -Math.pow(me_sum,2)/num_existence;
    var denominator = Math.sqrt(st1*st2);
  

    if(denominator ==0) return 0;
    else {
        var val = numerator / denominator; 
        return val;
    }
      
  }
  

  var similar_user = function(dataset,person,num_user,distance){
    var scores=[];
    for(var others in dataset){
        if(others != person && typeof(dataset[others])!="function"){
            var val = distance(dataset,person,others)
            var p = others
            scores.push({val:val,p:p});
            
        }
    }
    scores.sort(function(a,b){
        return b.val < a.val ? -1 : b.val > a.val ? 1 : b.val >= a.val ? 0 : NaN;
    });
    var score=[];
    for(var i =0;i<num_user;i++){
        score.push(scores[i]);
    } 
    return score;     
  }
  
}


