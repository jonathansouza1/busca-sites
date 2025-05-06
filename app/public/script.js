document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');

    // Função para realizar a busca
    async function performSearch(query) {
        try {
            // Limpa resultados anteriores e mostra indicador de carregamento
            resultsContainer.innerHTML = '<div class="loading">Buscando...</div>';
            
            // Faz a requisição para a API
            const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error('Erro na requisição');
            }
            
            const data = await response.json();
            displayResults(data.results, query);
        } catch (error) {
            console.error('Erro:', error);
            resultsContainer.innerHTML = `
                <div class="error">
                    Ocorreu um erro ao processar sua busca. Tente novamente.
                </div>
            `;
        }
    }

    // Função para exibir os resultados
    function displayResults(results, query) {
        // Limpa o container de resultados
        resultsContainer.innerHTML = '';
        
        // Verifica se há resultados
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    Nenhum resultado encontrado para <strong>"${query}"</strong>
                </div>
            `;
            return;
        }
        
        // Cria elementos HTML para cada resultado
        results.forEach(site => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            resultItem.innerHTML = `
                <div class="domain">${site.dominio}</div>
                <a href="${site.dominio}" class="title" target="_blank">${site.titulo}</a>
                <div class="description">${site.descricao || 'Sem descrição disponível'}</div>
            `;
            
            resultsContainer.appendChild(resultItem);
        });
    }

    // Event listener para o formulário de busca
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        
        if (query) {
            // Atualiza a URL com o parâmetro de busca
            const newUrl = window.location.pathname + '?q=' + encodeURIComponent(query);
            window.history.pushState({ query }, '', newUrl);
            
            performSearch(query);
        }
    });

    // Verifica se há parâmetro de busca na URL ao carregar a página
    window.addEventListener('load', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        
        if (query) {
            searchInput.value = query;
            performSearch(query);
        }
    });

    // Lidar com navegação pelo histórico (botões voltar/avançar)
    window.addEventListener('popstate', (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q') || '';
        
        searchInput.value = query;
        if (query) {
            performSearch(query);
        } else {
            resultsContainer.innerHTML = '';
        }
    });
}); 