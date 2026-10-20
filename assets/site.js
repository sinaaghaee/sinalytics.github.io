(function () {
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

    function renderSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    if (!slides.length) {
      return;
    }

    prev?.addEventListener("click", function () {
      renderSlide(index - 1);
    });

    next?.addEventListener("click", function () {
      renderSlide(index + 1);
    });

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", function () {
        renderSlide(dotIndex);
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
          renderSlide(index + 1);
        } else {
          renderSlide(index - 1);
        }
      },
      { passive: true }
    );

    renderSlide(0);
  });
})();
