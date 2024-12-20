const width = 750;
const height = 350;
const marginTop = 25;
const marginRight = 20;
const marginBottom = 35;
const marginLeft = 40;

d3.dsv(";", "pont_data.csv").then(data => {
    // Clean the data
    data.forEach(d => {
        d.ph1_longueur_ur = d.ph1_longueur_ur === "" ? 0 : +d.ph1_longueur_ur;
        d.ph1_largeur_ge = d.ph1_largeur_ge === "" ? 0 : +d.ph1_largeur_ge;
    });

// Prepare the scales for positional encoding.
const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.ph1_longueur_ur)).nice()
    .range([marginLeft, width - marginRight]);

const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.ph1_largeur_ge)).nice()
    .range([height - marginBottom, marginTop]);

// Create the SVG container.
const body = d3.select("#graph-container");
const svg = body.append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

// Create the axes.
svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).ticks(width / 80))
    //.call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", width)
        .attr("y", marginBottom - 4)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .text("Longueur du pont →"));

svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    //.call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .text("↑ Largeur du pont"));

// Create the grid.
console.log("x.ticks():", x.ticks());

svg.append("g")
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.1)
    .call(g => g.append("g")
        .selectAll("line")
        .data(x.ticks())
        .join("line")
        .attr("x1", d => 0.5 + x(d))
        .attr("x2", d => 0.5 + x(d))
        .attr("y1", marginTop)
        .attr("y2", height - marginBottom))
    .call(g => g.append("g")
        .selectAll("line")
        .data(y.ticks())
        .join("line")
        .attr("y1", d => 0.5 + y(d))
        .attr("y2", d => 0.5 + y(d))
        .attr("x1", marginLeft)
        .attr("x2", width - marginRight));

// Add a layer of dots.
svg.append("g")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("fill", "steelblue")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.ph1_longueur_ur))
    .attr("cy", d => y(d.ph1_largeur_ge))
    .attr("r", 1)
    .append("title")
    .text(d => `${d.oa_nomusue_el} - ${d.oa_nomcom}
        Longueur: ${d.ph1_longueur_ur}
        Largeur: ${d.ph1_largeur_ge}`);

// Add a layer of labels.
//svg.append("g")
//    .attr("font-family", "sans-serif")
//    .attr("font-size", 10)
//    .selectAll("text")
//    .data(data)
//    .join("text")
//    .attr("dy", "0.35em")
//    .attr("x", d => x(d.data.ph1_longueur_ur) + 7)
//    .attr("y", d => y(d.data.ph1_largeur_ge))
//    .text(d => d.oa_nomcom);


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