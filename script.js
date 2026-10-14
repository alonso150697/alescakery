// Configuración de conexión con Google Sheets y WhatsApp
const SHEET_URL = "https://opensheet.elk.sh/19QBT3RhdLP-EtrG3tLg0a-uE-EeQfCLmwJJWZgcD3IM/Hoja1";
const TELEFONO_WHATSAPP = "51986730375";

let productosGlobales = [];
let categoriaActual = 'todos';

// Función para quitar tildes, espacios y minúsculas
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

// 1. Cargar catálogo principal desde Google Sheets
async function obtenerProductosDesdeSheets() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  try {
    const respuesta = await fetch(SHEET_URL);
    productosGlobales = await respuesta.json();
    
    // Genera automáticamente los botones arriba según lo que hayas puesto en la columna categoria
    generarBotonesCategorias();
    renderizarProductos(productosGlobales);
    configurarBuscador();
  } catch (error) {
    console.error("Error al cargar productos desde Google Sheets:", error);
  }
}

// 2. Generar Botones de Categoría Dinámicos
function generarBotonesCategorias() {
  const categoriesContainer = document.querySelector('.categories-tab');
  if (!categoriesContainer) return;

  // Extraer categorías únicas del Excel (ignorando campos vacíos)
  const categoriasUnicas = [...new Set(productosGlobales.map(p => p.categoria).filter(Boolean))];

  // Botón "Todos" por defecto
  let botonesHTML = `<button class="tab-btn active" data-category="todos">Todos</button>`;

  categoriasUnicas.forEach(cat => {
    const catSlug = normalizarTexto(cat);
    const esEstrella = catSlug === 'tortas-personalizadas' ? 'estrella' : '';
    const icono = catSlug === 'tortas-personalizadas' ? '⭐ ' : '';

    botonesHTML += `<button class="tab-btn ${esEstrella}" data-category="${catSlug}">${icono}${cat}</button>`;
  });

  categoriesContainer.innerHTML = botonesHTML;
  configurarEventosBotones();
}

// 3. Renderizar Tarjetas de Productos
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

// 4. Filtrar Productos por Búsqueda y Categoría
function filtrarProductos() {
  const searchInput = document.getElementById('searchInput');
  const textoBusqueda = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filtrados = productosGlobales.filter(prod => {
    const catProdNorm = normalizarTexto(prod.categoria);
    const catFiltroNorm = normalizarTexto(categoriaActual);

    const coincideCategoria = catFiltroNorm === 'todos' || catProdNorm === catFiltroNorm;
    
    const tituloNorm = (prod.titulo || '').toLowerCase();
    const catNorm = (prod.categoria || '').toLowerCase();
    const coincideTexto = tituloNorm.includes(textoBusqueda) || catNorm.includes(textoBusqueda);

    return coincideCategoria && coincideTexto;
  });

  renderizarProductos(filtrados);
}

function configurarEventosBotones() {
  const botones = document.querySelectorAll('.tab-btn');
  botones.forEach(btn => {
    btn.addEventListener('click', function() {
      botones.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      categoriaActual = this.getAttribute('data-category') || 'todos';
      filtrarProductos();
    });
  });
}

function configurarBuscador() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filtrarProductos);
  }
}

// 5. Cargar Vista Detallada en producto.html (Leyendo las nuevas columnas del Excel)
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
    
    // Cargar especificidades dinámicas
    if (document.getElementById('detailServings')) {
      document.getElementById('detailServings').textContent = producto.porciones || 'Consultar';
    }
    if (document.getElementById('detailNotice')) {
      document.getElementById('detailNotice').textContent = producto.anticipacion || 'Requiere anticipación previa.';
    }
    if (document.getElementById('detailFillings')) {
      document.getElementById('detailFillings').textContent = producto.rellenos || 'Según catálogo';
    }
    if (document.getElementById('detailDelivery')) {
      document.getElementById('detailDelivery').textContent = producto.entrega || 'Delivery o recojo en taller.';
    }

    // Mensaje automático directo a WhatsApp
    const mensaje = `Hola Ales Cakery! Vi en su catálogo web la *${producto.titulo}* (${producto.precio}) y me gustaría cotizarla.`;
    const linkWhatsApp = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

    const btnWa = document.getElementById('btnWhatsappCTA');
    if (btnWa) btnWa.href = linkWhatsApp;

  } catch (error) {
    console.error("Error al cargar el detalle del producto:", error);
  }
}

// Inicializar al cargar el documento
document.addEventListener("DOMContentLoaded", () => {
  obtenerProductosDesdeSheets();
  cargarDetalleProducto();
});
