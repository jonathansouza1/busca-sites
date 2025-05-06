// Gera um nome de site aleatório baseado em palavras comuns
const faker = require('faker-br');

function generateSiteName() {
    // Obtém uma palavra aleatória usando faker-br
    // Podemos usar diferentes opções como substantivos, empresas, etc.
    const options = [
        faker.commerce.product,        // Produto
        faker.company.companyName,     // Nome de empresa (apenas a primeira palavra)
        faker.hacker.noun,             // Termo de tecnologia
        faker.lorem.word               // Palavra aleatória
    ];
    
    // Escolhe uma das opções aleatoriamente
    const randomFunction = options[Math.floor(Math.random() * options.length)];
    let word = randomFunction();
    
    // Se for nome de empresa, pega apenas a primeira palavra
    if (randomFunction === faker.company.companyName) {
        word = word.split(' ')[0];
    }
    
    // Adiciona um número aleatório em 10% dos casos
    const shouldAddNumber = Math.random() < 0.1;
    const numberSuffix = shouldAddNumber ? Math.floor(Math.random() * 100) : '';
    
    // Combina a palavra com o domínio
    return `https://${word}${numberSuffix}.com`.toLowerCase();
}

module.exports = generateSiteName;
