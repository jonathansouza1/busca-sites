const express = require('express');
const path = require('path');
const SiteInfo = require('./models/SiteInfo');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para processar JSON e form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal - Página de busca
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de API para busca no banco de dados
app.get('/api/search', async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.trim() === '') {
            return res.json({ results: [] });
        }
        
        const results = await SiteInfo.findByTitleOrDescription(query);
        res.json({ results });
    } catch (error) {
        console.error('Erro na busca:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app; 