/*
Gest API - a plugin that adds hand gesture control in your website

Developer notes
In this project I might be taking a long turn to implement hand gestures but this is the sequence I am following.
The video source will be acting as eyes for this plugin. As we are using a hand (specifically a palm) to control the triggers. Basically the hand will be hand for us but for this plugin it will be a skin colored object inside a canvas frame. 
Now we need to eliminate the background pixel data to uniquely identify the hand object in each video frame. 
So we need to binarize the image by setting a threshold value that will represent the darkest tone of the skin colored object when place at the 
max distance you want to operate (say till the touch pad of the laptop).
By thresholding the image we are distinguishing the palm object colored in white and rest of the pixels in black.
Then we are detecting the centroid of the palm object which will be returning us its location on canvas.
This location will determine the nature of action and once it is detected it will trigger its respective callback function. 


Usage:-

$('#anytag').Gest('upper-left',function(){
  mytrigger();
});

Types of actions supported:-
*/



(function($){
  $.fn.Gest = function(){
  function init() {
    console.log('Ok');
      return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}
var localStream = null;
var lskinR =61;
var lskinG =39;
var lskinB = 52;
var dskin = 3*38;
if (init()) { 
  $(this).html('<video id="feed" style="width:'+window.innerWidth+'px; height:'+window.innerHeight+'px;display:none;"  autoplay>');
  $('<canvas></canvas>', {
    id: 'pg',
    style: 'display:block;width:'+window.innerWidth+'px; height:'+window.innerHeight+'px;',
}).appendTo(this);
  var c = document.querySelector('canvas');
    var ctx = c.getContext('2d');
    var threshold;
  navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
  navigator.getUserMedia({video:true, audio:false,},
    function(stream){
      var video = document.querySelector('video');
      var url = window.URL || window.webkitURL;       
      video.src =url.createObjectURL(stream);
      localStream=stream;
  if (localStream){
    setInterval(function(){
      //rendering video in canvas
      c.width = video.videoWidth;
      c.height = video.videoHeight;
      ctx.drawImage(video,0,0);
      
      //grayscaling & binarising
     var imgData = ctx.getImageData(0,0,c.width,c.height);
        var pix  = imgData.data;
        for (var i = 0, n = pix.length; i < n; i += 4){
        var grayscale = pix[i] * .3 + pix[i+1] * .59 + pix[i+2] * .11 ;
        pix[i  ] = grayscale;        // red
        pix[i+1] = grayscale;        // green
        pix[i+2] = grayscale;        // blue
        //pix[i+3]              is alpha, but we are not concerned with it.
    }
    //redraw the image in black & white
    //ctx.putImageData(imgData, 0, 0);
    var GimgData = ctx.getImageData(0,0,c.width,c.height);
    for (var i = 0, n = GimgData.data.length; i < n; i += 4){
        
    GimgData.data[i] = GimgData.data[i] == lskinR ? 255 : 0;
    GimgData.data[i+1] = GimgData.data[i] == lskinG ? 255 : 0;
    GimgData.data[i+2] = GimgData.data[i] == lskinB ? 255 : 0;
    }
    ctx.putImageData(GimgData, 0, 0);
    },20);
      }
  }, 
  //error function
  function(err){console.log('erroe');});
  } else {  alert('getUserMedia() is not supported in your browser');}
}
})(jQuery);