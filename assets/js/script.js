const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
const tabPanels = document.querySelectorAll(".tab-panel");
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector("#primary-nav");
const yearNode = document.querySelector("#year");
const contactForm = document.querySelector("#contact-form");
const contactStatus = document.querySelector("#contact-status");
const bottomPrev = document.querySelector("#bottom-prev");
const bottomNext = document.querySelector("#bottom-next");
const solutionsSection = document.querySelector("#solutions");
const reachoutSection = document.querySelector("#reachout");
const sectionIds = Array.from(sections).map((section) => section.id);

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

function setActiveLink(id) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setActiveSection(id) {
  const fallback = sections[0] ? sections[0].id : "home";
  const targetId = sections[0] && document.getElementById(id) ? id : fallback;

  sections.forEach((section) => {
    const isActive = section.id === targetId;
    section.hidden = !isActive;
    section.setAttribute("aria-hidden", String(!isActive));
  });

  setActiveLink(targetId);
  updateBottomNavigator(targetId);

  if (targetId === "solutions") {
    triggerSolutionsAnimation();
  } else if (solutionsSection) {
    solutionsSection.classList.remove("solutions-animate");
  }

  if (targetId === "reachout") {
    triggerReachoutAnimation();
  } else if (reachoutSection) {
    reachoutSection.classList.remove("reachout-animate");
  }
}

function triggerSolutionsAnimation() {
  if (!solutionsSection) {
    return;
  }

  solutionsSection.classList.remove("solutions-animate");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      solutionsSection.classList.add("solutions-animate");
    });
  });
}

function triggerReachoutAnimation() {
  if (!reachoutSection) {
    return;
  }

  reachoutSection.classList.remove("reachout-animate");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      reachoutSection.classList.add("reachout-animate");
    });
  });
}

const initialHash = window.location.hash.replace("#", "");
setActiveSection(initialHash || "home");

function getCurrentSectionId() {
  const visibleSection = Array.from(sections).find((section) => !section.hidden);
  return visibleSection ? visibleSection.id : (sectionIds[0] || "home");
}

function updateBottomNavigator(activeId) {
  const currentIndex = sectionIds.indexOf(activeId);
  if (bottomPrev) {
    bottomPrev.disabled = currentIndex <= 0;
  }
  if (bottomNext) {
    bottomNext.disabled = currentIndex === -1 || currentIndex >= sectionIds.length - 1;
  }
}

function navigateByStep(step) {
  const currentId = getCurrentSectionId();
  const currentIndex = sectionIds.indexOf(currentId);
  if (currentIndex === -1) {
    return;
  }

  const nextIndex = Math.max(0, Math.min(sectionIds.length - 1, currentIndex + step));
  if (nextIndex === currentIndex) {
    return;
  }

  const targetId = sectionIds[nextIndex];
  setActiveSection(targetId);
  history.replaceState(null, "", `#${targetId}`);
}

function updateCursorHighlight(panel, clientX, clientY) {
  const bounds = panel.getBoundingClientRect();
  const x = ((clientX - bounds.left) / bounds.width) * 100;
  const y = ((clientY - bounds.top) / bounds.height) * 100;
  const clampedX = Math.max(0, Math.min(100, x));
  const clampedY = Math.max(0, Math.min(100, y));
  panel.style.setProperty("--cursor-x", `${clampedX}%`);
  panel.style.setProperty("--cursor-y", `${clampedY}%`);
}

tabPanels.forEach((panel) => {
  let rafId = 0;

  panel.addEventListener("mousemove", (event) => {
    panel.classList.add("cursor-active");
    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    const { clientX, clientY } = event;
    rafId = requestAnimationFrame(() => {
      updateCursorHighlight(panel, clientX, clientY);
    });
  });

  panel.addEventListener("mouseleave", () => {
    panel.classList.remove("cursor-active");
  });
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const targetId = link.getAttribute("href").replace("#", "");
    setActiveSection(targetId);
    history.replaceState(null, "", `#${targetId}`);

    if (navMenu && navMenu.classList.contains("open")) {
      navMenu.classList.remove("open");
      if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
      }
    }
  });
});

window.addEventListener("hashchange", () => {
  const hashId = window.location.hash.replace("#", "") || "home";
  setActiveSection(hashId);
});

if (bottomPrev) {
  bottomPrev.addEventListener("click", () => navigateByStep(-1));
}

if (bottomNext) {
  bottomNext.addEventListener("click", () => navigateByStep(1));
}

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "").trim() || "Website inquiry";
    const message = String(formData.get("message") || "").trim();
    const submitButton = contactForm.querySelector("button[type='submit']");

    if (contactStatus) {
      contactStatus.textContent = "Sending...";
      contactStatus.className = "contact-status";
    }
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const response = await fetch("https://formsubmit.co/ajax/sagar.mahewar@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          _captcha: "false"
        })
      });
      const rawResult = await response.text();
      let result = null;
      try {
        result = JSON.parse(rawResult);
      } catch (parseError) {
        result = null;
      }

      if (!response.ok) {
        throw new Error(
          result && result.message
            ? result.message
            : `Request failed with status ${response.status}`
        );
      }

      if (result && (result.success === "true" || result.success === true)) {
        contactForm.reset();
        if (contactStatus) {
          contactStatus.textContent = "Message sent successfully.";
          contactStatus.className = "contact-status success";
        }
      } else {
        throw new Error(
          result && result.message
            ? result.message
            : "Form service did not confirm delivery"
        );
      }
    } catch (error) {
      if (contactStatus) {
        const message = error instanceof Error ? error.message : "";
        if (message.toLowerCase().includes("needs activation")) {
          contactStatus.textContent =
            "Activation needed: check sagar.mahewar@gmail.com inbox and click the Activate Form link once.";
        } else {
          contactStatus.textContent = "Unable to send right now. Please try again.";
        }
        contactStatus.className = "contact-status error";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
      }
    }
  });
}
