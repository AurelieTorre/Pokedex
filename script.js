document.addEventListener('DOMContentLoaded', () => {
    loadPokemonList();
    populateTypeSelect();
    populateGenerationSelect();
    setupEventListeners();
});

// ------------------ Arrivée sur la page ------------------------

let currentOffset = 0;
const limit = 20;
const apiUrl = `https://pokeapi.co/api/v2/`
let filtre = "pokemon";

// Afficher la liste des Pokémon
function loadPokemonList(offset = 0) {
    const liste = document.getElementById("liste");

    fetch(apiUrl + filtre + `?offset=${offset}&limit=${limit}`)  // Charger les Pokémon
    .then(response => response.json())
    .then(data => {
        // Créer un tableau de promesses pour chaque Pokémon
        const pokemonPromises = data.results.map(pokemon => 
            fetch(pokemon.url).then(res => res.json())
        );

        // Attendre que toutes les promesses soient résolues
        return Promise.all([Promise.all(pokemonPromises), data.previous, data.next]);
    })
    .then(([pokemonData, previousUrl, nextUrl]) => {
        // Afficher les Pokémon
        const pokemonList = pokemonData.map(pokemon => {
            const types = pokemon.types.map(type => capitalize(type.type.name)).join(', ');
            return `
                <div class="pokemon-item" data-id="${pokemon.id}">
                    <p>${capitalize(pokemon.name)}</p>
                    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                    <p>N° ${pokemon.id}</p>
                    <p>Type : ${types}</p>
                </div>
            `;
        }).join('');
        
        liste.innerHTML = pokemonList;

        // Permettre de cliquer sur une carte
        setupPokemonClickListeners();

         // Utiliser les URLs correctes pour la pagination
         updatePaginationButtons(previousUrl, nextUrl);

    })
    .catch(error => {
        console.error('Erreur lors du chargement de la liste :', error);
        document.getElementById("liste").innerHTML = "Une erreur est survenue lors du chargement des Pokémon.";
    });
}

// Création et fonctionnement des boutons
function updatePaginationButtons(previousUrl, nextUrl) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';
    
    if (previousUrl) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Précédent';
        prevButton.onclick = () => {
            currentOffset -= limit;
            loadPokemonList(currentOffset);
        };
        paginationDiv.appendChild(prevButton);
    }
    
    if (nextUrl) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Suivant';
        nextButton.onclick = () => {
            currentOffset += limit;
            loadPokemonList(currentOffset);
        };
        paginationDiv.appendChild(nextButton);
    }
}

// Mettre la première lettre d'un nom en capitale
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// -------------------- Filtrage par type ---------------------------

// Fonction pour récupérer les types de Pokémon
async function fetchPokemonTypes() {
    try {
        const response = await fetch(apiUrl + 'type');
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Erreur lors de la récupération des types :', error);
    }
}
  
  // Fonction pour remplir le menu déroulant
  async function populateTypeSelect() {
    const select = document.getElementById('pokemonTypeSelect');
    const types = await fetchPokemonTypes();

    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
        select.appendChild(option);
    });
}

// Configuration des écouteurs d'événements : réagir quand on sélectionne un type
function setupEventListeners() {
    document.getElementById('pokemonTypeSelect').addEventListener('change', function(event) {
        const selectedType = event.target.value;
        filterPokemonByType(selectedType);
    });

    document.getElementById('pokemonGenerationSelect').addEventListener('change', function (event) {
        const selectedGeneration = event.target.value;
        filterPokemonByGeneration(selectedGeneration);
    });
}
  
  // Filtrer par le type sélectionné
  async function filterPokemonByType(type) {
    currentOffset = 0; // Réinitialiser l'offset
    if (type === "") {
        filtre = "pokemon";
        loadPokemonList(0);
    } else {
        try {
            const response = await fetch(`${apiUrl}type/${type}`);
            const data = await response.json();
            displayPokemonOfType(data.pokemon);
        } catch (error) {
            console.error('Erreur lors du filtrage par type :', error);
        }
    }
}

