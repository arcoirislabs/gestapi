/*
Gest API - a plugin that adds hand gesture control in your website

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
if (init()) { 
  $(this).html('<video id="feed" style="width:'+window.innerWidth+'px; height:'+window.innerHeight+'px;display:none;"  autoplay>');
  $('<canvas></canvas>', {
    id: 'pg',
    style: 'display:block;width:'+window.innerWidth+'px; height:'+window.innerHeight+'px;-webkit-filter: grayscale(1);filter:grayscale(1)',
}).appendTo(this);
  var c = document.querySelector('canvas');
    var ctx = c.getContext('2d');
  navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
  navigator.getUserMedia({video:true, audio:false,},
    function(stream){
    	var video = document.querySelector('video');
   		var url = window.URL || window.webkitURL;       
    	video.src =url.createObjectURL(stream);
      localStream=stream;
      if (localStream)
      {
      setInterval(function(){
        console.log('drawing');
        //rendering video in canvas
        c.width = video.videoWidth;
    	c.height = video.videoHeight;
        ctx.drawImage(video,0,0);
      },20);
    	}
  }, 
  //error function
  function(err){console.log('erroe');});
  } else {  alert('getUserMedia() is not supported in your browser');}
}
})(jQuery);