/**
 * Utilidades para la generación de PDF de viñetas
 */

const CONFIG = {
  // Dimensiones de la viñeta en mm (ajustadas a la etiqueta térmica real 100x65mm)
  width: 100,
  height: 65,
  // Márgenes
  margin: 2,
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
  const margin = 5; // margen en mm
  
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
    // Si ya no hay espacio en la fila actual, pasar a la siguiente fila
    if (x > pageWidth - margin - vinetaWidth) {
      x = margin;
      y += vinetaHeight;
    }
    
    // Si ya no hay espacio en la página actual, crear una nueva página
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
  // Usar rect con línea muy fina para ayudar a visualizar los bordes (opcional)
  // doc.setLineWidth(0.1);
  // doc.rect(x, y, width, height, 'S');
  
  // Definir margen interno para el contenido
  const inMargin = 5;
  
  // Calcular posiciones centradas
  const centerX = x + width/2;
  
  // Añadir nombre de tienda
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('VARIEDADES PRIMICIA', centerX, y + inMargin + 6, { align: 'center' });
  
  // Añadir nombre de producto
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(producto.nombre, centerX, y + inMargin + 12, { align: 'center' });
  
  // Añadir precio
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`$${parseFloat(producto.precio).toFixed(2)}`, centerX, y + inMargin + 20, { align: 'center' });
  
  // Código de barras (convertirlo a imagen desde un canvas)
  try {
    const canvas = document.getElementById('barcodeCanvas');
    const imgData = canvas.toDataURL('image/png');
    
    // Posicionar el código de barras centradamente
    const barWidth = width - 2 * inMargin;
    const barHeight = 20;
    const barX = x + inMargin;
    const barY = y + inMargin + 25;
    
    doc.addImage(imgData, 'PNG', barX, barY, barWidth, barHeight);
  } catch (error) {
    console.error('Error al añadir el código de barras:', error);
  }
  
  // Añadir código de barras en texto
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text(producto.codigo_barras, centerX, y + height - inMargin - 2, { align: 'center' });
}

// Exportar funciones para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generarPDFViñetas,
    dibujarVineta
  };
}