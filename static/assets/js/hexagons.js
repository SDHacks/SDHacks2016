var radius = 150;
var svg = d3.select(".js-background-mesh")
    .attr("width", "100%");

var width = parseInt(svg.style('width'));
var height = parseInt(svg.style('height'));

if(width <= 1024) {
  radius = 50;
}

//Find how many hexagons we have
var dxR = Math.ceil(width / (2 * radius * Math.sin(Math.PI / 3)));
var dyR = Math.ceil(height / (1.5 * radius));

//Make it a multiple of the radius and give it one for padding
width = (dxR + 1) * (2 * radius * Math.sin(Math.PI / 3));
height = (dyR + 2) * (1.5 * radius);

svg
    .attr('width', width)
    .attr('height', height);

var topology = hexTopology(radius, width, height);
var projection = hexProjection(radius);

var path = d3.geo.path()
    .projection(projection);

svg.append("g")
    .attr("class", "hero__hexagon")
    .selectAll("path")
    .data(topology.objects.hexagons.geometries)
    .enter().append("path")
    .attr("d", function(d) { return path(topojson.feature(topology, d)); })
    .attr("fill", function(d) { return d.feature ? "url(#logo)" : ""; })
    .attr("class", hexClass)
    .on("mousedown", mousedown)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

svg.append("path")
    .datum(topojson.mesh(topology, topology.objects.hexagons))
    .attr("class", "hero__mesh")
    .attr("d", path);

var border = svg.append("path")
    .attr("class", "hero__border")
    .call(redraw);

var mousing = 0;

function hexClass(d) {
    if(d.feature) return "";
    if(d.fill) return "hero__hexagon--filled";
    return "";
}

function mousedown(d) {
    mousing = d.fill ? -1 : +1;
    mousemove.apply(this, arguments);
}

function mousemove(d) {
    if (mousing) {
        d3.select(this).classed("hero__hexagon--filled", d.fill = mousing > 0);
        border.call(redraw);
    }
}

function mouseup() {
    mousemove.apply(this, arguments);
    mousing = 0;
}

function redraw(border) {
    border.attr("d", path(topojson.mesh(topology, topology.objects.hexagons, function(a, b) { return a.fill ^ b.fill; })));
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

    var midM = Math.floor(m / 2);
    var midN = Math.floor(n / 2) - 1;
    for (var j = 0, q = 3; j < m - 1; ++j, q += 6) {
        for (var i = 0; i < n; ++i, q += 3) {
            var isMid = (j == midM && i == midN);
            geometries.push({
                type: "Polygon",
                arcs: [[q, q + 1, q + 2, ~(q + (n + 2 - (j & 1)) * 3), ~(q - 2), ~(q - (n + 2 + (j & 1)) * 3 + 2)]],
                fill: isMid,
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