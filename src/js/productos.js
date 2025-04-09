let productoModal;
let vinetaModal;
let productoForm;
let productosTable;
let searchInput;

function editarProducto(id) {
  console.log('Editando producto:', id);
  mostrarModalEdicion(id);
}

function eliminarProducto(id) {
  console.log('Eliminando producto:', id);
  confirmarEliminacion(id);
}

function generarVineta(id) {
  console.log('Generando viñeta para producto:', id);
  mostrarModalVineta(id);
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM cargado - Inicializando app');
  
  productoModal = document.getElementById('productoModal');
  vinetaModal = document.getElementById('vinetaModal');
  productoForm = document.getElementById('productoForm');
  productosTable = document.getElementById('productosTable');
  searchInput = document.getElementById('searchInput');
  
  cargarProductos();
  
  document.getElementById('btnNuevoProducto').addEventListener('click', () => {
    console.log('Click en Nuevo Producto');
    mostrarModal();
  });
  
  document.getElementById('closeModal').addEventListener('click', () => cerrarModal());
  document.getElementById('cancelarBtn').addEventListener('click', () => cerrarModal());
  
  document.getElementById('closeVinetaModal').addEventListener('click', () => cerrarVinetaModal());
  document.getElementById('cancelarVinetaBtn').addEventListener('click', () => cerrarVinetaModal());
  
  document.getElementById('imprimirBtn').addEventListener('click', () => {
    console.log('Click en Imprimir');
    imprimirDirecto();
  });
  
  const generarPDFBtn = document.getElementById('generarPDFBtn');
  if (generarPDFBtn) {
    generarPDFBtn.addEventListener('click', () => {
      console.log('Click en Generar PDF');
      generarPDF();
    });
  }
  
  productoForm.addEventListener('submit', (event) => {
    console.log('Formulario enviado');
    guardarProducto(event);
  });
  
  searchInput.addEventListener('input', filtrarProductos);
});

async function cargarProductos() {
  console.log('Cargando productos...');
  productosTable.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center">Cargando productos...</td></tr>';
  
  try {
    const response = await window.api.getProductos();
    console.log('Respuesta de getProductos:', response);
    
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
  console.log('Mostrando productos:', productos);
  
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
  console.log('Filtrando productos con query:', query);
  
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
  
  console.log('Guardando producto:', producto, 'ID:', productoId || 'nuevo');
  
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
    console.log('Mostrando modal en modo edición:', producto);
    document.getElementById('modalTitle').textContent = 'Editar Producto';
    document.getElementById('productoId').value = producto.id;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('codigo_barras').value = producto.codigo_barras;
    document.getElementById('descripcion').value = producto.descripcion || '';
  } else {
    console.log('Mostrando modal en modo creación');
    document.getElementById('modalTitle').textContent = 'Nuevo Producto';
  }
  
  productoModal.classList.remove('hidden');
  productoModal.classList.add('flex');
}

function cerrarModal() {
  console.log('Cerrando modal de producto');
  productoModal.classList.add('hidden');
  productoModal.classList.remove('flex');
}

function cerrarVinetaModal() {
  console.log('Cerrando modal de viñeta');
  vinetaModal.classList.add('hidden');
  vinetaModal.classList.remove('flex');
}

async function mostrarModalVineta(id) {
  try {
    console.log('Mostrando modal de viñeta para producto ID:', id);
    const response = await window.api.getProducto(id);
    
    if (response.success) {
      const producto = response.data;
      console.log('Datos del producto para viñeta:', producto);
      
      vinetaModal.classList.remove('hidden');
      vinetaModal.classList.add('flex');
      
      generarVistaPrevia(producto);
    } else {
      console.error('Error al obtener producto para viñeta:', response.error);
      mostrarMensaje('Error al obtener el producto: ' + response.error, 'error');
    }
  } catch (error) {
    console.error('Exception en mostrarModalVineta:', error);
    mostrarMensaje('Error en la aplicación: ' + error.message, 'error');
  }
}

