// Número de WhatsApp de Ales Cakery (Reemplaza con tu número real de Perú con código 51)
const TELEFONO_WHATSAPP = "51986730375";

// Base de datos de productos para el catálogo
const productosDB = {
  "torta-personalizada-1": {
    titulo: "Torta Personalizada Temática",
    categoria: "Tortas Personalizadas",
    precio: "Desde S/ 120.00",
    imagen: "torta1.jpg",
    descripcion: "Diseñamos la torta de tus sueños para cumpleaños, aniversarios o eventos especiales. Elaboración 100% artesanal con masa elástica, buttercream o whipped cream.",
    porciones: "12 a 15 personas"
  },
  "cheesecake-frutos-rojos": {
    titulo: "Cheesecake de Frutos Rojos",
    categoria: "Cheesecakes",
    precio: "S/ 85.00",
    imagen: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop",
    descripcion: "Base crujiente de galleta de vainilla, crema suave de queso crema y mermelada artesanal de frutos rojos seleccionados.",
    porciones: "8 a 10 personas"
  },
  "tartaleta-fresa": {
    titulo: "Tartaleta Artesanal de Fresa",
    categoria: "Tartaletas",
    precio: "S/ 70.00",
    imagen: "https://images.unsplash.com/photo-1519869325930-281384150729?w=800&auto=format&fit=crop",
    descripcion: "Masa sablé de mantequilla rellena de suave crema pastelera artesanal y fresas frescas glacadas.",
    porciones: "8 personas"
  },
  "box-bocaditos-dulces": {
    titulo: "Box Mini Alfajores (25 und)",
    categoria: "Bocaditos Dulces",
    precio: "S/ 45.00",
    imagen: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop",
    descripcion: "Deliciosos mini alfajores de maicena deshaciéndose en la boca, rellenados con abundante manjar blanco casero.",
    porciones: "Caja de 25 unidades"
  },
  "torta-chocolate": {
    titulo: "Torta Fudge Chocolate",
    categoria: "Postres Enteros",
    precio: "S/ 90.00",
    imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop",
    descripcion: "Bizcocho húmedo de cacao con triple capa de fudge de chocolate artesanal.",
    porciones: "10 a 12 personas"
  },
  "box-bocaditos-salados": {
    titulo: "Mini Enrrollados de Jamón y Queso (30 und)",
    categoria: "Bocaditos Salados",
    precio: "S/ 55.00",
    imagen: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&auto=format&fit=crop",
    descripcion: "Masa hojaldrada horneada rellena con jamón de pierna y queso derretido.",
    porciones: "Caja de 30 unidades"
  }
};

let categoriaActual = 'todos';

// Filtro por botones de categorías
function filtrarCategoria(categoria, btnElement) {
  categoriaActual = categoria;

  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  if (btnElement) {
    btnElement.classList.add('active');
  }

  filtrarProductos();
}

// Lógica unificada para filtrar por texto y por categoría a la vez
function filtrarProductos() {
  const input = document.getElementById('searchInput');
  const textoBusqueda = input ? input.value.toLowerCase().trim() : '';
  const cards = document.querySelectorAll('.product-card');

  cards.forEach(card => {
    const titulo = card.querySelector('h3').textContent.toLowerCase();
    const categoriaCard = card.dataset.category;

    const coincideCategoria = (categoriaActual === 'todos' || categoriaCard === categoriaActual);
    const coincideTexto = titulo.includes(textoBusqueda);

    if (coincideCategoria && coincideTexto) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Carga los datos dinámicos en la página producto.html
function cargarDetalleProducto() {
  const params = new URLSearchParams(window.location.search);
  const idProducto = params.get('id');

  const producto = productosDB[idProducto] || productosDB["torta-personalizada-1"];

  const elTitle = document.getElementById('detailTitle');
  const elCategory = document.getElementById('detailCategory');
  const elPrice = document.getElementById('detailPrice');
  const elImg = document.getElementById('detailImg');
  const elDesc = document.getElementById('detailDescription');
  const elServings = document.getElementById('detailServings');
  const elWspBtn = document.getElementById('btnWhatsappCTA');

  if (elTitle) elTitle.textContent = producto.titulo;
  if (elCategory) elCategory.textContent = producto.categoria;
  if (elPrice) elPrice.textContent = producto.precio;
  if (elImg) elImg.src = producto.imagen;
  if (elDesc) elDesc.textContent = producto.descripcion;
  if (elServings) elServings.textContent = producto.porciones;

  // Generación de mensaje automático a WhatsApp
  const mensaje = `Hola quiero cotizar este producto: ${producto.titulo}`;
  const linkWhatsApp = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

  if (elWspBtn) elWspBtn.href = linkWhatsApp;
}