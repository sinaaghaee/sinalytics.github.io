(function () {
  const root = document.documentElement;
  const storedTheme = localStorage.getItem("theme");
  const activeTheme = storedTheme || "dark";
  root.setAttribute("data-theme", activeTheme);

  const currentPage = document.body.dataset.page;
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) {
      return;
    }
    const normalized = href.replace("./", "");
    const matchesHome = currentPage === "home" && (normalized === "index.html" || normalized === "/");
    if (normalized === currentPage + ".html" || matchesHome) {
      link.classList.add("is-active");
    }
  });

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const themeButton = document.querySelector(".theme-toggle");
  const themeIcons = {
    dark:
      '<span class="theme-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"></path></svg></span>',
    light:
      '<span class="theme-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2.5"></path><path d="M12 19.5V22"></path><path d="M4.93 4.93l1.77 1.77"></path><path d="M17.3 17.3l1.77 1.77"></path><path d="M2 12h2.5"></path><path d="M19.5 12H22"></path><path d="M4.93 19.07l1.77-1.77"></path><path d="M17.3 6.7l1.77-1.77"></path></svg></span>'
  };
  function updateThemeLabel() {
    const theme = root.getAttribute("data-theme");
    if (!themeButton) {
      return;
    }
    const nextTheme = theme === "dark" ? "light" : "dark";
    const label = nextTheme === "light" ? "Light mode" : "Dark mode";
    themeButton.innerHTML = themeIcons[nextTheme] + '<span>' + label + "</span>";
    themeButton.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }

  updateThemeLabel();

  if (themeButton) {
    themeButton.addEventListener("click", function () {
      const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", nextTheme);
      localStorage.setItem("theme", nextTheme);
      updateThemeLabel();
    });
  }

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    reveals.forEach((item) => observer.observe(item));
  } else {
    reveals.forEach((item) => item.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-dot]"));
    const prev = carousel.querySelector("[data-prev]");
    const next = carousel.querySelector("[data-next]");
    const frame = carousel.querySelector(".moment-carousel-frame");
    let index = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let transitionTimeout = null;

    function clearSlideState(slide) {
      slide.classList.remove(
        "is-active",
        "is-entering-from-right",
        "is-entering-from-left",
        "is-leaving-to-left",
        "is-leaving-to-right"
      );
    }

    function renderSlide(nextIndex, direction) {
      const normalizedIndex = (nextIndex + slides.length) % slides.length;
      const currentSlide = slides[index];
      const nextSlide = slides[normalizedIndex];

      if (!slides.length) {
        return;
      }

      if (transitionTimeout) {
        window.clearTimeout(transitionTimeout);
        transitionTimeout = null;
      }

      if (!currentSlide || currentSlide === nextSlide) {
        slides.forEach((slide, slideIndex) => {
          clearSlideState(slide);
          slide.classList.toggle("is-active", slideIndex === normalizedIndex);
        });
        index = normalizedIndex;
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle("is-active", dotIndex === index);
        });
        return;
      }

      slides.forEach((slide) => {
        slide.classList.remove(
          "is-entering-from-right",
          "is-entering-from-left",
          "is-leaving-to-left",
          "is-leaving-to-right"
        );
      });

      const enteringClass = direction < 0 ? "is-entering-from-left" : "is-entering-from-right";
      const leavingClass = direction < 0 ? "is-leaving-to-right" : "is-leaving-to-left";

      nextSlide.classList.add("is-active", enteringClass);
      currentSlide.classList.add(leavingClass);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          nextSlide.classList.remove(enteringClass);
        });
      });

      transitionTimeout = window.setTimeout(() => {
        clearSlideState(currentSlide);
        nextSlide.classList.remove(
          "is-entering-from-right",
          "is-entering-from-left",
          "is-leaving-to-left",
          "is-leaving-to-right"
        );
        nextSlide.classList.add("is-active");
        transitionTimeout = null;
      }, 420);

      index = normalizedIndex;
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    if (!slides.length) {
      return;
    }

    prev?.addEventListener("click", function () {
      renderSlide(index - 1, -1);
    });

    next?.addEventListener("click", function () {
      renderSlide(index + 1, 1);
    });

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", function () {
        const direction = dotIndex < index ? -1 : 1;
        renderSlide(dotIndex, direction);
      });
    });

    frame?.addEventListener(
      "touchstart",
      function (event) {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      },
      { passive: true }
    );

    frame?.addEventListener(
      "touchend",
      function (event) {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        if (Math.abs(deltaX) < 40 || Math.abs(deltaX) <= Math.abs(deltaY)) {
          return;
        }

        if (deltaX < 0) {
          renderSlide(index + 1, 1);
        } else {
          renderSlide(index - 1, -1);
        }
      },
      { passive: true }
    );

    renderSlide(0, 1);
  });
})();
