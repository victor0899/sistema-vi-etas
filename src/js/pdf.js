
const CONFIG = {

  width: 100,
  height: 65,

  margin: 2,

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

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 5;


  const vinetaWidth = CONFIG.width;
  const vinetaHeight = CONFIG.height;


  const columnCount = Math.floor((pageWidth - 2 * margin) / vinetaWidth);
  const rowCount = Math.floor((pageHeight - 2 * margin) / vinetaHeight);

  let currentPage = 1;
  let x = margin;
  let y = margin;


  for (let i = 0; i < cantidad; i++) {

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


    dibujarVineta(doc, producto, x, y, vinetaWidth, vinetaHeight);


    x += vinetaWidth;
  }

  return doc;
}

function dibujarVineta(doc, producto, x, y, width, height) {
  const inMargin = 5;
  const centerX = x + width / 2;


  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('VARIEDADES PRIMICIA', centerX, y + inMargin + 6, { align: 'center' });


  const nombreProducto = producto.nombre || 'Producto sin nombre';
  let nombreMostrado = nombreProducto;
  if (nombreMostrado.length > 25) {
    nombreMostrado = nombreMostrado.substring(0, 22) + '...';
  }

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text(nombreMostrado, centerX, y + inMargin + 12, { align: 'center' });


  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`$${parseFloat(producto.precio).toFixed(2)}`, centerX, y + inMargin + 20, { align: 'center' });


  try {
    const canvas = document.getElementById('barcodeCanvas');
    const imgData = canvas.toDataURL('image/png');


    const barWidth = width - 2 * inMargin;
    const barHeight = 20;
    const barX = x + inMargin;
    const barY = y + inMargin + 25;

    doc.addImage(imgData, 'PNG', barX, barY, barWidth, barHeight);
  } catch (error) {
    console.error('Error al añadir el código de barras:', error);
  }


  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text(producto.codigo_barras, centerX, y + height - inMargin - 2, { align: 'center' });
}


if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generarPDFViñetas,
    dibujarVineta
  };
}