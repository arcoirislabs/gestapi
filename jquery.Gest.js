(function($){
	$.fn.Gest = function(){
	function init() {
		console.log('Ok');
  		return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

if (init()) { 
  $(this).html('<video id="feed" style="width:640px;height:480px;" autoplay>');
  navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
  navigator.getUserMedia({video:true, audio:true,},function(stream){
  	var video = document.getElementbyId('feed');
  	var url = window.URL || window.webkitURL;  			
  	video.src =url.createObjectURL(stream);
  }, function(err){$(this).html('erroe');});
} else {
  alert('getUserMedia() is not supported in your browser');
}
}
})(jQuery);