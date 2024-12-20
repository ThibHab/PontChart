// Spécifiez le chemin vers votre fichier CSV
const csvFilePath = './pont_data.csv';

const width = 650;
const height = 650;

async function createRadialChart(ii) {
  //const svg = d3.select(`#graph-container${i}`)
  //  .append("svg")
  //  .attr("width", width)
  //  .attr("height", height)
  //  .attr("viewBox", `0 0 ${width} ${height}`)
  //  .style("display", "block")
  //  .style("margin", "auto");
//
  //// Créez un groupe centré pour dessiner les éléments
  //d3.select(`#graph-container${i}`).select("svg").remove()
  //const g = svg.append("g")
  //  .attr("transform", `translate(${width / 2}, ${height / 2})`);
  try {
    // Charger et parser les données
    const response = await fetch(csvFilePath);
    if (!response.ok) {
      throw new Error(`Erreur HTTP! Statut : ${response.status}`);
    }
    const csvText = await response.text();
    console.log("Contenu brut du CSV :", csvText);

    const parsedData = Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    console.log('Données brutes chargées :', parsedData.data);
    formattedData = [];
    parsedData.data.forEach(row => {
      // const departement = row['oa_departem__1'];
      const departement = row['oa_region__1'];
      var hauteur;
      switch (ii) {
        case 1:
          hauteur = row['ph1_hauteur_le'];
          break;
        case 2:
          hauteur = row['oa_typedo_al'];
          break;
        case 3:
          hauteur = row['ph1_typetab_er'];
          break;
        case 4:
          hauteur = row['ph1_materiau__1'];
          break;
        default:
          break;
      }

      if (hauteur == null) {
        console.log("hauteur null");
        if(ii==1){
          formattedData.push({
            departement: departement,
            hauteurs: "0m",
          });
        }else{
          if(ii==4){
            formattedData.push({
              departement: departement,
              hauteurs: "Non Renseigné",
            });
          }
        }
      } else {
        // Ajout d'un objet formaté pour chaque entrée
        formattedData.push({
          departement: departement,
          hauteurs: hauteur,
        });
      }
    });

    function groupBy(array, ...keys) {
      return array.reduce((map, item) => {
        let currentLevel = map;
        keys.forEach((key, index) => {
          const groupKey = typeof key === 'function' ? key(item) : item[key];
          if (!currentLevel.has(groupKey)) {
            currentLevel.set(groupKey, index === keys.length - 1 ? [] : new Map());
          }
          currentLevel = currentLevel.get(groupKey);
        });
        currentLevel.push(item);
        return map;
      }, new Map());
    }

    const groupedData = groupBy(formattedData, d => d.departement, d => d.hauteurs);

    const result = [];
    groupedData.forEach((hauteursGroup, departement) => {
      hauteursGroup.forEach((items, hauteur) => {
        result.push({
          departement: departement,
          hauteurs: hauteur,
          population: items.length // Compter les occurrences pour chaque hauteur
        });
      });
    });

    const sortedData = result.sort((a, b) => a.departement - b.departement);

    console.log("Données regroupées et comptées :", sortedData);

    renderChart(sortedData,ii);

  } catch (error) {
    console.error('Erreur lors du chargement des données :', error);
  }
}

