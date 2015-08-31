document.addEventListener("DOMContentLoaded", function(event) {
  page = app();
  page.setUp();
});

function app() {
  return {
    container: document.getElementById("container"),
    content: document.getElementsByClassName("content"),
    interval: "none",
    scrollTop: this.container.scrollTop,
    activatedContent: 0,
    lastScroll: Date.now,
    gifs: ["imgs/shapes.jpg"],

    setUp: function() {
      document.getElementById("up-button").addEventListener("click", this.findClosestUp.bind(this));
      document.getElementById("down-button").addEventListener("click", this.findClosestDown.bind(this));
      document.onkeydown = this.checkKey.bind(this);
      this.container.addEventListener("mousewheel", this.onScroll.bind(this));
      setTimeout(function(){this.activateContent[0]()}.bind(this), 500);
      document.getElementById("controller").addEventListener("click", this.chooseRandomGif.bind(this));
      this.getGifs();
    },

    // Activates animated content based on index number of content being scrolled to
    activateContent: {
      0: function(){
        var content = document.getElementById("home");
        content.children[0].children[0].className = "slide-in delay";
        content.children[0].children[1].className = "large-text slide-in";
        content.children[0].children[2].className = "slide-in";
      },
      1: function(){
        var content = document.getElementById("text-1");
        content.children[0].className = "large-text slide-in";
        content.children[1].className = "slide-in";
        document.getElementById("controller").className = "slide-in";
        setTimeout(function(){document.getElementById("controller").className = "floating slide-in"}, 500);
        document.getElementById("controller-label").className = "";
      },
      2: function(){
        var logos = document.getElementsByClassName("logo-row");
        for (var i = 0; i < logos.length; i++) {
          logos[i].className = "logo-row slide-in";
        }
      },
    },

    // deactivates animated content based on index number of content being scrolled to
    deactivateContent: {
      0: function(){
        var content = document.getElementById("home");
        content.children[0].children[0].className = "slide-in hidden-top";
        content.children[0].children[1].className = "large-text slide-in hidden-left";
        content.children[0].children[2].className = "slide-in hidden-right";
      },
      1: function(){
        var content = document.getElementById("text-1");
        content.children[0].className = "large-text slide-in hidden-left";
        content.children[1].className = "slide-in hidden-right";
        document.getElementById("controller").className = "slide-in hidden-bottom";
        document.getElementById("controller-label").className = "fade-out";
      },
      2: function(){
        var logos = document.getElementsByClassName("logo-row");
        for (var i = 0; i < logos.length; i++) {
          var logos = document.getElementsByClassName("logo-row");
          if(i<4){
            logos[i].className = "logo-row hidden-top slide-in";
          }else{
            logos[i].className = "logo-row hidden-bottom slide-in";
          }
        }
      },
    },

    // Makes an HTTP request to the API to get random PS4 related gif urls
    getGifs: function(){
      var xmlhttp;
      if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
      }else{
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
      }
      xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState == XMLHttpRequest.DONE ) {
          if(xmlhttp.status == 200){
            var gifsObject = JSON.parse(xmlhttp.responseText);
            for (var i = 0; i < gifsObject.data.length; i++) {
              if(gifsObject.data[i].images.original.url){
                this.gifs.push(gifsObject.data[i].images.fixed_width.url);
              }
            }
          }else{
            console.log('gif error');
          }
        }
      }.bind(this);
      xmlhttp.open("GET", "http://api.giphy.com/v1/gifs/search?q=ps4&api_key=dc6zaTOxFJmzC", true);
      xmlhttp.send();
    },


   chooseRandomGif: function(){
    var gif = this.gifs[Math.floor(Math.random()*this.gifs.length)];
    document.getElementById("screen-image").src = gif;
    document.getElementById("controller-label").className = "fade-out";
   },

    // Scrolls to next/previous content when up/down arrows are pushed on the keyboard
    checkKey: function(e) {
      e.preventDefault();
      if (e.keyCode == '38') {
        this.findClosestUp();
      }
      else if (e.keyCode == '40') {
       this.findClosestDown();
     }
   },

   // determines whether user scrolled up or down, then activates scroll animation accordingly
   onScroll: function(e){
    var scroll = this.container.scrollTop;
    if(this.scrolling || scroll === this.scrollTop || Date.now() < this.lastScroll + 100){
      return;
    }else if(scroll > this.scrollTop) {
      console.log("down");
      setTimeout(this.findClosestDown(), 1000);
    }else{
      console.log("up");
      setTimeout(this.findClosestUp(), 1000);
    }
    this.lastScroll = Date.now();
    this.scrollTop = scroll;
  },

   // finds the top of the content object which is closest to current location and redirects the scroll to fit the content box within the browser window
   findClosest: function() {
    var output = {up: {d: window.innerHeight * -2, i: undefined}, down: {d: window.innerHeight * 2, i: undefined}};
    for (var i = 0; i < this.content.length; i++) {
      var difference = this.content[i].getBoundingClientRect().top;
      if(difference < -25 && difference > output.up.d){
        output.up.i = i;
        output.up.d = difference;
      }else if(difference > 25 && difference < output.down.d){
        output.down.i = i;
        output.down.d = difference;
      }
    }
    return output;
  },

  // locates the closest content box which is higher up on the scroll plane and focuses the view on it. If the user is already scrolled up to the top content box, it returns nothing.
  findClosestUp: function(){
    var closestIndex = this.findClosest().up.i;
    if(closestIndex === undefined){
      return;
    }else{
      this.scrollToElement(closestIndex);
    }
  },

  // locates the closest content box which is lower down on the scroll plane and focuses the view on it. If the user is already scrolled to the lowest content box, it returns nothing.
  findClosestDown: function(){
    var closestIndex = this.findClosest().down.i;
    if(closestIndex === undefined){
      return;
    }else{
      this.scrollToElement(closestIndex);
    }
  },

  // takes the index number of the content box we want to scroll to and animates scrolling to that location
  scrollToElement: function(element){
    clearInterval(this.interval);
    this.deactivateContent[this.activatedContent]();
    this.interval = setInterval(function(){
      var difference = this.content[element].getBoundingClientRect().top;
      var step;
      if(difference < 0){
        step = Math.floor(difference*0.1);
      }else{
        step = Math.ceil(difference*0.1);
      }
      if(Math.abs(difference) < 1){
        clearInterval(this.interval);
        this.activateContent[element]();
        this.activatedContent = element;
      }else{
        this.container.scrollTop += step;
      }
    }.bind(this), 30);
  },
}
};