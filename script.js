// Spécifiez le chemin vers votre fichier CSV
const csvFilePath = './pont_data.csv';

// Utilisez fetch pour récupérer le contenu du fichier CSV
fetch(csvFilePath)
  .then(response => response.text())
  .then(csvText => {
    // Parsez le CSV avec PapaParse
    const parsedData = Papa.parse(csvText, {
      header: true, // Indique que la première ligne contient les en-têtes
      dynamicTyping: true, // Convertit automatiquement les types (ex : string en number)
      skipEmptyLines: true // Ignore les lignes vides
    });

    // Vérifiez les données parsées
    console.log('Données brutes chargées :', parsedData.data);

    // Nettoyez et mappez les données pour extraire Département et Hauteur_Pont
    const cleanedData = parsedData.data.map(d => ({
      Departement: d['oa_departem__1'],
      Hauteur_Pont: d['ph1_hauteur_le']
    }));

    // Affichez les résultats dans la console
    console.log('Données nettoyées :', cleanedData);
  })
  .catch(error => {
    console.error('Erreur lors du chargement des données :', error);
  });
