document.addEventListener('DOMContentLoaded', loadInitialPokemonList);

// ------------------ Arrivée sur la page ------------------------

// Afficher la liste des Pokémon
function loadInitialPokemonList() {
    const liste = document.getElementById("liste");

    fetch('https://pokeapi.co/api/v2/pokemon?limit=20')  // Charger les 20 premiers Pokémon
    .then(response => response.json())
    .then(data => {
        const pokemonList = data.results.map(pokemon => `
            <div class="pokemon-item">
                <p>${capitalize(pokemon.name)}</p>
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(pokemon.url)}.png" alt="${pokemon.name}">
            </div>
        `).join('');
        
        liste.innerHTML = pokemonList;
    })
    .catch(error => console.error('Erreur lors du chargement de la liste initiale:', error));
}

// Obtenir l'image de chaque Pokémon de la liste
function getPokemonId(url) {
    const parts = url.split('/');
    return parts[parts.length - 2];
}

// Mettre la première lettre d'un nom en capitale
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
    fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`)
    .then(response => response.json())
    .then(data => {
        // Traiter les données du Pokémon trouvé
        displayPokemon(data);
    })
    .catch(error => {
        // Gérer le cas où le Pokémon n'est pas trouvé
        console.error("Pokémon non trouvé :", error);
    });
}

// Afficher les détails du Pokémon trouvé
function displayPokemon(pokemon) {
    const result = document.getElementById("result");
    if (result) {
        result.innerHTML = `
            <h2>${capitalize(pokemon.name)}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>ID : ${pokemon.id}</p>
            <p>Type : ${pokemon.types.map(type => type.type.name).join(', ')}</p>
        `;

        // Rendre visible la carte du Pokémon
        result.classList.add('visible');
    } else {
        console.error("L'élément avec l'ID 'result' n'a pas été trouvé.");
    }
}








