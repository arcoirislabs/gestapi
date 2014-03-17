(function($){
  $.fn.Gest = function(){
	function hasGetUserMedia() {
		// Note: Opera builds are unprefixed.
		return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia || navigator.msGetUserMedia);
	}

	if (hasGetUserMedia()) {
		$("#info").hide();
		$("#message").show();
	} else {
		$("#info").show();
		$("#message").hide();
		$("#video-demo").show();
		$("#video-demo")[0].play();
		return;
	}

	var webcamError = function(e) {
		alert('Webcam error!', e);
	};

	var video = $('#webcam')[0];

	if (navigator.getUserMedia) {
		navigator.getUserMedia({audio: false, video: true}, function(stream) {
			video.src = stream;
			initialize();
		}, webcamError);
	} else if (navigator.webkitGetUserMedia) {
		navigator.webkitGetUserMedia({audio: false, video: true}, function(stream) {
			video.src = window.webkitURL.createObjectURL(stream);
			main();
		}, webcamError);
	} else {
		//video.src = 'somevideo.webm'; // fallback.
	}
	
	var row1Pos1 = [0, 218, 430];
	var row2Pos2 = [0, 218, 430];
	var row3Pos3 = [0, 218, 430];

	var timeOut, lastImageData;
	var canvasSource = $("#canvas-source")[0];
	var canvasBlended = $("#canvas-blended")[0];

	var contextSource = canvasSource.getContext('2d');
	var contextBlended = canvasBlended.getContext('2d');

	var soundContext;
	var bufferLoader;
	var row1 = [];
	var row2 = [];
	var row3 = [];

	// mirror video
	contextSource.translate(canvasSource.width, 0);
	contextSource.scale(-1, 1);

	var c = 5;

	function main() {
		
			load();
		
	}

	function load() {
			initRow1();
			initRow2();
			initRow3();
		start();
	}

	function initRow1() {
		for (var i=0; i<3; i++) {
		
			var note = {
	
				visual: $("#note" + i)[0]
			};
			note.area = {x:row1Pos1[i], y:0, width:note.visual.width, height:160};
			row1.push(note);
		}
		
	}
	function initRow2() {
		for (var i=3; i<6; i++) {
		
			var note1 = {
	
				visual: $("#note" + i)[0]
			};
			note1.area = {x:row2Pos2[i-3], y:160, width:note1.visual.width, height:160};
			row2.push(note1);
		}
		console.log(row2);
	}
	function initRow3() {
		for (var i=6; i<9; i++) {
		
			var note2 = {
	
				visual: $("#note" + i)[0]
			};
			note2.area = {x:row3Pos3[i-6], y:330, width:note2.visual.width, height:160};
			row3.push(note2);
		}
		console.log(row3);
	}

	function start() {
		$(canvasSource).show();
		$(canvasBlended).show();
		$("#grid").show();
		$("#message").hide();
		$("#description").show();
		update();
	}

	function update() {
		drawVideo();
		blend();
		checkAreas1();
		checkAreas2();
		checkAreas3();
		timeOut = setTimeout(update, 20);
	}

	function drawVideo() {
		contextSource.drawImage(video, 0, 0, video.width, video.height);
	}

	function blend() {
		var width = canvasSource.width;
		var height = canvasSource.height;
		// get webcam image data
		var sourceData = contextSource.getImageData(0, 0, width, height);
		// create an image if the previous image doesn’t exist
		if (!lastImageData) lastImageData = contextSource.getImageData(0, 0, width, height);
		// create a ImageData instance to receive the blended result
		var blendedData = contextSource.createImageData(width, height);
		// blend the 2 images
		differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
		// draw the result in a canvas
		contextBlended.putImageData(blendedData, 0, 0);
		// store the current webcam image
		lastImageData = sourceData;
	}

	function fastAbs(value) {
		// funky bitwise, equal Math.abs
		return (value ^ (value >> 31)) - (value >> 31);
	}

	function threshold(value) {
		return (value > 0x15) ? 0xFF : 0;
	}

	function difference(target, data1, data2) {
		// blend mode difference
		if (data1.length != data2.length) return null;
		var i = 0;
		while (i < (data1.length * 0.25)) {
			target[4*i] = data1[4*i] == 0 ? 0 : fastAbs(data1[4*i] - data2[4*i]);
			target[4*i+1] = data1[4*i+1] == 0 ? 0 : fastAbs(data1[4*i+1] - data2[4*i+1]);
			target[4*i+2] = data1[4*i+2] == 0 ? 0 : fastAbs(data1[4*i+2] - data2[4*i+2]);
			target[4*i+3] = 0xFF;
			++i;
		}
	}

	function differenceAccuracy(target, data1, data2) {
		if (data1.length != data2.length) return null;
		var i = 0;
		while (i < (data1.length * 0.25)) {
			var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
			var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
			var diff = threshold(fastAbs(average1 - average2));
			target[4*i] = diff;
			target[4*i+1] = diff;
			target[4*i+2] = diff;
			target[4*i+3] = 0xFF;
			++i;
		}
	}

	function checkAreas1() {
		// loop over the note areas
		for (var r=0; r<3; ++r) {
			// get the pixels in a note area from the blended image
			var blendedData = contextBlended.getImageData(row1[r].area.x, row1[r].area.y, row1[r].area.width, row1[r].area.height);
			var i = 0;
			var average = 0;
			// loop over the pixels
			while (i < (blendedData.data.length * 0.25)) {
				// make an average between the color channel
				average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
				++i;
			}
			// calculate an average between of the color values of the note area
			average = Math.round(average / (blendedData.data.length * 0.25));
			if (average > 10) {
				// over a small limit, consider that a movement is detected
				// play a note and show a visual feedback to the user
				console.log(r);
				row1[r].visual.style.display = "block";
				$(row1[r].visual).fadeOut();
			}
		}
	}
	function checkAreas2() {
		// loop over the note areas
		for (var r=3; r<6; ++r) {
			// get the pixels in a note area from the blended image
			var blendedData = contextBlended.getImageData(row2[r-3].area.x, row2[r-3].area.y, row2[r-3].area.width, row2[r-3].area.height);
			var i = 0;
			var average = 0;
			// loop over the pixels
			while (i < (blendedData.data.length * 0.25)) {
				// make an average between the color channel
				average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
				++i;
			}
			// calculate an average between of the color values of the note area
			average = Math.round(average / (blendedData.data.length * 0.25));
			if (average > 10) {
				// over a small limit, consider that a movement is detected
				// play a note and show a visual feedback to the user
				console.log(r);
				row2[r-3].visual.style.display = "block";
				$(row2[r-3].visual).fadeOut();
			}
		}
	}
	function checkAreas3() {
		// loop over the note areas
		for (var r=6; r<9; ++r) {
			// get the pixels in a note area from the blended image
			var blendedData = contextBlended.getImageData(row3[r-6].area.x, row3[r-6].area.y, row3[r-6].area.width, row3[r-6].area.height);
			var i = 0;
			var average = 0;
			// loop over the pixels
			while (i < (blendedData.data.length * 0.25)) {
				// make an average between the color channel
				average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
				++i;
			}
			// calculate an average between of the color values of the note area
			average = Math.round(average / (blendedData.data.length * 0.25));
			if (average > 5) {
				// over a small limit, consider that a movement is detected
				// play a note and show a visual feedback to the user
				console.log(r);
				row3[r-6].visual.style.display = "block";
				$(row3[r-6].visual).fadeOut();
			}
		}
	}	
}
})(jQuery);