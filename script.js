var body=d3.select("body");
var svg=body.append("svg")
    .attr("width",600)
    .attr("height",900);
var path = d3.geoPath();
var projection = d3.geoConicConformal()
    .center([2.454071, 46.279229])
    .scale(3000)
    .translate([300,300]);
path.projection(projection);

var promises = [
    d3.json("dep.json")
]
Promise.all(promises).then(function(data){
    ready(data[0]);
})


function ready(fr) {
    svg.append("g")
        .selectAll("path")
        .data(fr.features)
        .enter()
        .append("path")
        .attr("fill", "grey")
        .attr("d", path)
        .attr("stroke", "white")
        .attr("stroke-width", .2)
}