// Afficher les Pokémon du type sélectionné
function displayPokemonOfType(pokemonList) {
    const liste = document.getElementById("liste");
    const startIndex = currentOffset;
    const endIndex = Math.min(startIndex + limit, pokemonList.length);
    const pokemonToDisplay = pokemonList.slice(startIndex, endIndex);

    const pokemonPromises = pokemonToDisplay.map(p => 
        fetch(p.pokemon.url).then(res => res.json())
    );

    Promise.all(pokemonPromises)
        .then(pokemonData => {
            const pokemonHTML = pokemonData.map(pokemon => {
                const types = pokemon.types.map(type => capitalize(type.type.name)).join(', ');
                return `
                    <div class="pokemon-item">
                        <p>${capitalize(pokemon.name)}</p>
                        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                        <p>N° ${pokemon.id}</p>
                        <p>Type : ${types}</p>
                    </div>
                `;
            }).join('');
            
            liste.innerHTML = pokemonHTML;

            // Permettre de cliquer sur une carte
            setupPokemonClickListeners();

            // Mettre à jour les boutons de pagination
            updatePaginationButtons(
                startIndex > 0,
                endIndex < pokemonList.length
            );
        })
        .catch(error => {
            console.error("Erreur lors de l'affichage des Pokémon :", error);
            liste.innerHTML = "Une erreur est survenue lors du chargement des Pokémon.";
        });
}

// -------------------- Filtrage par génération ---------------------------

