const pokedexList = document.getElementById('pokedex-list');
const searchInput = document.getElementById('pokemon-search');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageIndicator = document.getElementById('page-number');

let allPokemon = []; 
let filteredPokemon = [];
let currentPage = 1;
const itemsPerPage = 12;

// tipagens dos pokemons
const colors = {
    fire: '#fa8b8b', 
    grass: '#b1f8b6', 
    electric: '#f7e382', 
    water: '#a8dff8',
    ground: '#bb9b7a', 
    rock: '#a38244', 
    fairy: '#fcc8f1', 
    poison: '#b660af',
    bug: '#d7ec79', 
    dragon: '#617ba5', 
    psychic: '#eda1ed', 
    flying: '#e4e1df',
    fighting: '#f38e60', 
    normal: '#F5F5F5',
    steel: '#aaa7a7',
    ghost: '#642c52',
    dark: '#302e2efb',
    ice: '#70dbdb'
};

const fetchAllPokemon = async () => {
    try {
        console.log("Iniciando busca na API..."); // Debug
        pokedexList.innerHTML = "<h2>Carregando Pokémon...</h2>";

        const promises = [];
        for (let i = 1; i <= 1025; i++) {
            promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(res => res.json()));
        }

        allPokemon = await Promise.all(promises);
        filteredPokemon = [...allPokemon];
        
        console.log("Pokémon carregados com sucesso!", allPokemon.length); // Debug
        renderPage();
    } catch (error) {
        console.error("Erro na API:", error);
        pokedexList.innerHTML = "<h2>Erro ao carregar. Verifique a internet!</h2>";
    }
};

const renderPage = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pokemonToDisplay = filteredPokemon.slice(start, end);

    pokedexList.innerHTML = pokemonToDisplay.map(pokemon => {
        const types = pokemon.types.map(t => t.type.name);
        const color1 = colors[types[0]] || '#eee';
        const color2 = colors[types[1]] || color1;
        
        return `
            <li class="pokemon-card" style="background: linear-gradient(135deg, ${color1} 50%, ${color2} 50%)">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <p>#${pokemon.id.toString().padStart(3, '0')}</p>
                <h3>${pokemon.name.toUpperCase()}</h3>
                <div class="types-container">
                    ${types.map(t => `<span class="type-badge">${t}</span>`).join('')}
                </div>
            </li>
        `;
    }).join('');

    // Atualiza o texto da página
    if(pageIndicator) pageIndicator.innerText = `Página ${currentPage} de ${Math.ceil(filteredPokemon.length / itemsPerPage)}`;
    
    // botão some se não tiner mais paginas
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage * itemsPerPage >= filteredPokemon.length;
};

// buscar por pokemon ou numero da pokedex
searchInput.addEventListener('input', (e) => {
    const search = e.target.value.toLowerCase();
    filteredPokemon = allPokemon.filter(p => 
        p.name.toLowerCase().includes(search) || p.id.toString().includes(search)
    );
    currentPage = 1;
    renderPage();
});

// Botão
nextBtn.addEventListener('click', () => { currentPage++; renderPage(); window.scrollTo(0,0); });
prevBtn.addEventListener('click', () => { if(currentPage > 1) { currentPage--; renderPage(); window.scrollTo(0,0); } });

fetchAllPokemon();
