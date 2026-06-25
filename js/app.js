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
    initReservationForm();
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

// ===== RESERVAS POR WHATSAPP =====
const BARBER_PHONE_INTL = '573122785946';
const BOOKED_APPOINTMENTS_KEY = 'bookedAppointments';
const LOCAL_APPOINTMENTS_KEY = 'makeands_citas';

function getTodayISO() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return hoy.toISOString().split('T')[0];
}

function getAllTimeSlots() {
  const slots = [];
  for (let h = 9; h < 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

function formatTimeLabel(value) {
  const [hh, mm] = value.split(':');
  const h = parseInt(hh, 10);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
}

function getBookedAppointments() {
  try {
    const raw = localStorage.getItem(BOOKED_APPOINTMENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function getBookedForDate(date) {
  if (!date) return [];
  const booked = getBookedAppointments();
  return Array.isArray(booked[date]) ? booked[date] : [];
}

function saveBookedAppointments(booked) {
  localStorage.setItem(BOOKED_APPOINTMENTS_KEY, JSON.stringify(booked));
}

function renderAvailableTimes(date) {
  const select = document.getElementById('timeSelect');
  if (!select) return;
  select.innerHTML = '<option value="">Selecciona hora</option>';

  if (!date) {
    select.disabled = true;
    return;
  }

  const bookedForDate = getBookedForDate(date);
  const today = getTodayISO();
  const isToday = date === today;
  const now = new Date();
  const availableSlots = getAllTimeSlots().filter(slot => {
    if (bookedForDate.includes(slot)) return false;
    if (isToday) {
      const [hh, mm] = slot.split(':').map(Number);
      const slotDate = new Date();
      slotDate.setHours(hh, mm, 0, 0);
      const margin = new Date(now.getTime() + 30 * 60000);
      return slotDate > margin;
    }
    return true;
  });

  if (availableSlots.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.disabled = true;
    option.textContent = 'No hay horarios disponibles';
    select.appendChild(option);
    select.disabled = true;
    return;
  }

  availableSlots.forEach(slot => {
    const option = document.createElement('option');
    option.value = slot;
    option.textContent = formatTimeLabel(slot);
    select.appendChild(option);
  });
  select.disabled = false;
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'block';

  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7;
}

function isDateValid(date) {
  if (!date) return false;
  const selected = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today && selected.getDay() !== 0;
}

function reserveSlot(date, time) {
  const booked = getBookedAppointments();
  if (!booked[date]) booked[date] = [];
  if (booked[date].includes(time)) {
    return false;
  }
  booked[date].push(time);
  saveBookedAppointments(booked);
  return true;
}

function saveLocalAppointment(appointment) {
  try {
    const lista = JSON.parse(localStorage.getItem(LOCAL_APPOINTMENTS_KEY) || '[]');
    lista.push({ ...appointment, created: new Date().toLocaleDateString('es-CO') });
    localStorage.setItem(LOCAL_APPOINTMENTS_KEY, JSON.stringify(lista));
  } catch (e) {
    // Ignorar si localStorage no está disponible
  }
}

function openWhatsApp(appointment) {
  const text = `¡Hola MAKEANDS FAMILY! Quiero agendar una cita. Cliente: ${appointment.clientName}. Celular: ${appointment.clientPhone}. Servicio: ${appointment.serviceName} (${appointment.servicePrice}). Fecha: ${appointment.date}. Hora: ${appointment.time}.`;
  const url = `https://wa.me/${BARBER_PHONE_INTL}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function setServicePrice() {
  const serviceSelect = document.getElementById('serviceName');
  const priceInput = document.getElementById('servicePrice');
  if (!serviceSelect || !priceInput) return;
  const selected = serviceSelect.selectedOptions[0];
  const price = selected?.dataset?.price || '';
  priceInput.value = price ? `$${Number(price).toLocaleString('es-CO')} COP` : '';
}

function initReservationForm() {
  const dateInput = document.getElementById('date');
  const serviceSelect = document.getElementById('serviceName');
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  if (dateInput) {
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    dateInput.onchange = () => {
      if (!dateInput.value) {
        renderAvailableTimes('');
        return;
      }

      const selected = new Date(dateInput.value + 'T00:00:00');
      if (selected.getDay() === 0) {
        showToast('No trabajamos los domingos. Elige otra fecha.', 'error');
        dateInput.value = '';
        renderAvailableTimes('');
        return;
      }

      renderAvailableTimes(dateInput.value);
    };
  }

  if (serviceSelect) {
    serviceSelect.onchange = setServicePrice;
  }

  setServicePrice();
  renderAvailableTimes(dateInput ? dateInput.value : '');
}

function getReadableDate(fecha) {
  const dateObj = new Date(fecha + 'T00:00:00');
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return `${diasSemana[dateObj.getDay()]} ${dateObj.getDate()} de ${meses[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
}

function getReadableTime(hora) {
  const [hh, mm] = hora.split(':');
  const h = parseInt(hh, 10);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
}

function showConfirmation(appointment) {
  const summary = document.getElementById('confirm-summary');
  summary.innerHTML = `
    <div class="confirm-row"><span>Nombre</span><span>${appointment.clientName}</span></div>
    <div class="confirm-row"><span>Celular</span><span>${appointment.clientPhone}</span></div>
    <div class="confirm-row"><span>Servicio</span><span>${appointment.serviceName}</span></div>
    <div class="confirm-row"><span>Precio</span><span>${appointment.servicePrice}</span></div>
    <div class="confirm-row"><span>Fecha</span><span>${getReadableDate(appointment.date)}</span></div>
    <div class="confirm-row"><span>Hora</span><span>${getReadableTime(appointment.time)}</span></div>
    ${appointment.comments ? `<div class="confirm-row"><span>Comentarios</span><span>${appointment.comments}</span></div>` : ''}
  `;

  document.getElementById('cita-form-wrap').style.display = 'none';
  document.getElementById('cita-confirm').style.display = 'block';
}

function reservarCita() {
  const clientName = document.getElementById('clientName').value.trim();
  const clientPhone = document.getElementById('clientPhone').value.trim();
  const email = document.getElementById('cita-email').value.trim();
  const serviceName = document.getElementById('serviceName').value;
  const servicePrice = document.getElementById('servicePrice').value.trim();
  const date = document.getElementById('date').value;
  const time = document.getElementById('timeSelect').value;
  const comments = document.getElementById('cita-comentarios').value.trim();

  if (!clientName) { showToast('Por favor ingresa tu nombre completo.', 'error'); return; }
  if (!clientPhone) { showToast('Por favor ingresa tu número de celular.', 'error'); return; }
  if (!isValidPhone(clientPhone)) { showToast('El teléfono debe tener al menos 7 dígitos.', 'error'); return; }
  if (!serviceName) { showToast('Por favor selecciona un servicio.', 'error'); return; }
  if (!date) { showToast('Por favor selecciona una fecha.', 'error'); return; }
  if (!isDateValid(date)) { showToast('Selecciona una fecha válida igual o mayor a hoy.', 'error'); return; }
  if (!time) { showToast('Por favor selecciona una hora.', 'error'); renderAvailableTimes(date); return; }

  const appointment = { clientName, clientPhone, email, serviceName, servicePrice: servicePrice || '$0 COP', date, time, comments };

  if (!reserveSlot(date, time)) {
    showToast('La hora ya fue reservada. Elige otra hora.', 'error');
    renderAvailableTimes(date);
    return;
  }

  saveLocalAppointment(appointment);
  showToast('Reserva guardada localmente. Abriendo WhatsApp...', 'success');
  showConfirmation(appointment);
  openWhatsApp(appointment);
  cargarCitasGuardadas();
}

// ===== NUEVA CITA =====
function nuevaCita() {
  document.getElementById('cita-form-wrap').style.display = 'block';
  document.getElementById('cita-confirm').style.display = 'none';

  ['clientName','clientPhone','cita-email','cita-comentarios'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['serviceName','date','timeSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  setServicePrice();
  initReservationForm();
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

      const recientes = citas.slice(-3).reverse();
      recientes.forEach(c => {
        const serviceLabel = c.servicio || c.serviceName || 'Servicio';
        const fechaLabel = c.fechaLegible || getReadableDate(c.fecha || c.date || '');
        const horaLabel = c.horaLegible || getReadableTime(c.hora || c.time || '');
        const item = document.createElement('div');
        item.className = 'cita-saved-item';
        item.innerHTML = `
          <strong>${serviceLabel}</strong>
          <span>${fechaLabel} – ${horaLabel}</span>
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
  initReservationForm();

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
