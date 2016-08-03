var imageCounter = 0;
var totalImages = 64;

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
	return "#image-pool" + ((imageCounter++ % totalImages) + 1);
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

	clone.addClass('hero__hexagon--animating');
	window.setTimeout(function() {
		randHexagon.data('wasSelected', false);
		clone.remove();
	}, 5000);
}

function mainLoop() {
	var times = 3 + Math.floor(Math.random()*4);
	for (var counter = 0; counter < times; counter++) {
		highlightHexagon();
	}
	window.setTimeout(mainLoop, 1500);
}

$(mainLoop);