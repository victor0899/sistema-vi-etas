const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'productos.sqlite'), (err) => {
      if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
      } else {
        
        this.initDatabase();
      }
    });
  }

  initDatabase() {
    const sql = `
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL,
      codigo_barras TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    this.db.run(sql, (err) => {
      if (err) {
        console.error('Error al crear la tabla productos:', err.message);
      } else {
        
      }
    });
  }
  getAllProductos() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM productos ORDER BY created_at DESC';
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getProductoById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM productos WHERE id = ?';
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  insertProducto(producto) {
    return new Promise((resolve, reject) => {
      const { nombre, precio, codigo_barras, descripcion } = producto;
      const sql = `
        INSERT INTO productos (nombre, precio, codigo_barras, descripcion)
        VALUES (?, ?, ?, ?)
      `;
      
      this.db.run(sql, [nombre, precio, codigo_barras, descripcion || ''], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID });
        }
      });
    });
  }

  updateProducto(producto) {
    return new Promise((resolve, reject) => {
      const { id, nombre, precio, codigo_barras, descripcion } = producto;
      const sql = `
        UPDATE productos
        SET nombre = ?, precio = ?, codigo_barras = ?, descripcion = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      this.db.run(sql, [nombre, precio, codigo_barras, descripcion || '', id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  deleteProducto(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM productos WHERE id = ?';
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }
  searchProductos(query) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM productos 
        WHERE nombre LIKE ? OR codigo_barras LIKE ?
        ORDER BY created_at DESC
      `;
      const searchParam = `%${query}%`;
      
      this.db.all(sql, [searchParam, searchParam], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
      } else {
        
      }
    });
  }
}

module.exports = Database;