// Configuración de conexión con Google Sheets y WhatsApp
const SHEET_URL = "https://opensheet.elk.sh/19QBT3RhdLP-EtrG3tLg0a-uE-EeQfCLmwJJWZgcD3IM/Hoja1";
const TELEFONO_WHATSAPP = "51986730375";

let productosGlobales = [];
let categoriaActual = 'todos';

// Normaliza textos (quita tildes, mayúsculas y convierte espacios a guiones)
function normalizarTexto(texto) {
  if (!texto) return '';
  return texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, '-');
}

// 1. Cargar el catálogo desde Google Sheets
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

// 2. Dibujar las tarjetas de productos
function renderizarProductos(productos) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = "";

  if (!productos || productos.length === 0) {
    grid.innerHTML = `<p class="no-results" style="grid-column: 1/-1; text-align: center; padding: 20px;">No se encontraron productos.</p>`;
    return;
  }

  productos.forEach(prod => {
    const cardHTML = `
      <a href="producto.html?id=${prod.id}" class="product-card" data-category="${prod.categoria || ''}">
        <div class="card-img">
          <img src="${prod.imagen || ''}" alt="${prod.titulo || ''}" loading="lazy">
        </div>
        <div class="card-info">
          <h3>${prod.titulo || ''}</h3>
          <p class="category-name">${prod.categoria || ''}</p>
          <p class="price-indicator">${prod.precio || ''}</p>
        </div>
      </a>
    `;
    grid.innerHTML += cardHTML;
  });
}

// 3. Función unificada de filtrado (Categoría + Buscador)
function filtrarProductos() {
  const searchInput = document.getElementById('searchInput');
  const textoBusqueda = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filtrados = productosGlobales.filter(prod => {
    const catProdNormalizada = normalizarTexto(prod.categoria);
    const catFiltroNormalizada = normalizarTexto(categoriaActual);

    const coincideCategoria = catFiltroNormalizada === 'todos' || 
                               catProdNormalizada === catFiltroNormalizada ||
                               catProdNormalizada.includes(catFiltroNormalizada);
    
    const tituloNorm = (prod.titulo || '').toLowerCase();
    const catNorm = (prod.categoria || '').toLowerCase();
    const coincideTexto = tituloNorm.includes(textoBusqueda) || catNorm.includes(textoBusqueda);

    return coincideCategoria && coincideTexto;
  });

  renderizarProductos(filtrados);
}

// 4. Configurar eventos de los botones y del buscador
function configurarBuscadorYFiltros() {
  const searchInput = document.getElementById('searchInput');

  if (searchInput) {
    searchInput.addEventListener('input', filtrarProductos);
  }

  // Detecta cualquier tipo de botón de categoría (.filter-btn, .tab-btn o dentro del contenedor)
  const botones = document.querySelectorAll('.filter-btn, .tab-btn, #categoryFilters button');

  botones.forEach(btn => {
    btn.addEventListener('click', function() {
      botones.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      let cat = this.getAttribute('data-category');
      if (!cat) {
        cat = this.textContent.trim();
      }

      categoriaActual = cat || 'todos';
      filtrarProductos();
    });
  });
}

// Compatibilidad por si el HTML llama a onclick="filtrarCategoria('...', this)"
window.filtrarCategoria = function(categoria, btnElement) {
  categoriaActual = categoria;
  const botones = document.querySelectorAll('.filter-btn, .tab-btn, #categoryFilters button');
  botones.forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  filtrarProductos();
};

window.filtrarProductos = filtrarProductos;

// 5. Cargar vista detallada en producto.html
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

    document.getElementById('detailTitle').textContent = producto.titulo || '';
    document.getElementById('detailCategory').textContent = producto.categoria || '';
    document.getElementById('detailPrice').textContent = producto.precio || '';
    document.getElementById('detailImg').src = producto.imagen || '';
    document.getElementById('detailImg').alt = producto.titulo || '';
    document.getElementById('detailDescription').textContent = producto.descripcion || '';
    document.getElementById('detailServings').textContent = producto.porciones || '';

    const mensaje = `Hola quiero cotizar este producto: ${producto.titulo}`;
    const linkWhatsApp = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

    const btnWa = document.getElementById('btnWhatsappCTA');
    if (btnWa) btnWa.href = linkWhatsApp;

  } catch (error) {
    console.error("Error al cargar el detalle del producto:", error);
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  obtenerProductosDesdeSheets();
  cargarDetalleProducto();
});
