// A flag to know when start or stop the camera
var enabled = false;
// Use require to add webcamjs
var WebCamera = require("webcamjs");
// var remote = require('remote'); // Load remote component that contains the dialog dependency
// var dialog = remote.require('dialog'); // Load the dialogs component of the OS
var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)
var writeFile = bluebird.promisify((require('fs').writeFile))
// return an object with the processed base64image
function processBase64Image(dataString) {
      var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),response = {};

      if (matches.length !== 3) {
          return new Error('Invalid input string');
      }

      response.type = matches[1];
      response.data = new Buffer(matches[2], 'base64');

      return response;
}

document.getElementById("start").addEventListener('click',function(){
  console.log('you clicked the start button')
   if(!enabled){ // Start the camera !
     enabled = true;
     WebCamera.attach('#camdemo');
     console.log("The camera has been started");
   }else{ // Disable the camera !
     enabled = false;
     WebCamera.reset();
    console.log("The camera has been disabled");
   }
   $('#camera-button').removeClass('hidden')
},false);

document.getElementById("savefile").addEventListener('click', function(){
    if(enabled){
      WebCamera.snap(function(data_uri) {

        console.log('you snapped')
          // Save the image in a variable
          let fileName = Math.floor(Math.random()*100000)
          var imageBuffer = processBase64Image(data_uri);
                 // If the user gave a name to the file, then save it
                 // using filesystem writeFile function
         writeFile(__dirname+`/data/${fileName}.png`, imageBuffer.data)
         .then( result => {
            console.log("Image saved succesfully");
          $('#previous-photos').prepend(`<li value=${fileName}> <img  class='img-thumbnail select-pic' src='${__dirname}/data/${fileName}.png' </li>`)
          $('#start').removeClass('active')
         })
      })
      }
  },false);