// Fonction pour remplir le menu déroulant
async function populateGenerationSelect() {
    const select = document.getElementById('pokemonGenerationSelect');

    for (let i=1; i<=9; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Generation ${i}`; // Affiche du texte dans le menu déroulant
        select.appendChild(option);
    };
}

// Filtrer par la génération sélectionnée
async function filterPokemonByGeneration(generation) {
    currentOffset = 0; // Réinitialiser l'offset
    const liste = document.getElementById("liste");
    if (generation === "") {
        filtre = "pokemon";
        loadPokemonList(0);
    } else {
        try {
            const response = await fetch(`${apiUrl}generation/${generation}`);
            const data = await response.json();
            if (data.pokemon_species && data.pokemon_species.length > 0) {
                displayPokemonOfGeneration(data.pokemon_species);
            } else {
                throw new Error('No Pokémon species found for the selected generation.');
            }
        } catch (error) {
            console.error('Erreur lors du filtrage par génération :', error);
            liste.innerHTML = "Une erreur est survenue lors du chargement des Pokémon.";
        }
    }
}

// Afficher les Pokémon de la génération sélectionnée
async function displayPokemonOfGeneration(pokemonList) {
    const liste = document.getElementById("liste");
    const startIndex = currentOffset;
    const endIndex = Math.min(startIndex + limit, pokemonList.length);
    const pokemonToDisplay = pokemonList.slice(startIndex, endIndex);

    const pokemonPromises = pokemonToDisplay.map(async p => {
        const response = await fetch(p.url);
        return response.json();
    });

    try {
        const pokemonData = await Promise.all(pokemonPromises);
        const detailedPokemonPromises = pokemonData.map(async pokemon => {
            const response = await fetch(pokemon.varieties[0].pokemon.url);
            return response.json();
        });

        const detailedPokemonData = await Promise.all(detailedPokemonPromises);
        const pokemonHTML = detailedPokemonData.map(pokemon => {
            const types = pokemon.types.map(type => capitalize(type.type.name)).join(', ');
            return `
                <div class="pokemon-item">
                    <p>${capitalize(pokemon.name)}</p>
                    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                    <p>N° ${pokemon.id}</p>
                    <p>Type : ${types}</p>
                </div>
            `;
        }).join('');
        
        liste.innerHTML = pokemonHTML;

        // Permettre de cliquer sur une carte
        setupPokemonClickListeners();

        // Mettre à jour les boutons de pagination
        updatePaginationButtons(
            startIndex > 0,
            endIndex < pokemonList.length
        );
    } catch (error) {
        console.error("Erreur lors de l'affichage des Pokémon :", error);
        liste.innerHTML = "Une erreur est survenue lors du chargement des Pokémon.";
    }
}

// -------------------- Recherche ---------------------------

// Réagir si quelqu'un écrit dans la barre de recherche
const searchInput = document.getElementById("searchInput");
let debounceTimer;

searchInput.addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase(); // on met le mot en minuscules pour éviter les erreurs
    clearTimeout(debounceTimer); // laisser le temps à l'utilisateur d'écrire le nom du Pokémon
    debounceTimer = setTimeout(() => searchPokemon(searchTerm), 300);
});

// Chercher le Pokémon indiqué dans la barre de recherche
function searchPokemon(searchTerm) {
    fetch(`${apiUrl}pokemon/${searchTerm}`)
    .then(response => response.json())
    .then(data => {
        // Traiter les données du Pokémon trouvé
        displayPokemon(data);
    })
    .catch(error => {
        // Gérer le cas où le Pokémon n'est pas trouvé
        console.error("Pokémon non trouvé :", error);
        result.classList.remove('visible');
    });
}

// Obtenir les stats du Pokémon trouvé (ou renvoyer N/A si la stat est absente)
function getStat(pokemon, statName) {
    return pokemon.stats.find(stat => stat.stat.name === statName)?.base_stat || 'N/A';
}

// Afficher les détails du Pokémon trouvé (ou cliqué)
function displayPokemon(pokemon) {
    const result = document.getElementById("result");
    if (result) {
        result.innerHTML = `
            <h2>${capitalize(pokemon.name)}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>N° ${pokemon.id}</p>
            <p>Type : ${pokemon.types.map(type => type.type.name).join(', ')}</p>
            <p>HP : ${getStat(pokemon, 'hp')}</p>
            <p>Attack : ${getStat(pokemon, 'attack')}</p>
            <p>Defense : ${getStat(pokemon, 'defense')}</p>
            <p>Speed : ${getStat(pokemon, 'speed')}</p>
            <p>Ability : ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
        `;

        // Rendre visible la carte du Pokémon
        result.classList.add('visible');
    } else {
        console.error("L'élément avec l'ID 'result' n'a pas été trouvé.");
    }
}

// Réagir si on clique sur une carte de la liste
function setupPokemonClickListeners() {
    document.getElementById("liste").addEventListener('click', function(event) {
        const pokemonItem = event.target.closest('.pokemon-item');
        if (pokemonItem) {
            const pokemonName = pokemonItem.querySelector('p:first-child').textContent;

            // Récupérer l'objet pokémon complet à partir de l'API ou d'une autre source de données
            fetch(`${apiUrl}pokemon/${pokemonName.toLowerCase()}`)
                .then(response => response.json())
                .then(pokemon => displayPokemon(pokemon));

        }

    });

}

//---------- Media queries ------------

window.addEventListener('resize', updateSelectPlaceholder);

function updateSelectPlaceholder() {
    const selectElement = document.getElementById('pokemonGenerationSelect');
    if (window.matchMedia("(max-width: 1200px)").matches) {
        // Si la fenêtre est rétrécie, changer le texte par défaut
        selectElement.options[0].text = "Générations";
    } else {
        // Sinon, remettre le texte par défaut
        selectElement.options[0].text = "Toutes les générations";
    }
}

window.addEventListener('resize', updateSearchPlaceholder);

function updateSearchPlaceholder() {
    const searchElement = document.getElementById('searchInput');
    if (window.matchMedia("(max-width: 360px)").matches) {
        // Si la fenêtre est rétrécie, changer le texte par défaut
        searchElement.placeholder = "Rechercher";
    } else {
        // Sinon, remettre le texte par défaut
        searchElement.placeholder = "Rechercher un Pokémon";
    }
}