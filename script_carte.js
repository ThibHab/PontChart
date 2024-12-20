var body = d3.select("body");
var svg = body.append("svg")
    .attr("width", 600)
    .attr("height", 650)
var path = d3.geoPath();
var projection = d3.geoConicConformal()
    .center([2.454071, 46.279229])
    .scale(3000)
    .translate([300, 300]);
path.projection(projection);

//get france map
var promises = [
    d3.json("dep.json")
]
Promise.all(promises).then(function (data) {
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

//load pont data
d3.dsv(";", "pont_data.csv").then(datatmp => {
    const groupedData = d3.group(datatmp, d => d.oa_nomcom);
    const data = Array.from(groupedData, ([key, values]) => {
        const { oa_nomcom, oa_localisa, oa_departem__1 } = values[0];
        const [longitude, latitude] = oa_localisa.split(";").map(Number);
        const restData = values.map(d => ({ ...d }));
        const len = restData.length;
        return { oa_nomcom, oa_departem__1, longitude, latitude, len, data: restData };
    });

    console.log(data);

    const radius = d3.scaleSqrt([0, d3.max(data, d => d.len)], [0, 10]);

    // Create the legend.
    //const legend = svg.append("g")
    //    .attr("fill", "#777")
    //    .attr("transform", "translate(500,500)")
    //    .attr("text-anchor", "middle")
    //    .style("font", "10px sans-serif")
    //    .selectAll()
    //    .data(radius.ticks(4).slice(1))
    //    .join("g");
//
    //legend.append("circle")
    //    .attr("fill", "none")
    //    .attr("stroke", "#ccc")
    //    .attr("cy", d => -radius(d))
    //    .attr("r", radius);
//
    //legend.append("text")
    //    .attr("y", d => -2 * radius(d))
    //    .attr("dy", "1.3em")
    //    .text(radius.tickFormat(4, "s"));

    // Add a circle for each county, with a title (tooltip).
    const format = d3.format(",.0f");
    svg.append("g")
        .attr("id","circle")
        .attr("fill", "brown")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .selectAll()
        .data(data)
        .join("circle")
        .attr("transform", d => {
            const [x, y] = projection([d.longitude, d.latitude]);
            return isNaN(x) || isNaN(y) ? "translate(-100,-100)" : `translate(${x},${y})`;
        })
        .attr("r", d => radius(d.len))
        .attr("data-info", d => d.oa_departem__1)
        .append("title")
        .text(d => `${d.oa_nomcom}
    ${format(d.len)} pont(s)`);
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('departement').addEventListener('change', function() {
        var selectedDepartement = this.value;
        if (this.value=="") {
            console.log("AAAAAAAAAAAAAAAAAAAAAAAAa")
            svg.selectAll("g[circle]")
            .attr("fill", "brown")
            .attr("fill-opacity", 0.5)
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5);
            svg.selectAll("circle")
                .attr("fill-opacity", 0.5)
                .attr("fill", "brown")
                .attr("stroke-width", 0.5);
        }
        else{
            svg.selectAll("circle")
                .attr("fill-opacity", d => d.oa_departem__1 === selectedDepartement ? 0.5 : 0)
                .attr("fill", "brown")
                .attr("stroke-width", d => d.oa_departem__1 === selectedDepartement ? 0.5 : 0);
            }
        });
    });