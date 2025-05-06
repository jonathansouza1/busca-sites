const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o banco de dados
const dbPath = path.join(__dirname, '../../database.sqlite');

// Inicializa o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite');
        // Cria a tabela se não existir
        db.run(`CREATE TABLE IF NOT EXISTS site_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT,
            dominio TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Erro ao criar tabela:', err.message);
            } else {
                console.log('Tabela site_info criada ou já existente');
            }
        });
    }
});

class SiteInfo {
    constructor(dominio, titulo = '', descricao = '', id = null) {
        this.id = id;
        this.dominio = dominio;
        this.titulo = titulo;
        this.descricao = descricao;
    }

    // Salva uma nova instância no banco de dados
    save() {
        return new Promise((resolve, reject) => {
            if (this.id) {
                // Atualiza um registro existente
                db.run(
                    'UPDATE site_info SET titulo = ?, descricao = ?, dominio = ? WHERE id = ?',
                    [this.titulo, this.descricao, this.dominio, this.id],
                    (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(this);
                        }
                    }
                );
            } else {
                // Insere um novo registro
                db.run(
                    'INSERT INTO site_info (titulo, descricao, dominio) VALUES (?, ?, ?)',
                    [this.titulo, this.descricao, this.dominio],
                    function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            // Aqui this se refere ao contexto da função de callback do SQLite
                            this.id = this.lastID;
                            resolve(this);
                        }
                    }.bind(this) // Vincula o contexto this da função de callback ao objeto SiteInfo
                );
            }
        });
    }

    // Busca um site pelo ID
    static findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM site_info WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    const site = new SiteInfo(row.dominio, row.titulo, row.descricao, row.id);
                    resolve(site);
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Busca todos os sites
    static findAll() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM site_info', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const sites = rows.map(row => 
                        new SiteInfo(row.dominio, row.titulo, row.descricao, row.id)
                    );
                    resolve(sites);
                }
            });
        });
    }

    // Busca sites pelo domínio
    static findByDomain(dominio) {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM site_info WHERE dominio = ?', [dominio], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const sites = rows.map(row => 
                        new SiteInfo(row.dominio, row.titulo, row.descricao, row.id)
                    );
                    resolve(sites);
                }
            });
        });
    }

    // Busca sites por título ou descrição (usando LIKE)
    static findByTitleOrDescription(searchTerm) {
        return new Promise((resolve, reject) => {
            const searchPattern = `%${searchTerm}%`;
            db.all(
                'SELECT * FROM site_info WHERE titulo LIKE ? COLLATE NOCASE OR descricao LIKE ? COLLATE NOCASE', 
                [searchPattern, searchPattern], 
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        const sites = rows.map(row => 
                            new SiteInfo(row.dominio, row.titulo, row.descricao, row.id)
                        );
                        resolve(sites);
                    }
                }
            );
        });
    }

    // Remove um site pelo ID
    static deleteById(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM site_info WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }
}

module.exports = SiteInfo; 