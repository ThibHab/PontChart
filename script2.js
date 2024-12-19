// Dimensions du graphe
const width = 600;  // Largeur fixe
const height = 600; // Hauteur fixe

// Sélectionnez le conteneur existant
const svg = d3.select("#graph-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("display", "block") // Assurez un affichage centré
    .style("margin", "auto");  // Centre horizontalement

// Ajouter un groupe pour les éléments graphiques avec une translation
const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

// Test : Dessin d'un cercle centré
g.append("circle")
    .attr("r", 200)
    .attr("fill", "#007BFF")
    .attr("stroke", "#000")
    .attr("stroke-width", 2);
