document.addEventListener('DOMContentLoaded', loadPokemonList);

// ------------------ Arrivée sur la page ------------------------

let currentOffset = 0;
const limit = 20;

// Afficher la liste des Pokémon
function loadPokemonList(offset = 0) {
    const liste = document.getElementById("liste");

    fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)  // Charger les Pokémon
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
                <div class="pokemon-item">
                    <p>${capitalize(pokemon.name)}</p>
                    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                    <p>ID : ${pokemon.id}</p>
                    <p>Type : ${types}</p>
                </div>
            `;
        }).join('');
        
        liste.innerHTML = pokemonList;

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
        result.classList.remove('visible');
    });
}

// Obtenir les stats du Pokémon trouvé (ou renvoyer N/A si la stat est absente)
function getStat(pokemon, statName) {
    return pokemon.stats.find(stat => stat.stat.name === statName)?.base_stat || 'N/A';
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








