// =============================================
//  MAKEANDS FAMILY – App JavaScript
// =============================================

// ===== NAVEGACIÓN SPA =====
function showPage(pageId) {
  // Ocultar todas las páginas
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Mostrar la página solicitada
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    // Animar elementos al aparecer
    setTimeout(() => animateIn(target), 50);
  }

  // Actualizar nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === pageId) link.classList.add('active');
  });

  // Cerrar menú móvil
  document.getElementById('navLinks').classList.remove('open');

  // Scroll al tope
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Cargar citas guardadas si estamos en la página de cita
  if (pageId === 'cita') {
    cargarCitasGuardadas();
    initFecha();
  }
}

// Animación de entrada a elementos
function animateIn(container) {
  const elements = container.querySelectorAll('.service-card, .product-card, .gallery-item, .benefit-item, .mvv-card');
  elements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    setTimeout(() => {
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, i * 60);
  });
}

// ===== HAMBURGER MENÚ MÓVIL =====
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

// ===== NAV LINKS =====
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    if (page) showPage(page);
  });
});

// ===== FILTROS PRODUCTOS =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
      if (filter === 'all' || card.dataset.cat === filter) {
        card.style.display = 'block';
        card.style.animation = 'none';
        setTimeout(() => { card.style.animation = 'fadeInUp 0.4s ease'; }, 10);
      } else {
        card.style.display = 'none';
      }
    });

    // Mostrar/ocultar categorías
    document.querySelectorAll('.products-category').forEach(cat => {
      const catId = cat.id.replace('cat-', '');
      if (filter === 'all' || catId === filter) {
        cat.style.display = 'block';
      } else {
        cat.style.display = 'none';
      }
    });
  });
});

