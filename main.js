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

ipcMain.handle('print-vineta', async (event, htmlContent, printOptions = {}) => {
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

    // Preparar CSS con configuración de tamaño de página específico (100x65mm)
    const customCSS = `
      @page {
        size: 100mm 65mm !important;
        margin: 0 !important;
      }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100mm !important;
          height: 65mm !important;
          overflow: hidden !important;
        }
        .vineta-print {
          width: 100mm !important;
          height: 65mm !important;
          padding: ${printOptions.margins?.top || 3}mm ${printOptions.margins?.right || 3}mm ${printOptions.margins?.bottom || 3}mm ${printOptions.margins?.left || 3}mm !important;
          box-sizing: border-box !important;
          text-align: center !important;
          page-break-after: always !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          overflow: hidden !important;
        }
      }
    `;

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
          .vineta-print img.barcode { 
            max-width: 80%; 
            height: 20mm; 
            margin-bottom: 2mm;
            display: block !important;
          }
          .vineta-print .codigo { 
            font-size: 8pt; 
            margin-bottom: 3mm; 
            color: #000 !important;
            display: block !important; 
          }
          .vineta-print .nombre-precio-container {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
            margin-top: 2mm !important;
          }
          .vineta-print .nombre { 
            font-size: 10pt; 
            font-weight: bold !important;
            color: #000 !important; 
            text-align: left !important;
            flex: 1 !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            padding-right: 2mm !important;
            display: inline-block !important;
            visibility: visible !important;
          }
          .vineta-print .precio { 
            font-weight: bold !important; 
            font-size: 14pt; 
            color: #000 !important;
            text-align: right !important;
            white-space: nowrap !important;
            display: inline-block !important;
          }
          ${customCSS}
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `));

    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Configurar opciones específicas para impresión de etiquetas
      const defaultPrintOptions = { 
        silent: false,
        printBackground: true,
        color: true,
        margin: {
          marginType: 'none', // Sin márgenes
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        },
        landscape: false,
        scaleFactor: 100,
        pagesPerSheet: 1,
        copies: 1,
        // Especificar tamaño personalizado en micrones (1mm = 1000 micrones)
        // 100mm x 65mm convertido a micrones
        pageSize: {
          width: 100000,
          height: 65000,
          microns: true
        },
        showPrintDialog: true  // Mostrar diálogo para confirmar
      };
      
      // Combinar opciones predeterminadas con las proporcionadas
      const mergedOptions = {...defaultPrintOptions, ...printOptions};
      
      await printWindow.webContents.print(mergedOptions, (success, reason) => {
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