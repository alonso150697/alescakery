// Configuración de conexión con Google Sheets y WhatsApp
const SHEET_URL = "https://opensheet.elk.sh/19QBT3RhdLP-EtrG3tLg0a-uE-EeQfCLmwJJWZgcD3IM/Hoja1";
const TELEFONO_WHATSAPP = "51986730375";

let productosGlobales = [];

// 1. Cargar el catálogo en index.html desde Google Sheets
async function obtenerProductosDesdeSheets() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  try {
    const respuesta = await fetch(SHEET_URL);
    productosGlobales = await respuesta.json();
    renderizarProductos(productosGlobales);
    configurarBuscadorYFiltros();
  } catch (error) {
    console.error("Error al cargar productos desde Google Sheets:", error);
  }
}

// 2. Dibujar las tarjetas de productos en pantalla
function renderizarProductos(productos) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = "";

  if (productos.length === 0) {
    grid.innerHTML = `<p class="no-results">No se encontraron productos.</p>`;
    return;
  }

  productos.forEach(prod => {
    const cardHTML = `
      <a href="producto.html?id=${prod.id}" class="product-card" data-category="${prod.categoria}">
        <div class="card-img">
          <img src="${prod.imagen}" alt="${prod.titulo}" loading="lazy">
        </div>
        <div class="card-info">
          <h3>${prod.titulo}</h3>
          <p class="category-name">${prod.categoria}</p>
          <p class="price-indicator">${prod.precio}</p>
        </div>
      </a>
    `;
    grid.innerHTML += cardHTML;
  });
}

// 3. Filtros por categoría y buscador en tiempo real
function configurarBuscadorYFiltros() {
  const searchInput = document.getElementById('searchInput');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let categoriaActual = 'todos';

  function filtrar() {
    const textoBusqueda = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtrados = productosGlobales.filter(prod => {
      const catNormalizada = prod.categoria ? prod.categoria.toLowerCase().replace(/\s+/g, '-') : '';
      const coincideCategoria = categoriaActual === 'todos' || catNormalizada === categoriaActual;
      
      const coincideTexto = (prod.titulo && prod.titulo.toLowerCase().includes(textoBusqueda)) || 
                            (prod.categoria && prod.categoria.toLowerCase().includes(textoBusqueda));

      return coincideCategoria && coincideTexto;
    });

    renderizarProductos(filtrados);
  }

  if (searchInput) {
    searchInput.addEventListener('input', filtrar);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      categoriaActual = btn.getAttribute('data-category');
      filtrar();
    });
  });
}

// 4. Cargar la vista detallada en producto.html
async function cargarDetalleProducto() {
  const detailTitle = document.getElementById('detailTitle');
  if (!detailTitle) return;

  const params = new URLSearchParams(window.location.search);
  const idBuscado = params.get('id');

  try {
    const respuesta = await fetch(SHEET_URL);
    const productos = await respuesta.json();
    const producto = productos.find(p => p.id === idBuscado) || productos[0];

    if (!producto) return;

    document.getElementById('detailTitle').textContent = producto.titulo;
    document.getElementById('detailCategory').textContent = producto.categoria;
    document.getElementById('detailPrice').textContent = producto.precio;
    document.getElementById('detailImg').src = producto.imagen;
    document.getElementById('detailImg').alt = producto.titulo;
    document.getElementById('detailDescription').textContent = producto.descripcion;
    document.getElementById('detailServings').textContent = producto.porciones;

    // Mensaje directo para WhatsApp
    const mensaje = `Hola quiero cotizar este producto: ${producto.titulo}`;
    const linkWhatsApp = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

    document.getElementById('btnWhatsappCTA').href = linkWhatsApp;

  } catch (error) {
    console.error("Error al cargar el detalle del producto:", error);
  }
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  obtenerProductosDesdeSheets();
  cargarDetalleProducto();
});
