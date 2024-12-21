const width = 750;
const height = 350;
const marginTop = 25;
const marginRight = 20;
const marginBottom = 35;
const marginLeft = 40;


// Create the SVG container.
const body = d3.select("#graph-container");
const svg = body.append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

d3.dsv(";", "pont_data.csv").then(data => {
    // Clean the data
    data.forEach(d => {
        d.ph1_longueur_ur = d.ph1_longueur_ur === "" ? 0 : +d.ph1_longueur_ur;
        d.ph1_largeur_ge = d.ph1_largeur_ge === "" ? 0 : +d.ph1_largeur_ge;
        d.ph1_hauteur_le = d.ph1_hauteur_le === "" ? "0m" : d.ph1_hauteur_le;
        d.ph1_materiau__1 = d.ph1_materiau__1 === "" ? "Non Renseigné" : d.ph1_materiau__1
    });

    // Prepare the scales for positional encoding.
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.ph1_longueur_ur)).nice()
        .range([marginLeft, width - marginRight]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.ph1_largeur_ge)).nice()
        .range([height - marginBottom, marginTop]);

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

});



document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('filtre').addEventListener('change', function () {
        svg.selectAll("g[circle]")
            .attr("fill", "steelblue")
            .attr("stroke", "steelblue")
        svg.selectAll("g").filter(function () {
            return d3.select(this).attr("transform") === `translate(${width - marginRight - 100},${marginTop})`;
        }).remove();
        switch (this.value) {
            case "1":
                svg.selectAll("circle")
                    .attr("fill", d => ({
                        "0m": "red",
                        "< 4m": "orange",
                        "entre 4m et 10 m": "steelblue",
                        "> 10m": "green"
                    }[d.ph1_hauteur_le] || "steelblue"))
                    .attr("stroke", d => ({
                        "0m": "red",
                        "< 4m": "orange",
                        "entre 4m et 10 m": "steelblue",
                        "> 10m": "green"
                    }[d.ph1_hauteur_le] || "steelblue"))
                // Add legend
                const legend = svg.append("g")
                    .attr("transform", `translate(${width - marginRight - 100},${marginTop})`)
                    .attr("font-family", "sans-serif")
                    .attr("font-size", 10)
                    .selectAll("g")
                    .data(["0m", "< 4m", "entre 4m et 10 m", "> 10m"])
                    .join("g")
                    .attr("transform", (d, i) => `translate(0,${i * 20})`);

                legend.append("rect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .attr("fill", d => ({
                        "0m": "red",
                        "< 4m": "orange",
                        "entre 4m et 10 m": "steelblue",
                        "> 10m": "green"
                    }[d]));

                legend.append("text")
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", "0.35em")
                    .text(d => d);
                break;

            case "2":
                svg.selectAll("circle")
                    .attr("fill", d => ({
                        "Béton armé": "blue",
                        "Béton précontraint": "yellow",
                        "Métal": "gray",
                        "Bois": "green",
                        "Autre": "red",
                        "Donnée non accessible": "black",
                        "Non Renseigné": "pink"
                    }[d.ph1_materiau__1] || "steelblue"))
                    .attr("stroke", d => ({
                        "Béton armé": "blue",
                        "Béton précontraint": "yellow",
                        "Métal": "gray",
                        "Bois": "green",
                        "Autre": "red",
                        "Donnée non accessible": "black",
                        "Non Renseigné": "pink"
                    }[d.ph1_materiau__1] || "steelblue"))
                // Add legend
                const legend2 = svg.append("g")
                    .attr("transform", `translate(${width - marginRight - 100},${marginTop})`)
                    .attr("font-family", "sans-serif")
                    .attr("font-size", 10)
                    .selectAll("g")
                    .data(["Béton armé", "Béton précontraint", "Métal", "Bois", "Autre", "Donnée non accessible", "Non Renseigné"])
                    .join("g")
                    .attr("transform", (d, i) => `translate(0,${i * 20})`);

                legend2.append("rect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .attr("fill", d => ({
                        "Béton armé": "blue",
                        "Béton précontraint": "yellow",
                        "Métal": "gray",
                        "Bois": "green",
                        "Autre": "red",
                        "Donnée non accessible": "black",
                        "Non Renseigné": "pink"
                    }[d]));

                legend2.append("text")
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", "0.35em")
                    .text(d => d);
                break;

            default:
                svg.selectAll("circle")
                    .attr("fill", "steelblue")
                    .attr("stroke", "steelblue")
                break;
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('departement').addEventListener('change', function () {
        var selectedDepartement = this.value;
        svg.selectAll("g[circle]")
            .attr("fill", "steelblue")
            .attr("stroke", "steelblue")
        if (this.value == "") {
            svg.selectAll("circle")
                .attr("fill-opacity", 1)
                .attr("stroke-width", 1.5);
        } else {
            svg.selectAll("circle")
                .attr("fill-opacity", d => d.oa_departem__1 === selectedDepartement ? 1 : 0)
                .attr("stroke-width", d => d.oa_departem__1 === selectedDepartement ? 1.5 : 0);
        }

    });
});