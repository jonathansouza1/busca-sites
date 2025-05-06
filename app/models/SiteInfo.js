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
    constructor(titulo, descricao, dominio, id = null) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.dominio = dominio;
    }

    // Salva uma nova instância no banco de dados
    save() {
        return new Promise((resolve, reject) => {
            if (this.id) {
                // Atualiza um registro existente
                db.run(
                    'UPDATE site_info SET titulo = ?, descricao = ?, dominio = ? WHERE id = ?',
                    [this.titulo, this.descricao, this.dominio, this.id],
                    function(err) {
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
                            this.id = this.lastID;
                            resolve(this);
                        }
                    }
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
                    resolve(new SiteInfo(row.titulo, row.descricao, row.dominio, row.id));
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
                    const sites = rows.map(row => new SiteInfo(row.titulo, row.descricao, row.dominio, row.id));
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
                    const sites = rows.map(row => new SiteInfo(row.titulo, row.descricao, row.dominio, row.id));
                    resolve(sites);
                }
            });
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