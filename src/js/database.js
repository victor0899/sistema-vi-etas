const Database = require('better-sqlite3');
const path = require('path');

class DatabaseManager {
  constructor() {
    try {
      this.db = new Database(path.join(__dirname, 'productos.sqlite'));
      this.initDatabase();
    } catch (err) {
      console.error('Error al conectar a la base de datos:', err.message);
    }
  }

  initDatabase() {
    try {
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

      this.db.exec(sql);
    } catch (err) {
      console.error('Error al crear la tabla productos:', err.message);
    }
  }

  getAllProductos() {
    try {
      const sql = 'SELECT * FROM productos ORDER BY created_at DESC';
      return this.db.prepare(sql).all();
    } catch (err) {
      console.error('Error al obtener productos:', err.message);
      throw err;
    }
  }

  getProductoById(id) {
    try {
      const sql = 'SELECT * FROM productos WHERE id = ?';
      return this.db.prepare(sql).get(id);
    } catch (err) {
      console.error('Error al obtener producto por ID:', err.message);
      throw err;
    }
  }

  insertProducto(producto) {
    try {
      const { nombre, precio, codigo_barras, descripcion } = producto;
      
      const sql = `
        INSERT INTO productos (nombre, precio, codigo_barras, descripcion)
        VALUES (?, ?, ?, ?)
      `;
      
      const stmt = this.db.prepare(sql);
      const info = stmt.run(nombre, precio, codigo_barras, descripcion || '');
      
      return { lastID: info.lastInsertRowid };
    } catch (err) {
      console.error('Error al insertar producto:', err.message);
      throw err;
    }
  }

  updateProducto(producto) {
    try {
      const { id, nombre, precio, codigo_barras, descripcion } = producto;
      const sql = `
        UPDATE productos
        SET nombre = ?, precio = ?, codigo_barras = ?, descripcion = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const stmt = this.db.prepare(sql);
      const info = stmt.run(nombre, precio, codigo_barras, descripcion || '', id);
      
      return { changes: info.changes };
    } catch (err) {
      console.error('Error al actualizar producto:', err.message);
      throw err;
    }
  }

  deleteProducto(id) {
    try {
      const sql = 'DELETE FROM productos WHERE id = ?';
      const stmt = this.db.prepare(sql);
      const info = stmt.run(id);
      
      return { changes: info.changes };
    } catch (err) {
      console.error('Error al eliminar producto:', err.message);
      throw err;
    }
  }

  searchProductos(query) {
    try {
      const sql = `
        SELECT * FROM productos 
        WHERE nombre LIKE ? OR codigo_barras LIKE ?
        ORDER BY created_at DESC
      `;
      const searchParam = `%${query}%`;
      
      const stmt = this.db.prepare(sql);
      return stmt.all(searchParam, searchParam);
    } catch (err) {
      console.error('Error al buscar productos:', err.message);
      throw err;
    }
  }

  close() {
    try {
      if (this.db) {
        this.db.close();
      }
    } catch (err) {
      console.error('Error al cerrar la base de datos:', err.message);
    }
  }
}

module.exports = DatabaseManager;