function renderChart(data,ii) {
  console.log("Données envoyées à renderChart :", data);
  const innerRadius = 180;
  const outerRadius = Math.min(width, height) / 2;

  const categories = d3.union(data.map(d => d.hauteurs)); // Clés uniques pour les hauteurs
  console.log("Catégories :", categories);

  // Stack the data into series by age
  const series = d3.stack()
    .keys(categories)
    .value(([, D], key) => {
      const group = D.get(key); // Récupère le groupe correspondant à la clé
      // console.log(`Groupe récupéré pour la clé ${key}:`, group);
      return group ? group.population : 0; // Retourne la population ou 0 si la clé est absente
    })
    (d3.index(data, d => d.departement, d => d.hauteurs));

  const arc = d3.arc()
    .innerRadius(d => y(d[0]))
    .outerRadius(d => y(d[1]))
    .startAngle(d => x(d.data[0]))
    .endAngle(d => x(d.data[0]) + x.bandwidth())
    .padAngle(1.5 / innerRadius)
    .padRadius(innerRadius);

  // An angular x-scale
  const x = d3.scaleBand()
    .domain(data.map(d => d.departement))
    .range([0, 2 * Math.PI])
    .align(0);

  // A radial y-scale maintains area proportionality of radial bars
  const y = d3.scaleRadial()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
    .range([innerRadius, outerRadius]);

  const color = d3.scaleOrdinal()
    .domain(series.map(d => d.key))
    .range(d3.schemeSpectral[series.length])
    .unknown("#ccc");

  // A function to format the value in the tooltip
  const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  const svg = d3.select(`#graph-container${ii}`)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
    .style("display", "block") // Assurez un affichage centré
    .style("margin", "auto");  // Centre horizontalemen

  // A group for each series, and a rect for each element in the series
  svg.append("g")
    .selectAll()
    .data(series)
    .join("g")
    .attr("fill", d => color(d.key))
    .selectAll("path")
    .data(D => {
      // console.log("Série actuelle (D) :", D);
      return D.map(d => {
        // console.log("Élément individuel dans D.map :", d);
        d.key = D.key;
        return d;
      });
    })
    .join("path")
    .attr("d", arc)
    .append("title")
    .text(d => {
      const population = d.data[1]?.[d.key]?.population || 0;
      return `${d.data[0]} ${d.key}\n${formatValue(population)}`
    });

  // x axis
  svg.append("g")
    .attr("text-anchor", "middle")
    .selectAll()
    .data(x.domain())
    .join("g")
    .attr("transform", d => `
        rotate(${((x(d) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
        translate(${innerRadius},0)
      `)
    .call(g => g.append("line")
      .attr("x2", -5)
      .attr("stroke", "#000"))
    .call(g => g.append("text")
      .attr("transform", d => (x(d) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
        ? "rotate(90)translate(0,16)"
        : "rotate(-90)translate(0,-9)")
      .selectAll("tspan") // Ajouter plusieurs tspan pour gérer les sauts de ligne
      .data(d => d.split(' ')) // Divise le texte par espace
      .join("tspan")
      .attr("x", 0) // Garde chaque ligne alignée au centre
      .attr("dy", (d, i) => i === 0 ? 0 : "1.2em") // Décalage vertical entre les lignes
      .text(d => d))

  // y axis
  svg.append("g")
    .attr("text-anchor", "middle")
    .call(g => g.append("text")
      .attr("y", d => -y(y.ticks(5).pop()))
      .attr("dy", "-1em")
      .text("Population"))
    .call(g => g.selectAll("g")
      .data(y.ticks(5).slice(1))
      .join("g")
      .attr("fill", "none")
      .call(g => g.append("circle")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.5)
        .attr("r", y))
      .call(g => g.append("text")
        .attr("y", d => -y(d))
        .attr("dy", "0.35em")
        .attr("stroke", "#fff")
        .attr("stroke-width", 5)
        .text(y.tickFormat(5, "s"))
        .clone(true)
        .attr("fill", "#000")
        .attr("stroke", "none")));

  // color legend
  svg.append("g")
    .selectAll()
    .data(color.domain())
    .join("g")
    .attr("transform", (d, i, nodes) => `translate(-40,${(nodes.length / 2 - i - 1) * 20})`)
    .call(g => g.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", color))
    .call(g => g.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .text(d => d));

  //document.body.appendChild(svg.node());
  //console.log("SVG:", svg);
  //console.log("Container:", d3.select("#graph-container").node());
}



createRadialChart(1);
createRadialChart(2);
//createRadialChart(3);
createRadialChart(4);
