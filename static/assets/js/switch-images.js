var imageCounter = 0;
var images = [
	'#pool1',
	'#pool2',
	'#pool3',
	'#pool4',
	'#pool5',
	'#pool6',
	'#pool7',
	'#pool8'
];

function pickRandHexagon(hexagonSelector) {
	// forgive me for this shit picking alg
	var rand = Math.floor(Math.random()*hexagonSelector.length);
	var randHexagon = $(hexagonSelector[rand]);

	var success = true;
	if (randHexagon.hasClass('hero__hexagon--featured') || 
		randHexagon.data('wasSelected')) {
		success = false;
	}

	if (!success) {
		return pickRandHexagon(hexagonSelector); // omg lol
	}

	randHexagon.data('wasSelected', true);
	return randHexagon;
}

function pickImage() {
	// lol hacks
	imageCounter++;
	return images[imageCounter%images.length];
}

function highlightHexagon() {
	var randHexagon = pickRandHexagon($(".hero__hexagon--empty"));

	var clone = randHexagon
		.clone()
		.css({
			fillOpacity: 0,
			fill: 'url(' + pickImage() + ')'
		});

	randHexagon.parent().append(clone);

	clone.velocity({
		properties: { fillOpacity: 0.8 },
		options: { 
		    duration: 100
		}
  }).velocity({
  	properties: { fillOpacity: 0 },
  	options: {
  		duration: 2000,
		  complete: function() {
		  	randHexagon.data('wasSelected', false);
		    clone.remove();
		  }
  	}
  });
}

function mainLoop() {
	console.log('iteration');
	var times = 3 + Math.floor(Math.random()*4);
	for (var counter = 0; counter < times; counter++) {
		highlightHexagon();
	}
	window.setTimeout(mainLoop, 1500);
}

;$(mainLoop);