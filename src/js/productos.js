let vinetaConfig = {
  marginTop: 1,
  marginBottom: 1,
  marginLeft: 1,
  marginRight: 1,

  fontSizeTitle: 14,
  fontSizeName: 12,
  fontSizePrice: 20,
  fontSizeCode: 10,

  vinetaWidth: 80,  
  vinetaHeight: 45,  

  barcodeWidth: 80,
  barcodeHeight: 60
};

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


function initConfigControls() {

  const savedConfig = localStorage.getItem('vinetaConfig');
  if (savedConfig) {
    try {
      vinetaConfig = JSON.parse(savedConfig);
      updateConfigControls();
    } catch (e) {
      console.error('Error al cargar la configuración guardada:', e);
    }
  }


  setupConfigListeners();
}


function updateConfigControls() {

  document.getElementById('marginTop').value = vinetaConfig.marginTop;
  document.getElementById('marginTopValue').textContent = vinetaConfig.marginTop;

  document.getElementById('marginBottom').value = vinetaConfig.marginBottom;
  document.getElementById('marginBottomValue').textContent = vinetaConfig.marginBottom;

  document.getElementById('marginLeft').value = vinetaConfig.marginLeft;
  document.getElementById('marginLeftValue').textContent = vinetaConfig.marginLeft;

  document.getElementById('marginRight').value = vinetaConfig.marginRight;
  document.getElementById('marginRightValue').textContent = vinetaConfig.marginRight;

  document.getElementById('fontSizeTitle').value = vinetaConfig.fontSizeTitle;
  document.getElementById('fontSizeTitleValue').textContent = vinetaConfig.fontSizeTitle;

  document.getElementById('fontSizeName').value = vinetaConfig.fontSizeName;
  document.getElementById('fontSizeNameValue').textContent = vinetaConfig.fontSizeName;

  document.getElementById('fontSizePrice').value = vinetaConfig.fontSizePrice;
  document.getElementById('fontSizePriceValue').textContent = vinetaConfig.fontSizePrice;

  document.getElementById('fontSizeCode').value = vinetaConfig.fontSizeCode;
  document.getElementById('fontSizeCodeValue').textContent = vinetaConfig.fontSizeCode;

  document.getElementById('vinetaWidth').value = vinetaConfig.vinetaWidth;
  document.getElementById('vinetaWidthValue').textContent = vinetaConfig.vinetaWidth;

  document.getElementById('vinetaHeight').value = vinetaConfig.vinetaHeight;
  document.getElementById('vinetaHeightValue').textContent = vinetaConfig.vinetaHeight;

  document.getElementById('barcodeWidth').value = vinetaConfig.barcodeWidth;
  document.getElementById('barcodeWidthValue').textContent = vinetaConfig.barcodeWidth;

  document.getElementById('barcodeHeight').value = vinetaConfig.barcodeHeight;
  document.getElementById('barcodeHeightValue').textContent = vinetaConfig.barcodeHeight;
}


function setupConfigListeners() {

  const sliders = document.querySelectorAll('.config-panel input[type="range"]');
  sliders.forEach(slider => {
    slider.addEventListener('input', function () {

      const valueDisplay = document.getElementById(`${this.id}Value`);
      if (valueDisplay) {
        valueDisplay.textContent = this.value;
      }


      vinetaConfig[this.id] = parseFloat(this.value);


      updateVinetaPreview();
    });
  });


  document.getElementById('resetConfig').addEventListener('click', function () {

    vinetaConfig = {
      marginTop: 3,
      marginBottom: 3,
      marginLeft: 3,
      marginRight: 3,
      fontSizeTitle: 16,
      fontSizeName: 14,
      fontSizePrice: 22,
      fontSizeCode: 12,
      vinetaWidth: 100,
      vinetaHeight: 65,
      barcodeWidth: 80,
      barcodeHeight: 60
    };


    updateConfigControls();
    updateVinetaPreview();
  });


  document.getElementById('saveConfig').addEventListener('click', function () {
    try {
      localStorage.setItem('vinetaConfig', JSON.stringify(vinetaConfig));
      mostrarMensaje('Configuración guardada correctamente', 'success');
    } catch (e) {
      console.error('Error al guardar la configuración:', e);
      mostrarMensaje('Error al guardar la configuración', 'error');
    }
  });
}