// ===== MODAL PRODUCTO =====
function consultarProducto(nombre) {
  document.getElementById('modal-title').textContent = nombre;
  document.getElementById('modal-consulta').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function cerrarModal() {
  document.getElementById('modal-consulta').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

// ===== CITAS - INICIALIZAR FECHA =====
function initFecha() {
  const fechaInput = document.getElementById('cita-fecha');
  if (!fechaInput) return;

  // Bloquear fechas pasadas y domingos
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  fechaInput.min = `${yyyy}-${mm}-${dd}`;

  fechaInput.addEventListener('change', () => {
    const selectedDate = new Date(fechaInput.value + 'T00:00:00');
    const day = selectedDate.getDay(); // 0 = domingo

    if (day === 0) {
      alert('Lo sentimos, no trabajamos los domingos. Por favor elige otro día.');
      fechaInput.value = '';
      return;
    }
    generarHorarios();
  });

  generarHorarios();
}

// ===== GENERAR HORARIOS =====
function generarHorarios() {
  const select = document.getElementById('cita-hora');
  select.innerHTML = '<option value="">Selecciona hora</option>';

  const now = new Date();
  const fechaInput = document.getElementById('cita-fecha');
  const selectedDate = fechaInput.value ? new Date(fechaInput.value + 'T00:00:00') : null;
  const isToday = selectedDate && selectedDate.toDateString() === now.toDateString();

  for (let h = 9; h < 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      // Si es hoy, bloquear horas pasadas (con 30 min de margen)
      if (isToday) {
        const slotTime = new Date();
        slotTime.setHours(h, m, 0, 0);
        const margin = new Date(now.getTime() + 30 * 60000);
        if (slotTime <= margin) continue;
      }

      const hStr = String(h).padStart(2, '0');
      const mStr = String(m).padStart(2, '0');
      const period = h < 12 ? 'AM' : 'PM';
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const label = `${h12}:${mStr} ${period}`;
      const value = `${hStr}:${mStr}`;

      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    }
  }
}

// ===== RESERVAR CITA =====
function reservarCita() {
  const nombre = document.getElementById('cita-nombre').value.trim();
  const cel = document.getElementById('cita-cel').value.trim();
  const email = document.getElementById('cita-email').value.trim();
  const servicio = document.getElementById('cita-servicio').value;
  const fecha = document.getElementById('cita-fecha').value;
  const hora = document.getElementById('cita-hora').value;
  const comentarios = document.getElementById('cita-comentarios').value.trim();

  // Validación
  if (!nombre) { alert('Por favor ingresa tu nombre completo.'); return; }
  if (!cel) { alert('Por favor ingresa tu número de celular.'); return; }
  if (!servicio) { alert('Por favor selecciona un servicio.'); return; }
  if (!fecha) { alert('Por favor selecciona una fecha.'); return; }
  if (!hora) { alert('Por favor selecciona una hora.'); return; }

  // Formatear fecha
  const dateObj = new Date(fecha + 'T00:00:00');
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const fechaLegible = `${diasSemana[dateObj.getDay()]} ${dateObj.getDate()} de ${meses[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  const [hh, mm] = hora.split(':');
  const h = parseInt(hh);
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const horaLegible = `${h12}:${mm} ${period}`;

  // Guardar en localStorage (nota: en Claude.ai los localStorage se manejan de forma limitada)
  try {
    const citas = JSON.parse(localStorage.getItem('makeands_citas') || '[]');
    const nuevaCita = {
      id: Date.now(),
      nombre, cel, email, servicio, fecha, hora,
      fechaLegible, horaLegible, comentarios,
      creada: new Date().toLocaleDateString('es-CO')
    };
    citas.push(nuevaCita);
    localStorage.setItem('makeands_citas', JSON.stringify(citas));
  } catch(e) {
    // localStorage no disponible — continuamos igual
  }

  // Mostrar confirmación
  const summary = document.getElementById('confirm-summary');
  summary.innerHTML = `
    <div class="confirm-row"><span>Nombre</span><span>${nombre}</span></div>
    <div class="confirm-row"><span>Celular</span><span>${cel}</span></div>
    <div class="confirm-row"><span>Servicio</span><span>${servicio}</span></div>
    <div class="confirm-row"><span>Fecha</span><span>${fechaLegible}</span></div>
    <div class="confirm-row"><span>Hora</span><span>${horaLegible}</span></div>
    ${comentarios ? `<div class="confirm-row"><span>Comentarios</span><span>${comentarios}</span></div>` : ''}
  `;

  document.getElementById('cita-form-wrap').style.display = 'none';
  document.getElementById('cita-confirm').style.display = 'block';

  // Actualizar lista de citas
  cargarCitasGuardadas();
}

// ===== NUEVA CITA =====
function nuevaCita() {
  document.getElementById('cita-form-wrap').style.display = 'block';
  document.getElementById('cita-confirm').style.display = 'none';

  // Reset formulario
  ['cita-nombre','cita-cel','cita-email','cita-comentarios'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['cita-servicio','cita-fecha','cita-hora'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  initFecha();
}

// ===== CARGAR CITAS GUARDADAS =====
function cargarCitasGuardadas() {
  try {
    const citas = JSON.parse(localStorage.getItem('makeands_citas') || '[]');
    const card = document.getElementById('mis-citas-card');
    const list = document.getElementById('mis-citas-list');

    if (citas.length > 0 && card && list) {
      card.style.display = 'block';
      list.innerHTML = '';

      // Mostrar las últimas 3 citas
      const recientes = citas.slice(-3).reverse();
      recientes.forEach(c => {
        const item = document.createElement('div');
        item.className = 'cita-saved-item';
        item.innerHTML = `
          <strong>${c.servicio}</strong>
          <span>${c.fechaLegible} – ${c.horaLegible}</span>
        `;
        list.appendChild(item);
      });
    }
  } catch(e) {
    // Sin localStorage disponible
  }
}

// ===== FORMULARIO CONTACTO =====
function enviarContacto() {
  const nombre = document.getElementById('cont-nombre').value.trim();
  const tel = document.getElementById('cont-tel').value.trim();
  const msg = document.getElementById('cont-msg').value.trim();

  if (!nombre || !msg) {
    alert('Por favor completa los campos requeridos.');
    return;
  }

  // Simular envío
  const success = document.getElementById('cont-success');
  success.style.display = 'block';

  // Limpiar campos
  document.getElementById('cont-nombre').value = '';
  document.getElementById('cont-tel').value = '';
  document.getElementById('cont-msg').value = '';

  setTimeout(() => { success.style.display = 'none'; }, 5000);
}

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 20) {
    navbar.style.background = 'rgba(13,13,13,0.98)';
  } else {
    navbar.style.background = 'rgba(13,13,13,0.95)';
  }
});

// ===== INTERSECTION OBSERVER para animaciones =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

// Observar elementos animables
document.querySelectorAll('.service-card, .benefit-item, .mvv-card, .product-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ===== CERRAR MENÚ AL HACER CLIC FUERA =====
document.addEventListener('click', (e) => {
  const nav = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
    nav.classList.remove('open');
  }
});

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  // Asegurarse de que la página de inicio esté activa
  showPage('inicio');

  // Aplicar fecha mínima al input de fecha
  const fechaInput = document.getElementById('cita-fecha');
  if (fechaInput) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    fechaInput.min = `${yyyy}-${mm}-${dd}`;
  }

  // Animar hero al cargar
  const heroTitle = document.querySelector('.hero-title');
  const heroSlogan = document.querySelector('.hero-slogan');
  const heroMeta = document.querySelector('.hero-meta');
  const heroCta = document.querySelector('.hero-cta');

  [heroTitle, heroSlogan, heroMeta, heroCta].forEach((el, i) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    setTimeout(() => {
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 200 + i * 150);
  });
});
