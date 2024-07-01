document.addEventListener("DOMContentLoaded", function() {

    const searchInput = document.getElementById("searchInput");
    let debounceTimer;

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => searchPokemon(searchTerm), 300);
    });

    function searchPokemon(searchTerm) {
        fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`)
        .then(response => response.json())
        .then(data => {
            // Traiter les données du Pokémon trouvé
            displayPokemon(data);
        })
        .catch(error => {
            console.error("Pokémon non trouvé :", error);
            // Gérer le cas où le Pokémon n'est pas trouvé
        });
    }

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function displayPokemon(pokemon) {
        // Afficher les détails du Pokémon trouvé
        const result = document.getElementById("result");
        if (result) {
            result.innerHTML = `
                <h2>${capitalize(pokemon.name)}</h2>
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <p>ID: ${pokemon.id}</p>
                <p>Type: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
            `;

            // Rendre la div visible
            result.classList.add('visible');
        } else {
            console.error("L'élément avec l'ID 'result' n'a pas été trouvé.");
        }
    }

});