function generarVistaPrevia(producto) {
  console.log('Generando vista previa para:', producto);
  const preview = document.getElementById('vinetaPreview');
  preview.innerHTML = '';
  const vinetaContainer = document.createElement('div');
  vinetaContainer.className = 'vineta-container border border-gray-300 p-3 bg-white';
  vinetaContainer.style.width = '300px';
  const negocioNombre = document.createElement('div');
  negocioNombre.className = 'text-center font-bold text-sm mb-1';
  negocioNombre.textContent = 'VARIEDADES PRIMICIA';
  const productoNombre = document.createElement('div');
  productoNombre.className = 'text-center text-sm mb-1';
  productoNombre.textContent = producto.nombre;
  const precio = document.createElement('div');
  precio.className = 'text-center font-bold text-lg mb-2';
  precio.textContent = `$${parseFloat(producto.precio).toFixed(2)}`;
  const barcodeCanvas = document.createElement('canvas');
  barcodeCanvas.id = 'barcodeCanvas';
  const codigoInfo = document.createElement('div');
  codigoInfo.className = 'text-center text-xs mt-1';
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
      height: 50,
      displayValue: false
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
    console.log('Imprimiendo viñetas, cantidad:', cantidad, 'Producto ID:', productoId);
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
          width: 50mm;
          height: 30mm;
          padding: 2mm;
          box-sizing: border-box;
          text-align: center;
          border: 0;
          page-break-inside: avoid;
        }
        .vineta-print .titulo { font-weight: bold; font-size: 8pt; margin-bottom: 1mm; }
        .vineta-print .nombre { font-size: 7pt; margin-bottom: 1mm; }
        .vineta-print .precio { font-weight: bold; font-size: 10pt; margin-bottom: 2mm; }
        .vineta-print img { max-width: 100%; height: 10mm; }
        .vineta-print .codigo { font-size: 6pt; margin-top: 1mm; }
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
      
      vineta.innerHTML = `
        <div class="titulo">VARIEDADES PRIMICIA</div>
        <div class="nombre">${producto.nombre}</div>
        <div class="precio">$${parseFloat(producto.precio).toFixed(2)}</div>
        <img src="${barcodeImage}" alt="Código de barras">
        <div class="codigo">${producto.codigo_barras}</div>
      `;
      
      vinetasContainer.appendChild(vineta);
    }
    
    window.api.onPrintCompleted((result) => {
      console.log('Resultado de impresión:', result);
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
        console.log('Enviando a imprimir...');
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
    console.log('Generando PDF, cantidad:', cantidad, 'Producto ID:', productoId);
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
    
    // Configurar márgenes y dimensiones
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10; // margen en mm
    
    // Tamaño de la viñeta (ajustar según necesidad)
    const vinetaWidth = 50; // ancho en mm
    const vinetaHeight = 30; // alto en mm
    
    // Calcular cuántas viñetas caben por fila y por columna
    const columnCount = Math.floor((pageWidth - 2 * margin) / vinetaWidth);
    
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
      
      // Añadir nombre de tienda
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text('VARIEDADES PRIMICIA', x + vinetaWidth/2, y + 5, { align: 'center' });
      
      // Añadir nombre de producto
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');
      doc.text(producto.nombre, x + vinetaWidth/2, y + 9, { align: 'center' });
      
      // Añadir precio
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`$${parseFloat(producto.precio).toFixed(2)}`, x + vinetaWidth/2, y + 13, { align: 'center' });
      
      // Código de barras (convertirlo a imagen)
      const canvas = document.getElementById('barcodeCanvas');
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', x + 5, y + 15, vinetaWidth - 10, 10);
      
      // Añadir código de barras en texto
      doc.setFontSize(6);
      doc.setFont(undefined, 'normal');
      doc.text(producto.codigo_barras, x + vinetaWidth/2, y + 28, { align: 'center' });
      
      // Mover a la siguiente posición
      x += vinetaWidth;
    }
    
    const pdfData = doc.output('datauristring');
    const base64Data = pdfData.split(',')[1];
    
    console.log('Guardando PDF...');
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
  console.log(`Mensaje (${tipo}):`, mensaje);
  alert(mensaje);
}