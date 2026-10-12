import AOS from "aos";
import Swiper from "swiper";
import { A11y, Navigation, Pagination } from "swiper/modules";

const themeButton = document.querySelector(".theme-toggle");
const colorPreference = window.matchMedia("(prefers-color-scheme: dark)");
const themeStorageKey = "pec1-theme";
let savedTheme = null;

try {
  const storedTheme = localStorage.getItem(themeStorageKey);
  if (storedTheme === "light" || storedTheme === "dark") {
    savedTheme = storedTheme;
  }
} catch {
  // El cambio de tema sigue funcionando si el almacenamiento está bloqueado.
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  if (themeButton) {
    const isDark = theme === "dark";
    const nextMode = isDark ? "claro" : "oscuro";
    const icon = themeButton.querySelector(".theme-toggle__icon");
    icon.classList.toggle("fa-sun", isDark);
    icon.classList.toggle("fa-moon", !isDark);
    themeButton.querySelector(".theme-toggle__label").textContent = `Modo ${nextMode}`;
    themeButton.setAttribute("aria-label", `Cambiar al modo ${nextMode}`);
  }
}

applyTheme(savedTheme || (colorPreference.matches ? "dark" : "light"));

if (themeButton) {
  themeButton.hidden = false;
  themeButton.addEventListener("click", () => {
    savedTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(savedTheme);

    try {
      localStorage.setItem(themeStorageKey, savedTheme);
    } catch {
      // La elección se conserva durante esta visita aunque no se pueda guardar.
    }
  });
}

colorPreference.addEventListener("change", (event) => {
  if (!savedTheme) {
    applyTheme(event.matches ? "dark" : "light");
  }
});

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const cards = document.querySelectorAll(".character-card, .reason-card");
let animationsStarted = false;

// Los atributos se añaden con JavaScript: sin él, las tarjetas siguen visibles.
function configureAnimations() {
  cards.forEach((card) => {
    if (motionPreference.matches) {
      card.removeAttribute("data-aos");
      card.classList.remove("aos-init", "aos-animate");
    } else {
      card.setAttribute("data-aos", "fade-up");
    }
  });

  if (!motionPreference.matches && !animationsStarted) {
    AOS.init({
      duration: 750,
      offset: 64,
      once: false,
      disableMutationObserver: true,
      disable: () => motionPreference.matches,
    });
    animationsStarted = true;
  } else if (animationsStarted) {
    AOS.refreshHard();
  }
}

configureAnimations();
motionPreference.addEventListener("change", configureAnimations);

const bookCarousel = document.querySelector(".book-carousel");

if (bookCarousel) {
  const controls = bookCarousel.querySelector(".book-carousel__controls");
  const bookSlider = new Swiper(bookCarousel.querySelector(".book-carousel__viewport"), {
    modules: [Navigation, Pagination, A11y],
    slidesPerView: 1,
    spaceBetween: 20,
    speed: motionPreference.matches ? 0 : 350,
    grabCursor: true,
    watchOverflow: true,
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
    navigation: {
      prevEl: controls.querySelector(".book-carousel__button--previous"),
      nextEl: controls.querySelector(".book-carousel__button--next"),
    },
    pagination: {
      el: controls.querySelector(".book-carousel__pagination"),
      type: "fraction",
      renderFraction(currentClass, totalClass) {
        return `<span class="${currentClass}"></span> de <span class="${totalClass}"></span>`;
      },
    },
    a11y: {
      containerRole: "group",
      containerMessage: "Otras obras de Arturo Pérez-Reverte",
      containerRoleDescriptionMessage: "carrusel",
      itemRoleDescriptionMessage: "obra",
      slideLabelMessage: "Obra {{index}} de {{slidesLength}}",
      prevSlideMessage: "Ver obras anteriores",
      nextSlideMessage: "Ver obras siguientes",
      firstSlideMessage: "Estás al principio del carrusel",
      lastSlideMessage: "Estás al final del carrusel",
      wrapperLiveRegion: false,
    },
  });

  controls.hidden = false;
  motionPreference.addEventListener("change", () => {
    const speed = motionPreference.matches ? 0 : 350;
    bookSlider.params.speed = speed;
    bookSlider.originalParams.speed = speed;
  });
}
