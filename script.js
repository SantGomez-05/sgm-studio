// ==========  SGM STUDIO — interacción  ==========

// Correo que recibe las propuestas
const CONTACT_EMAIL = "santgm5@hotmail.com";

// Año del footer
document.getElementById("year").textContent = new Date().getFullYear();

// Menú móvil
const toggle = document.querySelector(".nav__toggle");
const menu = document.getElementById("menu");
toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
menu.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// Animación al hacer scroll
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll(".section__title, .about__body, .service, .project, .mini, .gallery figure, .proposal, .contact__item")
  .forEach((el) => { el.classList.add("reveal"); io.observe(el); });

// Formulario de propuestas
const form = document.getElementById("proposal-form");
const status = form.querySelector(".form__status");
const submitBtn = form.querySelector("button[type=submit]");

function setStatus(msg, type) {
  status.textContent = msg;
  status.className = "form__status " + (type || "");
}

function validate() {
  let ok = true;
  form.querySelectorAll("[required]").forEach((field) => {
    const valid = field.value.trim() !== "" && field.checkValidity();
    field.classList.toggle("invalid", !valid);
    if (!valid) ok = false;
  });
  return ok;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) {
    setStatus("Revisa los campos marcados, por favor.", "err");
    return;
  }
  const data = Object.fromEntries(new FormData(form));
  if (data._honey) return; // anti-spam

  submitBtn.disabled = true;
  setStatus("Enviando…");

  try {
    // Envío sin servidor usando FormSubmit (gratis). La primera vez llegará
    // un correo de activación a CONTACT_EMAIL que debes confirmar.
    const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `Nueva propuesta SGM STUDIO — ${data.servicio}`,
        _template: "table",
        Nombre: data.nombre,
        Correo: data.email,
        Servicio: data.servicio,
        Presupuesto: data.presupuesto || "No indicado",
        Mensaje: data.mensaje,
      }),
    });
    if (!res.ok) throw new Error("Error de envío");
    form.reset();
    setStatus("¡Gracias! Recibí tu propuesta y te responderé pronto.", "ok");
  } catch (err) {
    // Alternativa: abrir el cliente de correo con el mensaje listo
    const body = `Nombre: ${data.nombre}\nCorreo: ${data.email}\nServicio: ${data.servicio}\nPresupuesto: ${data.presupuesto || "No indicado"}\n\n${data.mensaje}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Propuesta SGM STUDIO — " + data.servicio)}&body=${encodeURIComponent(body)}`;
    setStatus("Abrimos tu correo para que envíes la propuesta directamente.", "ok");
  } finally {
    submitBtn.disabled = false;
  }
});

form.querySelectorAll("[required]").forEach((f) =>
  f.addEventListener("input", () => f.classList.remove("invalid"))
);
