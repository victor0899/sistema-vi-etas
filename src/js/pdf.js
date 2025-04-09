/**
 * Utilidades para la generación de PDF de viñetas
 */

const CONFIG = {
    // Dimensiones de la viñeta en mm
    width: 50,
    height: 30,
    // Márgenes
    margin: 5,
    // Configuración del código de barras
    barcode: {
      width: 2,
      height: 40,
      format: 'CODE128',
      displayValue: false
    }
  };
  
  /**
   * Genera un PDF con múltiples viñetas
   * @param {Object} producto - Datos del producto
   * @param {Number} cantidad - Cantidad de viñetas a generar
   * @param {jsPDF} doc - Instancia de jsPDF
   * @returns {jsPDF} Documento PDF
   */
  function generarPDFViñetas(producto, cantidad, doc) {
    // Configurar márgenes y dimensiones
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10; // margen en mm
    
    // Dimensiones de la viñeta
    const vinetaWidth = CONFIG.width;
    const vinetaHeight = CONFIG.height;
    
    // Calcular cuántas viñetas caben por fila y por columna
    const columnCount = Math.floor((pageWidth - 2 * margin) / vinetaWidth);
    const rowCount = Math.floor((pageHeight - 2 * margin) / vinetaHeight);
    
    let currentPage = 1;
    let x = margin;
    let y = margin;
    
    // Generar las viñetas
    for (let i = 0; i < cantidad; i++) {
      // Si ya no hay espacio en la página actual, crear una nueva
      if (x > pageWidth - margin - vinetaWidth) {
        x = margin;
        y += vinetaHeight;
      }
      
      if (y > pageHeight - margin - vinetaHeight) {
        doc.addPage();
        currentPage++;
        x = margin;
        y = margin;
      }
      
      // Dibujar la viñeta
      dibujarVineta(doc, producto, x, y, vinetaWidth, vinetaHeight);
      
      // Mover a la siguiente posición
      x += vinetaWidth;
    }
    
    return doc;
  }
  
  /**
   * Dibuja una viñeta individual en el documento PDF
   */
  function dibujarVineta(doc, producto, x, y, width, height) {
    // Borde de la viñeta (opcional)
    // doc.rect(x, y, width, height, 'S');
    
    // Añadir nombre de tienda
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('VARIEDADES PRIMICIA', x + width/2, y + 5, { align: 'center' });
    
    // Añadir nombre de producto
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.text(producto.nombre, x + width/2, y + 9, { align: 'center' });
    
    // Añadir precio
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`$${parseFloat(producto.precio).toFixed(2)}`, x + width/2, y + 13, { align: 'center' });
    
    // Código de barras (convertirlo a imagen desde un canvas)
    try {
      const canvas = document.getElementById('barcodeCanvas');
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', x + 5, y + 15, width - 10, 10);
    } catch (error) {
      console.error('Error al añadir el código de barras:', error);
    }
    
    // Añadir código de barras en texto
    doc.setFontSize(6);
    doc.setFont(undefined, 'normal');
    doc.text(producto.codigo_barras, x + width/2, y + 28, { align: 'center' });
  }
  
  // Exportar funciones para uso en otros archivos
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      generarPDFViñetas,
      dibujarVineta
    };
  }