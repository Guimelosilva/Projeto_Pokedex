const pokedexList = document.getElementById('pokedex-list');
const searchInput = document.getElementById('pokemon-search');
const typeFilter = document.getElementById('type-filter');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageIndicator = document.getElementById('page-number');
const modal = document.getElementById('pokedex-modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-modal');

let allPokemon = []; 
let filteredPokemon = [];
let currentPage = 1;
const itemsPerPage = 15;

const colors = {
    fire: '#f37c7c',
    grass: '#aafcaf',
    electric: '#fcf1ba',
    water: '#89d4f7',
    ground: '#fccb9a', 
    rock: '#74624e', 
    fairy: '#f893c6', 
    poison: '#cc6fce',
    bug: '#e1f598', 
    dragon: '#97b3e1', 
    psychic: '#f3a7fd', 
    flying: '#e9e8e8',
    fighting: '#d17c79', 
    normal: '#e2d4d4',
    dark: '#4e4e4e',
    ice: '#afdde6',
    ghost: '#b15eff',
    steel: '#7c7c7c'
};

const fetchAllPokemon = async () => {
    pokedexList.innerHTML = "<h2>Carregando Pokédex...</h2>";
    const promises = [];
    for (let i = 1; i <= 1025; i++) {
        promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(res => res.json()));
    }
    allPokemon = await Promise.all(promises);
    filteredPokemon = [...allPokemon];
    renderPage();
};

const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;

    filteredPokemon = allPokemon.filter(pokemon => {
        const matchesName = pokemon.name.toLowerCase().includes(searchTerm) || 
                            pokemon.id.toString().includes(searchTerm);
        const types = pokemon.types.map(t => t.type.name);
        const matchesType = selectedType === 'all' || types.includes(selectedType);
        return matchesName && matchesType;
    });

    currentPage = 1;
    renderPage();
};

const renderPage = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pokemonToDisplay = filteredPokemon.slice(start, end);

    pokedexList.innerHTML = pokemonToDisplay.map(pokemon => {
        // LÓGICA DAS CORES E TIPOS (RECUPERADA)
        const types = pokemon.types.map(t => t.type.name);
        const color1 = colors[types[0]] || '#F5F5F5';
        const color2 = types[1] ? colors[types[1]] : color1;
        const bg = `background: linear-gradient(135deg, ${color1} 50%, ${color2} 50%)`;

        return `
            <li class="pokemon-card" style="${bg}" onclick="showDetails(${pokemon.id})">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <p>#${pokemon.id.toString().padStart(3, '0')}</p>
                <h3>${pokemon.name.toUpperCase()}</h3>
                <div class="types-container">
                    ${types.map(t => `<span class="type-badge">${t}</span>`).join('')}
                </div>
            </li>
        `;
    }).join('');

    updatePagination();
};

const showDetails = async (id) => {
    const pokemon = allPokemon.find(p => p.id === id);
    
    // Busca a história
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const speciesData = await speciesRes.json();
    const historyEntry = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
    const history = historyEntry ? historyEntry.flavor_text : "No history found.";

    modalBody.innerHTML = `
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" class="detail-img">
        <h2>${pokemon.name.toUpperCase()}</h2>
        <div class="abilities-container">
            <strong>Habilidades:</strong> ${pokemon.abilities.map(a => a.ability.name).join(', ')}
        </div>
        <div class="stats-grid">
            ${pokemon.stats.map(s => `<div><strong>${s.stat.name}:</strong> ${s.base_stat}</div>`).join('')}
        </div>
        <p class="history-text">"${history.replace(/[\f\n\r]/g, ' ')}"</p>
    `;
    modal.style.display = "block";
};

const updatePagination = () => {
    const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage) || 1;
    pageIndicator.innerText = `Página ${currentPage} de ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;
};

// Eventos
searchInput.addEventListener('input', applyFilters);
typeFilter.addEventListener('change', applyFilters);
nextBtn.addEventListener('click', () => { currentPage++; renderPage(); window.scrollTo(0,0); });
prevBtn.addEventListener('click', () => { if(currentPage > 1) { currentPage--; renderPage(); window.scrollTo(0,0); } });

// Fechar Modal
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if(e.target == modal) modal.style.display = "none"; };

fetchAllPokemon();
