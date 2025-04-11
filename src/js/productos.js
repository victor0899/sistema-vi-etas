let productoModal;
let vinetaModal;
let productoForm;
let productosTable;
let searchInput;

function editarProducto(id) {

  mostrarModalEdicion(id);
}

function eliminarProducto(id) {

  confirmarEliminacion(id);
}

function generarVineta(id) {

  mostrarModalVineta(id);
}

document.addEventListener('DOMContentLoaded', () => {


  productoModal = document.getElementById('productoModal');
  vinetaModal = document.getElementById('vinetaModal');
  productoForm = document.getElementById('productoForm');
  productosTable = document.getElementById('productosTable');
  searchInput = document.getElementById('searchInput');

  cargarProductos();

  document.getElementById('btnNuevoProducto').addEventListener('click', () => {

    mostrarModal();
  });

  document.getElementById('closeModal').addEventListener('click', () => cerrarModal());
  document.getElementById('cancelarBtn').addEventListener('click', () => cerrarModal());

  document.getElementById('closeVinetaModal').addEventListener('click', () => cerrarVinetaModal());
  document.getElementById('cancelarVinetaBtn').addEventListener('click', () => cerrarVinetaModal());

  document.getElementById('imprimirBtn').addEventListener('click', () => {

    imprimirDirecto();
  });

  const generarPDFBtn = document.getElementById('generarPDFBtn');
  if (generarPDFBtn) {
    generarPDFBtn.addEventListener('click', () => {

      generarPDF();
    });
  }

  productoForm.addEventListener('submit', (event) => {

    guardarProducto(event);
  });

  searchInput.addEventListener('input', filtrarProductos);
});

