# Sistema de Gestión de Productos y Generación de Viñetas
Este proyecto es un sistema de escritorio desarrollado con Electron que permite la gestión completa de productos y la generación de etiquetas/viñetas con códigos de barras para su uso en entornos comerciales.

## Funcionalidades principales

- Gestión de productos: Interfaz CRUD completa para crear, leer, actualizar y eliminar productos
- Base de datos local: Almacenamiento de datos en SQLite para operación sin conexión
- Generación de viñetas: Creación de etiquetas con códigos de barras para productos
- Múltiples formatos de salida: Impresión directa y exportación a PDF
- Diseño responsivo: Interfaz de usuario moderna con TailwindCSS

## Tecnologías utilizadas

- Electron: Framework para aplicaciones de escritorio multiplataforma
- SQLite: Base de datos relacional ligera para almacenamiento local
- TailwindCSS: Framework CSS para diseño moderno y responsive
- JsBarcode: Generación de códigos de barras estándar
- jsPDF: Creación de archivos PDF para exportación de viñetas

El sistema está diseñado específicamente para pequeños comercios, permitiéndoles mantener su inventario y generar etiquetas de precio profesionales con códigos de barras estándar para mejorar la gestión de inventario y agilizar el proceso de venta.

# Cómo comenzar

## Requisitos previos

- Node.js (versión 14 o superior)
- npm o pnpm

1. Clonar el repositorio
`git clone https://github.com/usuario/sistema-vinetas.git`
cd sistema-vinetas

2. Instalar dependencias
- npm:
`npm install`

3. Iniciar la aplicación en modo desarrollo
- `npm start`
