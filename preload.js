const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getProductos: () => ipcRenderer.invoke('get-productos'),
  getProducto: (id) => ipcRenderer.invoke('get-producto', id),
  addProducto: (producto) => ipcRenderer.invoke('add-producto', producto),
  updateProducto: (producto) => ipcRenderer.invoke('update-producto', producto),
  deleteProducto: (id) => ipcRenderer.invoke('delete-producto', id),
  savePDF: (pdfData) => ipcRenderer.invoke('save-pdf', pdfData),
  
  // Versión actualizada que permite enviar opciones de impresión personalizadas
  printVineta: (htmlContent, printOptions) => ipcRenderer.invoke('print-vineta', htmlContent, printOptions),
  
  // Mantener compatible con la interfaz existente
  onPrintCompleted: (callback) => ipcRenderer.on('print-completed', (_, result) => callback(result))
});