async function cargarProductos() {

  productosTable.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center">Cargando productos...</td></tr>';

  try {
    const response = await window.api.getProductos();


    if (response.success) {
      mostrarProductos(response.data);
    } else {
      console.error('Error al cargar productos:', response.error);
      productosTable.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error al cargar productos: ${response.error}</td></tr>`;
    }
  } catch (error) {
    console.error('Exception en cargarProductos:', error);
    productosTable.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error en la aplicación: ${error.message}</td></tr>`;
  }
}

function mostrarProductos(productos) {


  if (!productos || productos.length === 0) {
    productosTable.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-4 text-center">No hay productos registrados</td>
      </tr>
    `;
    return;
  }

  const rows = productos.map(producto => `
    <tr class="border-b hover:bg-gray-50">
      <td class="px-6 py-4">${producto.id}</td>
      <td class="px-6 py-4">${producto.nombre}</td>
      <td class="px-6 py-4">$${parseFloat(producto.precio).toFixed(2)}</td>
      <td class="px-6 py-4">${producto.codigo_barras}</td>
      <td class="px-6 py-4">
        <div class="flex space-x-2">
          <button class="text-blue-600 hover:text-blue-800" onclick="editarProducto(${producto.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="text-red-600 hover:text-red-800" onclick="eliminarProducto(${producto.id})">
            <i class="fas fa-trash"></i>
          </button>
          <button class="text-green-600 hover:text-green-800" onclick="generarVineta(${producto.id})">
            <i class="fas fa-print"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  productosTable.innerHTML = rows;
}

async function filtrarProductos() {
  const query = searchInput.value.trim();


  try {
    let productos;
    const response = await window.api.getProductos();

    if (response.success) {
      if (query === '') {
        productos = response.data;
      } else {
        productos = response.data.filter(producto =>
          producto.nombre.toLowerCase().includes(query.toLowerCase()) ||
          producto.codigo_barras.toLowerCase().includes(query.toLowerCase())
        );
      }
      mostrarProductos(productos);
    } else {
      console.error('Error al filtrar productos:', response.error);
      mostrarMensaje('Error al filtrar productos: ' + response.error, 'error');
    }
  } catch (error) {
    console.error('Exception en filtrarProductos:', error);
    mostrarMensaje('Error en la aplicación: ' + error.message, 'error');
  }
}

async function guardarProducto(event) {
  event.preventDefault();

  const productoId = document.getElementById('productoId').value;
  const producto = {
    nombre: document.getElementById('nombre').value,
    precio: parseFloat(document.getElementById('precio').value),
    codigo_barras: document.getElementById('codigo_barras').value,
    descripcion: document.getElementById('descripcion').value || ''
  };



  try {
    let response;

    if (productoId) {
      producto.id = parseInt(productoId);
      response = await window.api.updateProducto(producto);
      if (response.success) {
        mostrarMensaje('Producto actualizado correctamente', 'success');
      }
    } else {
      response = await window.api.addProducto(producto);
      if (response.success) {
        mostrarMensaje('Producto agregado correctamente', 'success');
      }
    }

    if (response.success) {
      cerrarModal();
      await cargarProductos();
    } else {
      console.error('Error al guardar producto:', response.error);
      mostrarMensaje('Error: ' + response.error, 'error');
    }
  } catch (error) {
    console.error('Exception en guardarProducto:', error);
    mostrarMensaje('Error en la aplicación: ' + error.message, 'error');
  }
}

async function mostrarModalEdicion(id) {
  try {
    const response = await window.api.getProducto(id);

    if (response.success) {
      mostrarModal(response.data);
    } else {
      console.error('Error al obtener producto para edición:', response.error);
      mostrarMensaje('Error al obtener el producto: ' + response.error, 'error');
    }
  } catch (error) {
    console.error('Exception en mostrarModalEdicion:', error);
    mostrarMensaje('Error en la aplicación: ' + error.message, 'error');
  }
}

async function confirmarEliminacion(id) {
  if (confirm('¿Está seguro de que desea eliminar este producto?')) {
    try {
      const response = await window.api.deleteProducto(id);

      if (response.success) {
        mostrarMensaje('Producto eliminado correctamente', 'success');
        cargarProductos();
      } else {
        console.error('Error al eliminar producto:', response.error);
        mostrarMensaje('Error al eliminar el producto: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Exception en confirmarEliminacion:', error);
      mostrarMensaje('Error en la aplicación: ' + error.message, 'error');
    }
  }
}

function mostrarModal(producto = null) {
  productoForm.reset();
  document.getElementById('productoId').value = '';

  if (producto) {

    document.getElementById('modalTitle').textContent = 'Editar Producto';
    document.getElementById('productoId').value = producto.id;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('codigo_barras').value = producto.codigo_barras;
    document.getElementById('descripcion').value = producto.descripcion || '';
  } else {

    document.getElementById('modalTitle').textContent = 'Nuevo Producto';
  }

  productoModal.classList.remove('hidden');
  productoModal.classList.add('flex');
}

function cerrarModal() {

  productoModal.classList.add('hidden');
  productoModal.classList.remove('flex');
}

function cerrarVinetaModal() {

  vinetaModal.classList.add('hidden');
  vinetaModal.classList.remove('flex');
}


async function mostrarModalVineta(id) {
  try {

    const response = await window.api.getProducto(id);

    if (response.success) {
      const producto = response.data;



      if (!producto.nombre) {
        console.error('⚠️ ALERTA: El campo nombre del producto está vacío o undefined');
      } else {

      }


      const prevDebug = document.getElementById('vineta-debug');
      if (prevDebug) prevDebug.remove();


      vinetaModal.classList.remove('hidden');
      vinetaModal.classList.add('flex');


      const debugElement = document.createElement('div');
      debugElement.id = 'vineta-debug';
      debugElement.style.display = 'none';
      debugElement.innerHTML = `
        <div style="position: fixed; bottom: 10px; right: 10px; background: #f0f0f0; 
                    border: 1px solid #ccc; padding: 10px; z-index: 9999; max-width: 300px; 
                    font-size: 12px; display: none;">
          <h4>Debug Info:</h4>
          <p><strong>ID:</strong> ${producto.id}</p>
          <p><strong>Nombre:</strong> "${producto.nombre || 'undefined'}"</p>
          <p><strong>Precio:</strong> ${producto.precio}</p>
          <p><strong>Código:</strong> ${producto.codigo_barras}</p>
          <button id="toggleDebug" style="background: #ddd; padding: 2px 5px; margin-top: 5px;">
            Ocultar
          </button>
        </div>`;
      document.body.appendChild(debugElement);


      generarVistaPrevia(producto);


      const debugBtn = document.createElement('button');
      debugBtn.id = 'showDebug';
      debugBtn.innerText = 'Debug';
      debugBtn.className = 'text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded';
      debugBtn.style.position = 'absolute';
      debugBtn.style.bottom = '10px';
      debugBtn.style.right = '10px';
      vinetaModal.querySelector('.bg-white').appendChild(debugBtn);


      setTimeout(() => {
        document.getElementById('showDebug')?.addEventListener('click', () => {
          const debugInfo = document.querySelector('#vineta-debug div');
          debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('toggleDebug')?.addEventListener('click', () => {
          document.querySelector('#vineta-debug div').style.display = 'none';
        });


        const nombreElement = vinetaModal.querySelector('.producto-nombre');
        if (nombreElement) {


        } else {
          console.error('⚠️ El elemento de nombre no está en el DOM después de generarVistaPrevia');
        }
      }, 200);

    } else {
      console.error('Error al obtener producto para viñeta:', response.error);
      mostrarMensaje('Error al obtener el producto: ' + response.error, 'error');
    }
  } catch (error) {
    console.error('Exception en mostrarModalVineta:', error);
    mostrarMensaje('Error en la aplicación: ' + error.message, 'error');
  }
}

async function verificarEstructuraProducto(id) {
  const db = new Database();
  try {

    const query = `
      SELECT 
        id,
        nombre as nombre_producto,
        precio,
        codigo_barras,
        descripcion,
        created_at,
        updated_at
      FROM productos 
      WHERE id = ?
    `;

    return new Promise((resolve, reject) => {
      db.db.get(query, [id], (err, row) => {
        if (err) {
          console.error('Error en la consulta:', err);
          reject(err);
        } else {

          resolve(row);
        }
      });
    });
  } catch (error) {
    console.error('Error al verificar estructura:', error);
  } finally {
    db.close();
  }
}

function generarVistaPrevia(producto) {



  if (!producto || !producto.nombre) {
    console.error('El producto no tiene nombre o es undefined:', producto);
  } else {

  }

  const preview = document.getElementById('vinetaPreview');
  preview.innerHTML = '';

  const vinetaContainer = document.createElement('div');
  vinetaContainer.className = 'vineta-container border border-gray-300 p-3 bg-white';


  vinetaContainer.style.width = '300px';
  vinetaContainer.style.height = '195px';


  const negocioNombre = document.createElement('div');
  negocioNombre.className = 'text-center font-bold mb-2';
  negocioNombre.style.fontSize = '16px';
  negocioNombre.textContent = 'VARIEDADES PRIMICIA';


  const productoNombre = document.createElement('div');
  productoNombre.className = 'producto-nombre';


  if (producto && producto.nombre) {

    if (producto.nombre.length > 25) {
      productoNombre.textContent = producto.nombre.substring(0, 22) + '...';
    } else {
      productoNombre.textContent = producto.nombre;
    }
  } else {
    productoNombre.textContent = 'Producto sin nombre';
    productoNombre.style.color = 'red';
  }

  const precio = document.createElement('div');
  precio.className = 'text-center font-bold mb-3';
  precio.style.fontSize = '22px';
  precio.textContent = `$${parseFloat(producto.precio).toFixed(2)}`;

  const barcodeCanvas = document.createElement('canvas');
  barcodeCanvas.id = 'barcodeCanvas';
  barcodeCanvas.style.width = '80%';
  barcodeCanvas.style.marginBottom = '10px';

  const codigoInfo = document.createElement('div');
  codigoInfo.className = 'text-center mt-1';
  codigoInfo.style.fontSize = '12px';
  codigoInfo.textContent = producto.codigo_barras;


  vinetaContainer.appendChild(negocioNombre);
  vinetaContainer.appendChild(productoNombre);
  vinetaContainer.appendChild(precio);
  vinetaContainer.appendChild(barcodeCanvas);
  vinetaContainer.appendChild(codigoInfo);

  preview.appendChild(vinetaContainer);

  try {

    JsBarcode('#barcodeCanvas', producto.codigo_barras, {
      format: 'CODE128',
      width: 2,
      height: 60,
      displayValue: false,
      margin: 5
    });
  } catch (error) {
    console.error('Error al generar código de barras:', error);
    codigoInfo.textContent = 'Error al generar código de barras: ' + error.message;
    codigoInfo.className = 'text-center text-red-500 text-xs mt-1';
  }

  preview.dataset.productoId = producto.id;

  return vinetaContainer;
}

async function imprimirDirecto() {
  const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
  const productoId = document.getElementById('vinetaPreview').dataset.productoId;

  try {

    const response = await window.api.getProducto(productoId);

    if (!response.success) {
      console.error('Error al obtener datos del producto para impresión:', response.error);
      mostrarMensaje('Error al obtener datos del producto', 'error');
      return;
    }

    const producto = response.data;


    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.style.position = 'fixed';
    printContainer.style.top = '-9999px';
    printContainer.style.left = '-9999px';
    document.body.appendChild(printContainer);

    const style = document.createElement('style');
    style.textContent = `
      @media print {
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
          color: #000 !important; 
          display: block !important;
        }
        .vineta-print .nombre { 
          font-size: 10pt; 
          font-weight: bold;
          margin-bottom: 3mm; 
          color: #000 !important; 
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
          color: #000 !important;
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
          color: #000 !important;
          display: block !important; 
        }
      }
    `;
    printContainer.appendChild(style);

    const vinetasContainer = document.createElement('div');
    vinetasContainer.className = 'print-row';
    printContainer.appendChild(vinetasContainer);

    const canvas = document.getElementById('barcodeCanvas');
    const barcodeImage = canvas.toDataURL('image/png');

    for (let i = 0; i < cantidad; i++) {
      const vineta = document.createElement('div');
      vineta.className = 'vineta-print';


      let nombreMostrado = producto.nombre || 'Producto sin nombre';
      if (nombreMostrado.length > 25) {
        nombreMostrado = nombreMostrado.substring(0, 22) + '...';
      }

      vineta.innerHTML = `
        <div class="titulo">VARIEDADES PRIMICIA</div>
        <div class="nombre" style="color: #000; font-weight: bold; display: block !important;">${nombreMostrado}</div>
        <div class="precio">$${parseFloat(producto.precio).toFixed(2)}</div>
        <img src="${barcodeImage}" alt="Código de barras">
        <div class="codigo">${producto.codigo_barras}</div>
      `;

      vinetasContainer.appendChild(vineta);
    }

    window.api.onPrintCompleted((result) => {

      if (result.success) {
        mostrarMensaje('Viñetas enviadas a la impresora correctamente', 'success');
        cerrarVinetaModal();
      } else {
        console.error('Error al imprimir:', result.error);
        mostrarMensaje('Error al imprimir: ' + (result.error || 'La impresión fue cancelada'), 'error');
      }

      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
    });

    setTimeout(async () => {
      try {


        const printResult = await window.api.printVineta(printContainer.innerHTML);

        if (!printResult.success) {
          console.error('Error al iniciar la impresión:', printResult.error);
          mostrarMensaje('Error al iniciar la impresión: ' + printResult.error, 'error');
          if (document.body.contains(printContainer)) {
            document.body.removeChild(printContainer);
          }
        }
      } catch (error) {
        console.error('Exception en la impresión:', error);
        mostrarMensaje('Error en el proceso de impresión: ' + error.message, 'error');
        if (document.body.contains(printContainer)) {
          document.body.removeChild(printContainer);
        }
      }
    }, 300);

  } catch (error) {
    console.error('Exception general en imprimirDirecto:', error);
    mostrarMensaje('Error al preparar la impresión: ' + error.message, 'error');
  }
}

async function generarPDF() {
  const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
  const productoId = document.getElementById('vinetaPreview').dataset.productoId;

  try {

    const response = await window.api.getProducto(productoId);

    if (!response.success) {
      console.error('Error al obtener datos del producto para PDF:', response.error);
      mostrarMensaje('Error al obtener datos del producto', 'error');
      return;
    }

    const producto = response.data;


    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });


    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 5;


    const vinetaWidth = 100;
    const vinetaHeight = 65;


    const columnCount = Math.floor((pageWidth - 2 * margin) / vinetaWidth);

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

      const inMargin = 5;
      const centerX = x + vinetaWidth / 2;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('VARIEDADES PRIMICIA', centerX, y + inMargin + 8, { align: 'center' });


      const nombreProducto = producto.nombre || 'Producto sin nombre';



      let nombreMostrado = nombreProducto;
      if (nombreMostrado.length > 25) {
        nombreMostrado = nombreMostrado.substring(0, 22) + '...';
      }

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(nombreMostrado, centerX, y + inMargin + 16, { align: 'center' });


      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`$${parseFloat(producto.precio).toFixed(2)}`, centerX, y + inMargin + 26, { align: 'center' });


      const canvas = document.getElementById('barcodeCanvas');
      const imgData = canvas.toDataURL('image/png');


      const barWidth = vinetaWidth - 2 * inMargin;
      const barHeight = 20;
      const barX = x + inMargin;
      const barY = y + inMargin + 30;

      doc.addImage(imgData, 'PNG', barX, barY, barWidth, barHeight);


      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(producto.codigo_barras, centerX, y + vinetaHeight - inMargin - 2, { align: 'center' });


      x += vinetaWidth;
    }

    const pdfData = doc.output('datauristring');
    const base64Data = pdfData.split(',')[1];


    const saveResult = await window.api.savePDF(base64Data);

    if (saveResult.success) {
      mostrarMensaje(`PDF guardado en: ${saveResult.filePath}`, 'success');
      cerrarVinetaModal();
    } else {
      console.error('Error al guardar PDF:', saveResult.error);
      mostrarMensaje('Error al guardar el PDF: ' + saveResult.error, 'error');
    }

  } catch (error) {
    console.error('Exception en generarPDF:', error);
    mostrarMensaje('Error al generar PDF: ' + error.message, 'error');
  }
}



async function generarPDF() {
  const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
  const productoId = document.getElementById('vinetaPreview').dataset.productoId;

  try {

    const response = await window.api.getProducto(productoId);

    if (!response.success) {
      console.error('Error al obtener datos del producto para PDF:', response.error);
      mostrarMensaje('Error al obtener datos del producto', 'error');
      return;
    }

    const producto = response.data;


    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });


    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 5;


    const vinetaWidth = 100;
    const vinetaHeight = 65;


    const columnCount = Math.floor((pageWidth - 2 * margin) / vinetaWidth);

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


      const inMargin = 5;


      const centerX = x + vinetaWidth / 2;






      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('VARIEDADES PRIMICIA', centerX, y + inMargin + 8, { align: 'center' });


      const nombreProducto = producto.nombre || 'Producto sin nombre';



      let nombreMostrado = nombreProducto;
      if (nombreMostrado.length > 25) {
        nombreMostrado = nombreMostrado.substring(0, 22) + '...';
      }

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(nombreMostrado, centerX, y + inMargin + 16, { align: 'center' });


      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`$${parseFloat(producto.precio).toFixed(2)}`, centerX, y + inMargin + 26, { align: 'center' });


      const canvas = document.getElementById('barcodeCanvas');
      const imgData = canvas.toDataURL('image/png');


      const barWidth = vinetaWidth - 2 * inMargin;
      const barHeight = 20;
      const barX = x + inMargin;
      const barY = y + inMargin + 30;

      doc.addImage(imgData, 'PNG', barX, barY, barWidth, barHeight);


      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(producto.codigo_barras, centerX, y + vinetaHeight - inMargin - 2, { align: 'center' });


      x += vinetaWidth;
    }

    const pdfData = doc.output('datauristring');
    const base64Data = pdfData.split(',')[1];


    const saveResult = await window.api.savePDF(base64Data);

    if (saveResult.success) {
      mostrarMensaje(`PDF guardado en: ${saveResult.filePath}`, 'success');
      cerrarVinetaModal();
    } else {
      console.error('Error al guardar PDF:', saveResult.error);
      mostrarMensaje('Error al guardar el PDF: ' + saveResult.error, 'error');
    }

  } catch (error) {
    console.error('Exception en generarPDF:', error);
    mostrarMensaje('Error al generar PDF: ' + error.message, 'error');
  }
}

function mostrarMensaje(mensaje, tipo = 'info') {

  alert(mensaje);
}