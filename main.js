const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('./database');
const db = new Database();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('print-vineta', async (event, htmlContent) => {
  try {
    const printWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    await printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Imprimir Viñeta</title>
        <style>
          body { margin: 0; padding: 0; }
          .print-row { display: flex; flex-wrap: wrap; }
          .vineta-print {
            width: 100mm;
            height: 65mm;
            padding: 3mm;
            box-sizing: border-box;
            text-align: center;
            border: 0;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .vineta-print .titulo { 
            font-weight: bold; 
            font-size: 12pt; 
            margin-bottom: 2mm; 
            display: block !important;
          }
          .vineta-print .nombre { 
            font-size: 10pt; 
            font-weight: bold;
            margin-bottom: 3mm; 
            overflow: hidden; 
            text-overflow: ellipsis; 
            max-width: 90mm;
            display: block !important;
            visibility: visible !important;
          }
          .vineta-print .precio { 
            font-weight: bold; 
            font-size: 14pt; 
            margin-bottom: 4mm; 
            display: block !important;
          }
          .vineta-print img { 
            max-width: 80mm; 
            height: 15mm; 
            margin: 3mm 0;
            display: block !important;
          }
          .vineta-print .codigo { 
            font-size: 8pt; 
            margin-top: 2mm; 
            display: block !important;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `));

    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const printOptions = { 
        silent: false,
        printBackground: true,
        color: true,
        margin: {
          marginType: 'custom',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        },
        landscape: false,
        scaleFactor: 100,
        pagesPerSheet: 1,
        copies: 1,
        showPrintDialog: true 
      };
      
      await printWindow.webContents.print(printOptions, (success, reason) => {
        printWindow.close();
        if (success) {
          event.sender.send('print-completed', { success: true });
        } else {
          event.sender.send('print-completed', { 
            success: false, 
            error: reason || 'La impresión fue cancelada'
          });
        }
      });
      
      return { success: true };
    } catch (error) {
      printWindow.close();
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.error('Error en impresión:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-productos', async () => {
  try {
    const productos = await db.getAllProductos();
    return { success: true, data: productos };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-producto', async (event, id) => {
  try {
    const producto = await db.getProductoById(id);
    return { success: true, data: producto };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('add-producto', async (event, producto) => {
  try {
    const result = await db.insertProducto(producto);
    return { success: true, id: result.lastID };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-producto', async (event, producto) => {
  try {
    await db.updateProducto(producto);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-producto', async (event, id) => {
  try {
    await db.deleteProducto(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-pdf', async (event, pdfData) => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Guardar Viñeta',
    defaultPath: path.join(app.getPath('documents'), 'viñeta.pdf'),
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });

  if (filePath) {
    try {
      const buffer = Buffer.from(pdfData, 'base64');
      fs.writeFileSync(filePath, buffer);
      return { success: true, filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  } else {
    return { success: false, error: 'Operación cancelada' };
  }
});