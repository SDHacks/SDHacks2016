var imageCounter = 0;
var images = [
	'#image-pool1',
	'#image-pool2',
	'#image-pool3',
	'#image-pool4',
	'#image-pool5',
	'#image-pool6',
	'#image-pool7',
	'#image-pool8'
];

function pickRandHexagon(hexagonSelector) {
	var rand = Math.floor(Math.random()*hexagonSelector.length);
	var randHexagon = $(hexagonSelector[rand]);

	var success = true;
	if (randHexagon.hasClass('hero__hexagon--featured') || 
		randHexagon.data('wasSelected')) {
		success = false;
	}

	if (!success) {
		return pickRandHexagon(hexagonSelector);
	}

	randHexagon.data('wasSelected', true);
	return randHexagon;
}

function pickImage() {
	imageCounter++;
	return images[imageCounter%images.length];
}

function highlightHexagon() {
	var randHexagon = pickRandHexagon($(".hero__hexagon--empty"));

	var clone = randHexagon
		.clone()
		.css({
			fillOpacity: 0,
			fill: 'url(/' + pickImage() + ')'
		});

	randHexagon.parent().append(clone);

	clone.velocity({
		properties: { fillOpacity: 0.8 },
		options: { 
		    duration: 2000
		}
  }).velocity({
  	properties: { fillOpacity: 0 },
  	options: {
  		duration: 2000,
  		delay: 1000,
		  complete: function() {
		  	randHexagon.data('wasSelected', false);
		    clone.remove();
		  }
  	}
  });
}

function mainLoop() {
	var times = 3 + Math.floor(Math.random()*4);
	for (var counter = 0; counter < times; counter++) {
		highlightHexagon();
	}
	window.setTimeout(mainLoop, 1500);
}

$(mainLoop);