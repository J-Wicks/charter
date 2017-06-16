  const remote = require('electron').remote;

$("#min-btn").on('click', function (e) {
       var window = remote.getCurrentWindow();
       window.minimize(); 
  });

$("#max-btn").on('click', function (e) {
       var window = remote.getCurrentWindow();
       if (!window.isMaximized()) {
           window.maximize();          
       } else {
           window.unmaximize();
       }
  });

$("#close-btn").on("click", function (e) {
       var window = remote.getCurrentWindow();
       window.close();
  }); 