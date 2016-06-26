var radius = 110,
    smallRadius = 50;
var fillChance = 0.35;
var initialHeight = parseInt(d3.select('.hero').style('height'));

var border, path, topology, projection, mousing = 0;
resize();

function hexClass(d) {
    var classes = ["hero__hexagon--empty"];
    if(d.feature) {
        classes.push("hero__hexagon--featured");
        classes.push("hero__hexagon--featured-filled");
        return classes.join(" ");
    }
    if(d.fill) classes.push("hero__hexagon--filled");
    return classes.join(" ");
}

function mousedown(d) {
    mousing = d.fill ? -1 : +1;
    mousemove.apply(this, arguments);
}

function mousemove(d) {
    if (mousing) {
        var featured = $(this).hasClass("hero__hexagon--featured");
        if(featured)
            d3.select(this).classed("hero__hexagon--featured-filled", d.fill = mousing > 0);
        else
            d3.select(this).classed("hero__hexagon--filled", d.fill = mousing > 0);
        //border.call(redraw);
    }
}

function mouseup() {
    mousemove.apply(this, arguments);
    mousing = 0;
}

function redraw(border) {
    border.attr("d", path(topojson.mesh(topology, topology.objects.hexagons, function(a, b) { return a.fill ^ b.fill; })));
}

function redraw_bottom(border) {
    //Ignore the first vertex of every hex
    var seen = [];
    border.attr("d", path(topojson.mesh(topology, topology.objects.hexagons, 
        function(a, b) { 
            if(seen.indexOf(a) !== -1)
                return a.bottom && b.bottom;
            seen.push(a);
            return false;
        }
    )));
}

function hexTopology(radius, width, height) {
    var dx = radius * 2 * Math.sin(Math.PI / 3),
        dy = radius * 1.5
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
                fill: (isMid || Math.random() < fillChance),
                feature: isMid,
                bottom: (j == m - 2)
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

    var newWidth = parseInt(svg.style('width'));
    var newRadius = radius;

    if(newWidth <= 1024) {
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
    console.log(dyR);

    svg
        .attr('width', newWidth)
        .attr('height', height);

    topology = hexTopology(newRadius, newWidth, height);
    projection = hexProjection(newRadius);

    path = d3.geo.path()
        .projection(projection);

    svg.selectAll("*").remove();

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

    /*svg.append("path")
        .datum(topojson.mesh(topology, topology.objects.hexagons))
        .attr("class", "hero__mesh")
        .attr("d", path);*/

    /* border = svg.append("path")
        .attr("class", "hero__border")
        .call(redraw);

    bottom_border = svg.append("path")
        .attr("class", "hero__border--bottom")
        .call(redraw_bottom);*/
}

$(window).resize($.debounce(250, resize));