function updateVinetaPreview() {
  const productoId = document.getElementById('vinetaPreview').dataset.productoId;
  if (productoId) {
    window.api.getProducto(parseInt(productoId))
      .then(response => {
        if (response.success) {
          generarVistaPrevia(response.data);
        }
      })
      .catch(error => {
        console.error('Error al actualizar vista previa:', error);
      });
  }
}

async function mostrarModalVineta(id) {
  try {

    const response = await window.api.getProducto(id);

    if (response.success) {
      const producto = response.data;


      if (!producto.nombre) {
        console.error('⚠️ ALERTA: El campo nombre del producto está vacío o undefined');
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


      initConfigControls();


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



function generarVistaPrevia(producto) {
  if (!producto || !producto.nombre) {
    console.error('El producto no tiene nombre o es undefined:', producto);
  }

  const preview = document.getElementById('vinetaPreview');
  preview.innerHTML = '';

  const vinetaContainer = document.createElement('div');
  vinetaContainer.className = 'vineta-container with-guides';


  vinetaContainer.style.width = `${vinetaConfig.vinetaWidth * 3}px`;
  vinetaContainer.style.height = `${vinetaConfig.vinetaHeight * 3}px`;
  vinetaContainer.style.padding = `${vinetaConfig.marginTop * 3}px ${vinetaConfig.marginRight * 3}px ${vinetaConfig.marginBottom * 3}px ${vinetaConfig.marginLeft * 3}px`;
  vinetaContainer.style.boxSizing = 'border-box';
  vinetaContainer.style.backgroundColor = 'white';
  vinetaContainer.style.border = '1px solid #ccc';
  vinetaContainer.style.display = 'flex';
  vinetaContainer.style.flexDirection = 'column';
  vinetaContainer.style.alignItems = 'center';


  const barcodeCanvas = document.createElement('canvas');
  barcodeCanvas.id = 'barcodeCanvas';
  barcodeCanvas.style.width = `${vinetaConfig.barcodeWidth}%`;
  barcodeCanvas.style.height = `${vinetaConfig.barcodeHeight}px`;
  barcodeCanvas.style.marginBottom = '5px';


  const codigoInfo = document.createElement('div');
  codigoInfo.className = 'text-center';
  codigoInfo.style.fontSize = `${vinetaConfig.fontSizeCode}px`;
  codigoInfo.style.marginBottom = '8px';
  codigoInfo.textContent = producto.codigo_barras;


  const nombrePrecioContainer = document.createElement('div');
  nombrePrecioContainer.style.display = 'flex';
  nombrePrecioContainer.style.justifyContent = 'space-between';
  nombrePrecioContainer.style.alignItems = 'center';
  nombrePrecioContainer.style.width = '100%';
  nombrePrecioContainer.style.marginTop = '5px';


  const productoNombre = document.createElement('div');
  productoNombre.className = 'producto-nombre';
  productoNombre.style.fontSize = `${vinetaConfig.fontSizeName}px`;
  productoNombre.style.fontWeight = 'bold';
  productoNombre.style.textAlign = 'left';
  productoNombre.style.flex = '1';
  productoNombre.style.overflow = 'hidden';
  productoNombre.style.textOverflow = 'ellipsis';
  productoNombre.style.whiteSpace = 'nowrap';
  productoNombre.style.marginRight = '10px';

  if (producto && producto.nombre) {
    if (producto.nombre.length > 20) {
      productoNombre.textContent = producto.nombre.substring(0, 17) + '...';
      productoNombre.title = producto.nombre;
    } else {
      productoNombre.textContent = producto.nombre;
    }
  } else {
    productoNombre.textContent = 'Producto sin nombre';
    productoNombre.style.color = 'red';
  }


  const precio = document.createElement('div');
  precio.className = 'font-bold';
  precio.style.fontSize = `${vinetaConfig.fontSizePrice}px`;
  precio.style.textAlign = 'right';
  precio.style.whiteSpace = 'nowrap';
  precio.textContent = `$${parseFloat(producto.precio).toFixed(2)}`;


  nombrePrecioContainer.appendChild(productoNombre);
  nombrePrecioContainer.appendChild(precio);


  vinetaContainer.appendChild(barcodeCanvas);
  vinetaContainer.appendChild(codigoInfo);
  vinetaContainer.appendChild(nombrePrecioContainer);

  preview.appendChild(vinetaContainer);


  try {
    JsBarcode('#barcodeCanvas', producto.codigo_barras, {
      format: 'CODE128',
      width: 2,
      height: vinetaConfig.barcodeHeight,
      displayValue: false,
      margin: 5
    });
  } catch (error) {
    console.error('Error al generar código de barras:', error);
    codigoInfo.textContent = 'Error al generar código de barras: ' + error.message;
    codigoInfo.className = 'text-center text-red-500 text-xs';
  }

  preview.dataset.productoId = producto.id;

  return vinetaContainer;
}

function imprimirDirecto() {
  const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
  const productoId = document.getElementById('vinetaPreview').dataset.productoId;

  try {
    window.api.getProducto(parseInt(productoId))
      .then(response => {
        if (!response.success) {
          console.error('Error al obtener datos del producto para impresión:', response.error);
          mostrarMensaje('Error al obtener datos del producto', 'error');
          return;
        }

        const producto = response.data;

        // Crear un container de impresión temporal oculto
        const printContainer = document.createElement('div');
        printContainer.id = 'print-container';
        printContainer.style.position = 'fixed';
        printContainer.style.top = '-9999px';
        printContainer.style.left = '-9999px';
        document.body.appendChild(printContainer);

        // Añadir estilos de impresión específicos para el tamaño de etiqueta
        const style = document.createElement('style');
        style.textContent = `
          @page {
            size: ${vinetaConfig.vinetaWidth}mm ${vinetaConfig.vinetaHeight}mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: ${vinetaConfig.vinetaWidth}mm !important;
              height: ${vinetaConfig.vinetaHeight}mm !important;
            }
            .vineta-print {
              width: ${vinetaConfig.vinetaWidth}mm !important;
              height: ${vinetaConfig.vinetaHeight}mm !important;
              padding: ${vinetaConfig.marginTop}mm ${vinetaConfig.marginRight}mm ${vinetaConfig.marginBottom}mm ${vinetaConfig.marginLeft}mm !important;
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
        printContainer.appendChild(style);

        // Obtener la imagen del código de barras
        const canvas = document.getElementById('barcodeCanvas');
        const barcodeImage = canvas.toDataURL('image/png');

        // Generar el HTML para cada viñeta (una por página)
        for (let i = 0; i < cantidad; i++) {
          const pageContainer = document.createElement('div');
          pageContainer.style.pageBreakAfter = 'always';
          
          const vineta = document.createElement('div');
          vineta.className = 'vineta-print';

          // Truncar nombre si es necesario
          let nombreMostrado = producto.nombre || 'Producto sin nombre';
          if (nombreMostrado.length > 20) {
            nombreMostrado = nombreMostrado.substring(0, 17) + '...';
          }

          vineta.innerHTML = `
            <img src="${barcodeImage}" alt="Código de barras" class="barcode">
            <div class="codigo">${producto.codigo_barras}</div>
            <div class="nombre-precio-container">
              <div class="nombre">${nombreMostrado}</div>
              <div class="precio">$${parseFloat(producto.precio).toFixed(2)}</div>
            </div>
          `;

          pageContainer.appendChild(vineta);
          printContainer.appendChild(pageContainer);
        }

        // Configurar callback para cuando termine la impresión
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

        // Definir opciones de impresión con tamaño personalizado
        const printOptions = {
          // Tamaño en micrones (1mm = 1000 micrones)
          pageSize: {
            width: vinetaConfig.vinetaWidth * 1000, // Convertir a micrones
            height: vinetaConfig.vinetaHeight * 1000, // Convertir a micrones
            microns: true
          },
          margins: {
            marginType: 'none',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          },
          printBackground: true,
          scaleFactor: 100
        };

        // Iniciar la impresión con las opciones personalizadas
        setTimeout(async () => {
          try {
            const printResult = await window.api.printVineta(printContainer.innerHTML, printOptions);

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
      })
      .catch(error => {
        console.error('Exception general en imprimirDirecto:', error);
        mostrarMensaje('Error al preparar la impresión: ' + error.message, 'error');
      });
  } catch (error) {
    console.error('Exception general en imprimirDirecto:', error);
    mostrarMensaje('Error al preparar la impresión: ' + error.message, 'error');
  }
}

function generarPDF() {
  const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
  const productoId = document.getElementById('vinetaPreview').dataset.productoId;

  try {
    window.api.getProducto(parseInt(productoId))
      .then(response => {
        if (!response.success) {
          console.error('Error al obtener datos del producto para PDF:', response.error);
          mostrarMensaje('Error al obtener datos del producto', 'error');
          return;
        }

        const producto = response.data;

        // Dimensiones exactas de la etiqueta en milímetros
        const etiquetaWidth = vinetaConfig.vinetaWidth; // 100mm
        const etiquetaHeight = vinetaConfig.vinetaHeight; // 65mm

        // Crear un PDF con el tamaño exacto de la etiqueta
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
          orientation: 'landscape', // Asegurando que el ancho sea 100 y alto 65
          unit: 'mm',
          format: [etiquetaWidth, etiquetaHeight], // Tamaño exacto de la etiqueta
          hotfixes: ['px_scaling']  // Para mejor escalado de imágenes
        });

        // Generar una etiqueta por página
        for (let i = 0; i < cantidad; i++) {
          if (i > 0) {
            // Añadir nueva página para cada etiqueta
            doc.addPage([etiquetaWidth, etiquetaHeight], 'landscape');
          }

          // Obtener el código de barras como imagen
          const canvas = document.getElementById('barcodeCanvas');
          const imgData = canvas.toDataURL('image/png');

          // Calcular dimensiones proporcionales
          const margenH = vinetaConfig.marginLeft;
          const margenV = vinetaConfig.marginTop;
          const anchoEfectivo = etiquetaWidth - (vinetaConfig.marginLeft + vinetaConfig.marginRight);
          const altoEfectivo = etiquetaHeight - (vinetaConfig.marginTop + vinetaConfig.marginBottom);
          
          // Centrar el código de barras
          const barWidth = anchoEfectivo * (vinetaConfig.barcodeWidth / 100);
          const barHeight = vinetaConfig.barcodeHeight / 3;
          const barX = margenH + (anchoEfectivo - barWidth) / 2;
          const barY = margenV;

          // Añadir código de barras
          doc.addImage(imgData, 'PNG', barX, barY, barWidth, barHeight);

          // Añadir código de barras como texto
          doc.setFontSize(vinetaConfig.fontSizeCode / 2.5);
          doc.setFont(undefined, 'normal');
          doc.text(producto.codigo_barras, etiquetaWidth / 2, barY + barHeight + 5, { align: 'center' });

          // Calcular posición del nombre y precio
          const textoY = barY + barHeight + 12;

          // Preparar nombre (recortar si es muy largo)
          const nombreProducto = producto.nombre || 'Producto sin nombre';
          let nombreMostrado = nombreProducto;
          if (nombreMostrado.length > 20) {
            nombreMostrado = nombreMostrado.substring(0, 17) + '...';
          }

          // Añadir nombre y precio
          doc.setFontSize(vinetaConfig.fontSizeName / 2.5);
          doc.setFont(undefined, 'bold');
          doc.text(nombreMostrado, margenH, textoY);

          // Precio
          const precioTexto = `$${parseFloat(producto.precio).toFixed(2)}`;
          doc.setFontSize(vinetaConfig.fontSizePrice / 2.5);
          
          // Calcular ancho del precio para ubicarlo a la derecha
          const anchoPrecio = doc.getTextWidth(precioTexto);
          const precioX = etiquetaWidth - margenH - anchoPrecio;
          doc.text(precioTexto, precioX, textoY);
        }

        // Convertir a base64 para guardar
        const pdfData = doc.output('datauristring');
        const base64Data = pdfData.split(',')[1];

        // Guardar el PDF con el tamaño personalizado
        window.api.savePDF(base64Data)
          .then(saveResult => {
            if (saveResult.success) {
              mostrarMensaje(`PDF guardado en: ${saveResult.filePath}`, 'success');
              cerrarVinetaModal();
            } else {
              console.error('Error al guardar PDF:', saveResult.error);
              mostrarMensaje('Error al guardar el PDF: ' + saveResult.error, 'error');
            }
          })
          .catch(error => {
            console.error('Error al guardar PDF:', error);
            mostrarMensaje('Error al guardar el PDF: ' + error.message, 'error');
          });
      })
      .catch(error => {
        console.error('Exception en generarPDF:', error);
        mostrarMensaje('Error al generar PDF: ' + error.message, 'error');
      });
  } catch (error) {
    console.error('Exception en generarPDF:', error);
    mostrarMensaje('Error al generar PDF: ' + error.message, 'error');
  }
}

function initConfigTabs() {
  const tabButtons = document.querySelectorAll('[data-tab]');


  tabButtons.forEach(button => {
    button.addEventListener('click', function () {

      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.add('hidden');
      });


      document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.classList.remove('active', 'border-blue-500');
        btn.classList.add('border-transparent');
      });


      const panelId = this.getAttribute('data-tab');
      document.getElementById(panelId).classList.remove('hidden');


      this.classList.add('active', 'border-blue-500');
      this.classList.remove('border-transparent');
    });
  });
}


async function mostrarModalVineta(id) {
  try {

    const response = await window.api.getProducto(id);

    if (response.success) {
      const producto = response.data;


      if (!producto.nombre) {
        console.error('⚠️ ALERTA: El campo nombre del producto está vacío o undefined');
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


      initConfigControls();


      initConfigTabs();


      generarVistaPrevia(producto);


      const debugBtn = document.createElement('button');
      debugBtn.id = 'showDebug';
      debugBtn.innerText = 'Debug';
      debugBtn.className = 'text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded absolute bottom-3 right-3';
      vinetaModal.querySelector('.bg-white').appendChild(debugBtn);


      setTimeout(() => {
        document.getElementById('showDebug')?.addEventListener('click', () => {
          const debugInfo = document.querySelector('#vineta-debug div');
          debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('toggleDebug')?.addEventListener('click', () => {
          document.querySelector('#vineta-debug div').style.display = 'none';
        });
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

function generarCodigoBarrasAutomatico(producto) {

  const fecha = new Date();
  const año = fecha.getFullYear().toString().slice(-2);
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');


  const fechaString = año + mes + dia;


  let hashNombre = 0;
  for (let i = 0; i < producto.nombre.length; i++) {
    hashNombre += producto.nombre.charCodeAt(i);
  }

  hashNombre = hashNombre % 10000;
  const hashString = hashNombre.toString().padStart(4, '0');


  const precioString = Math.floor(producto.precio * 100).toString().slice(-4).padStart(4, '0');


  const codigoBase = fechaString + hashString + precioString;


  let codigoFinal = calcularEAN13(codigoBase);

  return codigoFinal;
}


function calcularEAN13(codigo) {

  let codigoAjustado = codigo.padStart(12, '0').slice(-12);


  let suma = 0;
  for (let i = 0; i < 12; i++) {
    suma += parseInt(codigoAjustado.charAt(i)) * (i % 2 === 0 ? 1 : 3);
  }

  let digitoVerificacion = (10 - (suma % 10)) % 10;


  return codigoAjustado + digitoVerificacion;
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


  if (!producto.codigo_barras || producto.codigo_barras.trim() === '') {
    producto.codigo_barras = generarCodigoBarrasAutomatico(producto);
  }

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

function mostrarMensaje(mensaje, tipo = 'info') {

  const prevNotificacion = document.getElementById('notificacion-sistema');
  if (prevNotificacion) {
    prevNotificacion.remove();
  }


  const notificacion = document.createElement('div');
  notificacion.id = 'notificacion-sistema';


  let clases = 'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center ';
  let icono = '';

  switch (tipo) {
    case 'success':
      clases += 'bg-green-100 text-green-800 border-l-4 border-green-500';
      icono = '<i class="fas fa-check-circle text-green-500 mr-2 text-xl"></i>';
      break;
    case 'error':
      clases += 'bg-red-100 text-red-800 border-l-4 border-red-500';
      icono = '<i class="fas fa-exclamation-circle text-red-500 mr-2 text-xl"></i>';
      break;
    case 'warning':
      clases += 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
      icono = '<i class="fas fa-exclamation-triangle text-yellow-500 mr-2 text-xl"></i>';
      break;
    default:
      clases += 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
      icono = '<i class="fas fa-info-circle text-blue-500 mr-2 text-xl"></i>';
  }

  notificacion.className = clases;


  notificacion.innerHTML = `
    ${icono}
    <div class="flex-grow">${mensaje}</div>
    <button class="ml-4 text-gray-500 hover:text-gray-700">
      <i class="fas fa-times"></i>
    </button>
  `;


  document.body.appendChild(notificacion);


  const closeBtn = notificacion.querySelector('button');
  closeBtn.addEventListener('click', () => {
    notificacion.remove();
  });


  setTimeout(() => {
    if (document.body.contains(notificacion)) {
      notificacion.classList.add('opacity-0', 'transform', 'translate-x-full');
      notificacion.style.transition = 'all 0.5s ease-in-out';


      setTimeout(() => {
        if (document.body.contains(notificacion)) {
          notificacion.remove();
        }
      }, 500);
    }
  }, 3000);


  console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
}