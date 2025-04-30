// Actualizado para usar better-sqlite3 con compatibilidad multiplataforma
const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

class DatabaseManager {
  constructor() {
    // Obtener la aplicación de Electron (importar remotamente si es necesario)
    const electronApp = app || require('electron').remote.app;
    
    // Determinar la ruta correcta de la base de datos
    const userDataPath = electronApp.getPath('userData');
    // En desarrollo usa la raíz del proyecto, en producción usa userData
    const dbDirectory = electronApp.isPackaged 
      ? userDataPath
      : __dirname;
    
    // Ruta completa al archivo de base de datos
    const dbPath = path.join(dbDirectory, 'productos.sqlite');
    
    // Asegurar que el directorio existe (importante en Windows)
    if (!fs.existsSync(dbDirectory)) {
      fs.mkdirSync(dbDirectory, { recursive: true });
    }
    
    // Si estamos empaquetados y no existe el archivo de BD, copiarlo desde resources
    if (electronApp.isPackaged && !fs.existsSync(dbPath)) {
      try {
        // En Windows, la ruta a los recursos es diferente
        let sourcePath;
        if (process.platform === 'win32') {
          // En Windows, los recursos se ubican junto al ejecutable
          sourcePath = path.join(process.resourcesPath, 'productos.sqlite');
        } else {
          // En macOS, la ruta es estándar
          sourcePath = path.join(process.resourcesPath, 'productos.sqlite');
        }
        
        if (fs.existsSync(sourcePath)) {
          console.log(`Copiando base de datos desde ${sourcePath} a ${dbPath}`);
          fs.copyFileSync(sourcePath, dbPath);
        } else {
          console.error(`Archivo de base de datos no encontrado en ${sourcePath}`);
        }
      } catch (err) {
        console.error('Error al copiar la base de datos inicial:', err);
      }
    }
    
    // Crear/abrir la base de datos con manejo de errores mejorado
    try {
      // Opciones específicas para Windows para mejorar el rendimiento
      const options = {
        verbose: console.log,
        fileMustExist: false, // No falla si el archivo no existe
        timeout: 5000  // Timeout más largo para operaciones en discos lentos de Windows
      };
      
      this.db = new Database(dbPath, options);
      console.log(`Base de datos conectada correctamente en: ${dbPath}`);
      this.initDatabase();
    } catch (err) {
      console.error('Error al abrir la base de datos:', err.message);
      throw err; // Relanzar para manejo en main.js
    }
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

    try {
      this.db.exec(sql);
      console.log('Tabla productos inicializada correctamente');
    } catch (err) {
      console.error('Error al crear la tabla productos:', err.message);
      throw err;
    }
  }
  
  getAllProductos() {
    try {
      const stmt = this.db.prepare('SELECT * FROM productos ORDER BY created_at DESC');
      return stmt.all();
    } catch (err) {
      console.error('Error al obtener productos:', err.message);
      throw err;
    }
  }

  getProductoById(id) {
    try {
      const stmt = this.db.prepare('SELECT * FROM productos WHERE id = ?');
      return stmt.get(id);
    } catch (err) {
      console.error('Error al obtener producto por ID:', err.message);
      throw err;
    }
  }

  insertProducto(producto) {
    try {
      const { nombre, precio, codigo_barras, descripcion } = producto;
      const stmt = this.db.prepare(`
        INSERT INTO productos (nombre, precio, codigo_barras, descripcion)
        VALUES (?, ?, ?, ?)
      `);
      
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
      const stmt = this.db.prepare(`
        UPDATE productos
        SET nombre = ?, precio = ?, codigo_barras = ?, descripcion = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      const info = stmt.run(nombre, precio, codigo_barras, descripcion || '', id);
      return { changes: info.changes };
    } catch (err) {
      console.error('Error al actualizar producto:', err.message);
      throw err;
    }
  }

  deleteProducto(id) {
    try {
      const stmt = this.db.prepare('DELETE FROM productos WHERE id = ?');
      const info = stmt.run(id);
      return { changes: info.changes };
    } catch (err) {
      console.error('Error al eliminar producto:', err.message);
      throw err;
    }
  }
  
  searchProductos(query) {
    try {
      const searchParam = `%${query}%`;
      const stmt = this.db.prepare(`
        SELECT * FROM productos 
        WHERE nombre LIKE ? OR codigo_barras LIKE ?
        ORDER BY created_at DESC
      `);
      
      return stmt.all(searchParam, searchParam);
    } catch (err) {
      console.error('Error al buscar productos:', err.message);
      throw err;
    }
  }

  // Método para realizar un backup de la base de datos (útil en Windows)
  backupDatabase(backupPath) {
    try {
      if (!backupPath) {
        const date = new Date().toISOString().replace(/:/g, '-');
        backupPath = path.join(app.getPath('userData'), `backup-${date}.sqlite`);
      }
      
      this.db.backup(backupPath)
        .then(() => {
          console.log(`Backup creado correctamente en ${backupPath}`);
          return true;
        })
        .catch(err => {
          console.error('Error al crear backup:', err);
          return false;
        });
    } catch (err) {
      console.error('Error al intentar respaldar la base de datos:', err);
      return false;
    }
  }

  // Cerrar la base de datos de manera segura
  close() {
    try {
      if (this.db) {
        this.db.close();
        console.log('Base de datos cerrada correctamente');
      }
    } catch (err) {
      console.error('Error al cerrar la base de datos:', err.message);
    }
  }
}

module.exports = DatabaseManager;