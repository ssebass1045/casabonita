// File: my-spa/src/layouts/PublicLayout.tsx
import React, { useEffect, useState, useContext } from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { AuthContext } from "../auth/authContext";
import AdminToolbar from "../components/AdminToolbar";

const PublicLayout = () => {
  const { user } = useContext(AuthContext);
  const [isMenuOpen, setMenuOpen] = useState(false); // Estado para el menú móvil
  const location = useLocation();

  const topOffset = user ? "56px" : "0";

  // Función para abrir/cerrar el menú
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  // Función para cerrar el menú (útil al hacer clic en un enlace)
  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    const showAllRevealElements = () => {
      document
        .querySelectorAll<HTMLElement>(".reveal")
        .forEach((element) => element.classList.add("is-visible"));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showAllRevealElements();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );

    const observeRevealElements = () => {
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(".reveal"),
      );
      if (elements.length === 0) {
        return;
      }

      for (const el of elements) {
        if (el.classList.contains("is-visible")) {
          continue;
        }

        const rect = el.getBoundingClientRect();
        const viewportHeight =
          window.innerHeight || document.documentElement.clientHeight;
        const isAlreadyInView = rect.top < viewportHeight * 0.92;

        if (isAlreadyInView) {
          el.classList.add("is-visible");
          continue;
        }

        observer.observe(el);
      }
    };

    observeRevealElements();

    const animationFrameId = window.requestAnimationFrame(
      observeRevealElements,
    );
    const fallbackTimeoutId = window.setTimeout(showAllRevealElements, 1200);
    const mutationObserver = new MutationObserver(() => {
      observeRevealElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(fallbackTimeoutId);
    };
  }, [location.pathname]);

  return (
    <>
      {user && <AdminToolbar />}

      <div className="App">
        <nav className="public-navbar" style={{ top: topOffset }}>
          {/* Contenedor principal para alinear el logo y el botón */}
          <div className="public-navbar-container">
            <HashLink
              to="/#welcome"
              className="public-navbar-brand"
              onClick={closeMenu}
            >
              Casa Bonita SPA
            </HashLink>

            {/* Botón de Hamburguesa (visible en móvil) */}
            <button className="public-menu-toggle" onClick={toggleMenu}>
              {isMenuOpen ? "Cerrar" : "Menú"}
            </button>

            {/* Agrupación de enlaces de navegación */}
            <div
              className={`public-navbar-links-group ${isMenuOpen ? "is-open" : ""}`}
            >
              <HashLink
                smooth
                to="/#about"
                className="public-navbar-link"
                onClick={closeMenu}
              >
                Conoce
              </HashLink>
              <HashLink
                smooth
                to="/#treatments"
                className="public-navbar-link"
                onClick={closeMenu}
              >
                Tratamientos
              </HashLink>
              <HashLink
                smooth
                to="/#products"
                className="public-navbar-link"
                onClick={closeMenu}
              >
                Productos
              </HashLink>
              <HashLink
                smooth
                to="/#blogs"
                className="public-navbar-link"
                onClick={closeMenu}
              >
                Blog
              </HashLink>
              <HashLink
                smooth
                to="/#employees"
                className="public-navbar-link"
                onClick={closeMenu}
              >
                Equipo
              </HashLink>
              <HashLink
                smooth
                to="/#contact"
                className="public-navbar-link"
                onClick={closeMenu}
              >
                Contacto
              </HashLink>

              {!user && (
                <RouterLink
                  to="/login"
                  className="public-navbar-link login-button"
                  onClick={closeMenu}
                >
                  Login
                </RouterLink>
              )}
            </div>
          </div>
        </nav>

        <Outlet />
      </div>
    </>
  );
};

export default PublicLayout;
