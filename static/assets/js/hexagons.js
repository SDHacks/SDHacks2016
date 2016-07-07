var radius = 110,
    smallRadius = 110;
var fillChance = 0.35;
var initialHeight = parseInt(d3.select('.hero').style('height'));

var borderSVGWidth = 457,
    borderSVGHeight = 250;

var border, path, topology, projection, mousing = 0;
$(document).ready(resize);

function hexClass(d) {
    var classes = ["hero__hexagon--empty"];
    if(d.feature) {
        classes.push("hero__hexagon--featured");
        return classes.join(" ");
    }
    if(d.fill) classes.push("hero__hexagon--filled");
    return classes.join(" ");
}

function mousedown(d) {
    //Prevent mouse dragging effect
    d3.event.preventDefault();
    
    mousing = d.fill ? -1 : +1;
    mousemove.apply(this, arguments);
}

function mousemove(d) {
    if (mousing) {
        if(!$(this).hasClass("hero__hexagon--featured"))
            d3.select(this).classed("hero__hexagon--filled", d.fill = mousing > 0);
    }
}

function mouseup() {
    mousemove.apply(this, arguments);
    mousing = 0;
}

function hexTopology(radius, width, height) {
    var dx = radius * 2 * Math.sin(Math.PI / 3),
        dy = radius * 1.5,
        m = Math.ceil((height + radius) / dy) + 1,
        n = Math.ceil(width / dx) + 1,
        geometries = [],
        arcs = [];

    for (var j = -1; j < m; ++j) {
        for (var i = -1; i <= n; ++i) {
            var y = j * 2, x = (i + (j & 1) / 2) * 2;
            arcs.push([[x, y - 1], [1, 1]], [[x + 1, y], [0, 1]], [[x + 1, y + 1], [-1, 1]]);
        }
    }

    var midM = Math.floor(m / 2) - (m % 2 === 0);
    var midN = Math.floor(n / 2) - (m % 2 === 0);
    for (var k = 0, q = 3; k < m - 1; ++k, q += 6) {
        for (var l = 0; l < n; ++l, q += 3) {
            var isMid = (k == midM && l == midN);
            geometries.push({
                type: "Polygon",
                arcs: [[q, q + 1, q + 2, ~(q + (n + 2 - (k & 1)) * 3), ~(q - 2), ~(q - (n + 2 + (k & 1)) * 3 + 2)]],
                fill: (isMid || Math.random() < fillChance),
                feature: isMid
            });
        }
    }
    return {
        transform: {translate: [0, 0], scale: [1, 1]},
        objects: {hexagons: {type: "GeometryCollection", geometries: geometries}},
        arcs: arcs
    };
}

function hexProjection(radius) {
    var dx = radius * 2 * Math.sin(Math.PI / 3),
        dy = radius * 1.5;
    return {
        stream: function(stream) {
            return {
                point: function(x, y) { stream.point(x * dx / 2, (y - (2 - (y & 1)) / 3) * dy / 2); },
                lineStart: function() { stream.lineStart(); },
                lineEnd: function() { stream.lineEnd(); },
                polygonStart: function() { stream.polygonStart(); },
                polygonEnd: function() { stream.polygonEnd(); }
            };
        }
    };
}

function getHexPerHeight(height, radius) {
    return Math.floor(height / (1.5 * radius) + 1);
}

function getHeightForHex(hexCount, radius) {
    return (1.5 * radius) * hexCount;
}

function resize() {
    var svg = d3.select(".js-background-mesh")
        .attr("width", "100%");

    var initialHeight = parseInt(d3.select('.hero').style('height'));

    var newWidth = parseInt(svg.style('width'));
    var newRadius = radius;

    //TODO: Make this a dynamic value
    if(newWidth <= 640) {
        newRadius = smallRadius;
    }

    //Find how many hexagons we have
    var dxR = Math.ceil(newWidth / (2 * newRadius * Math.sin(Math.PI / 3)));
    //Make it a multiple of the radius and give it one for padding
    newWidth = (dxR + 1) * (2 * newRadius * Math.sin(Math.PI / 3));

    //If there wasn't already a height
    var height = initialHeight;

    //Remove last row for effect
    var dyR = getHexPerHeight(height, newRadius) - 1;
    height = getHeightForHex(dyR, newRadius);

    svg
        .attr('width', newWidth)
        .attr('height', height);

    topology = hexTopology(newRadius, newWidth, height);
    projection = hexProjection(newRadius);

    path = d3.geo.path()
        .projection(projection);

    svg.selectAll("g").remove();

    svg.append("g")
        .attr("class", "hero__hexagon")
        .selectAll("path")
        .data(topology.objects.hexagons.geometries)
        .enter()
        .append("path")
        .attr("d", function(d) { return path(topojson.feature(topology, d)); })
        .attr("class", hexClass)
        .on("mousedown", mousedown)
        .on("mousemove", mousemove)
        .on("mouseup", mouseup);

    //Move the bottom border
    var borderWidth = newRadius * 2 * Math.sin(Math.PI / 3);
    var borderHeight = (borderWidth / borderSVGWidth) * borderSVGHeight; //Use the same ratio

    //Set these border values on the pattern
    d3.select("#border")
        .attr('width', borderWidth)
        .attr('height', Math.ceil(borderHeight));

    //Set these values on the page patterns
    d3.selectAll(".js-bordered")
        .style("border-width", borderHeight + "px 0px");

    //Find the correct translation
    var lastHex = dyR * getHeightForHex(1, newRadius);
    var offset = 0.9 * getHeightForHex(1, newRadius);

    var transform = 'translateY(' + (lastHex - offset) + 'px)';
    if(dyR % 2 === 0) transform += ' translateX(' + (newRadius * Math.sin(Math.PI / 3)) + 'px)';

    d3.select(".hero__hexagon--border")
        .attr('height', borderHeight)
        .style('transform', transform);
}

$(window).resize($.debounce(250, resize));