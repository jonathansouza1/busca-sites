const generateSiteName = require('./utils/generateSiteName');
const cron = require('node-cron');
const SiteInfo = require('./models/SiteInfo');
const axios = require('axios');
const cheerio = require('cheerio');

async function job() {


    console.log('\nExecução agendada:');
    const domain = generateSiteName();
    console.log(domain);

    const registered = await SiteInfo.findByDomain(domain);

    if (registered.length > 0) {
        console.log(`${domain} já registrado`);
        return;
    }

    try {
        // Verifica se o site está online
        const response = await axios.get(domain, {
            timeout: 5000, // 5 segundos de timeout
            validateStatus: status => status === 200 // Apenas status 200 é considerado sucesso
        });

        // extrai o titulo do site e descrição do site
        const $ = cheerio.load(response.data);
        const title = $('title').text();
        const description = $('meta[name="description"]').attr('content');

        const site = new SiteInfo(domain);
        site.titulo = title || 'Sem título';
        site.descricao = description || 'Sem descrição';

        console.log(`Registrando novo site: ${domain}`);
        await site.save();

    } catch (error) {
        console.error(`Erro ao verificar o site ${domain}:`, error.message);
    }

}

// Configura o cron para executar a cada 5 segundos
console.log('Agendando execuções a cada 5 segundos...');
cron.schedule('*/5 * * * * *', async () => {

    const sites = await SiteInfo.findAll();

    console.log('Quantidade de sites registrados:', sites.length);

    job();
    job();
    job();

});

