import './style.css';
import { init3D, transitionToCore } from './scene3D.js';
import { gsap } from 'gsap';

// Project Database
const projectsData = {
  "1": {
    title: "Cropwise: AI Farmer Voice Assistant",
    tag: "REACT NATIVE / FASTAPI / WHISPER",
    desc: "Cropwise is a multilingual AI-powered assistant designed for farmers. It enables speech-based interactions to query crop cycles, request real-time weather alerts, and retrieve agricultural tips, helping farmers make informed decisions.",
    specs: [
      "STACK: React Native, FastAPI, OpenAI Whisper, Maps API",
      "INTEGRATION: OpenWeatherMap, NewsAPI, Whisper Speech-to-Text",
      "VOICE: Natural text-to-speech feedbacks in multiple local languages",
      "TIMELINE: Aug 2025 - Oct 2025"
    ],
    link: "https://github.com/ArvinJoelV"
  },
  "2": {
    title: "Aquanexus: Smart Fishing Spot Forecast",
    tag: "PYTHON / REACT.JS / GPS API",
    desc: "Aquanexus is a predictive spatial mapping tool built to forecast optimal fishing zones. It supports responsible and sustainable fishing practices by identifying fish availability trends from large environmental and spatial coordinates datasets.",
    specs: [
      "STACK: Python, React.js, GPS API, Marine Datasets",
      "ANALYSIS: Advanced spatial and environmental data parsing techniques",
      "IMPACT: Improved fishing catch consistency and sustainability indicators",
      "TIMELINE: Feb 2024 - Apr 2024"
    ],
    link: "https://github.com/ArvinJoelV"
  },
  "3": {
    title: "Routivity: Smart Road Trip Planner",
    tag: "REACT NATIVE / PYTHON / SOCIAL APIs",
    desc: "Routivity is a smart mobile trip planner that generates custom itineraries based on user travel profiles, specific destinations, and preferred dining schedules. It tracks group costs, details trip itineraries, and offers trending spot details.",
    specs: [
      "STACK: React Native, Python, Geolocation & Social APIs",
      "FEATURES: Group trip sharing, automated itinerary routing, expense logger",
      "INTEGRATION: Social media and web scraping data for local recommendations",
      "TIMELINE: Aug 2025 - Present"
    ],
    link: "https://github.com/ArvinJoelV"
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialize 3D Background
  init3D();

  // Initialize Custom Cursor
  initCustomCursor();

  // Initialize Page Scroll & HUD Sync
  initScrollSync();

  // Initialize Interactive Elements (Card Tilt, Clock, Modals, Forms)
  initInteractiveUI();
});

// Custom Cursor Dynamics
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('custom-cursor-follower');
  if (!cursor || !follower) return;

  // Track Mouse movement and update cursor position via GSAP
  window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.05,
      overwrite: 'auto'
    });
    
    gsap.to(follower, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  });

  // Attach hover states to all hover-targets
  const updateHoverState = (isHovering) => {
    if (isHovering) {
      cursor.classList.add('hovered');
      follower.classList.add('hovered');
    } else {
      cursor.classList.remove('hovered');
      follower.classList.remove('hovered');
    }
  };

  // Delegate mouse events for efficiency
  document.body.addEventListener('mouseover', (e) => {
    const target = e.target.closest('.hover-target');
    if (target) {
      updateHoverState(true);
    }
  });

  document.body.addEventListener('mouseout', (e) => {
    const target = e.target.closest('.hover-target');
    if (target) {
      updateHoverState(false);
    }
  });
}

// Synchronize Scrolling, Active Nav Links, Page Counter, and 3D Scenes
function initScrollSync() {
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');
  const currentNumEl = document.getElementById('current-section-num');
  
  // Mapping sections to 3D Cores
  // Sections: 0: Hero, 1: About, 2: Projects, 3: Experience, 4: Contact
  // Cores: 0: Sphere, 1: Torus, 2: Crystal, 3: Diamond
  const coreMapping = [0, 1, 2, 3, 3];

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -40% 0px', // Trigger when section occupies the active mid-portion
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeSection = entry.target;
        const index = Array.from(sections).indexOf(activeSection);
        
        // Prevent layout reflow races at the top of the page
        if (window.scrollY === 0 && index !== 0) {
          return;
        }
        
        // 1. Activate Section in UI (slides in/fades in)
        sections.forEach((sec) => sec.classList.remove('active'));
        activeSection.classList.add('active');

        // 2. Synchronize Nav Links
        navLinks.forEach((link, linkIndex) => {
          if (linkIndex === index) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        // 3. Update HUD Page Counter
        if (currentNumEl) {
          const numStr = String(index + 1).padStart(2, '0');
          currentNumEl.textContent = numStr;
        }

        // 4. Transition 3D geometry Core
        transitionToCore(coreMapping[index]);
      }
    });
  }, observerOptions);

  // Wrap section observation in a setTimeout to avoid layout races before CSS loads
  setTimeout(() => {
    sections.forEach((section) => observer.observe(section));
  }, 150);

  // Custom click handling for navbar links (Smooth target anchoring)
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Hero explore button click anchor
  const exploreBtn = document.querySelector('.hero-actions .btn-primary');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSec = document.querySelector('#projects');
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

// Setup Clock, Card Tilts, Modals, Forms
function initInteractiveUI() {
  // 1. Active digital HUD clock
  const updateClock = () => {
    const clockEl = document.querySelector('.hud-status .status-text');
    if (clockEl) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      clockEl.textContent = `SYS: ACTIVE | ${hours}:${mins}:${secs}`;
    }
  };
  setInterval(updateClock, 1000);
  updateClock();

  // 2. Card 3D Tilt Effect
  const tiltCards = document.querySelectorAll('.project-card, .skill-card, .timeline-item');
  
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate within element
      const y = e.clientY - rect.top;  // y coordinate within element

      // Convert coordinates to degrees of rotation (-10 to 10 deg)
      const rotateX = ((y / rect.height) - 0.5) * -12; // tilt opposite on y axis
      const rotateY = ((x / rect.width) - 0.5) * 12;

      gsap.to(card, {
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
  });

  // 3. Project Detail Modal Toggle
  const modal = document.getElementById('project-modal');
  const projectCards = document.querySelectorAll('.project-card');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCloseBg = document.getElementById('modal-close-bg');

  const openProjectModal = (projectId) => {
    const data = projectsData[projectId];
    if (!data || !modal) return;

    // Populate modal fields
    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-tag').textContent = data.tag;
    document.getElementById('modal-desc').textContent = data.desc;

    const specsContainer = document.getElementById('modal-specs');
    specsContainer.innerHTML = '';
    data.specs.forEach((spec) => {
      const li = document.createElement('li');
      li.textContent = spec;
      specsContainer.appendChild(li);
    });

    const launchLink = document.getElementById('modal-link');
    if (launchLink) {
      launchLink.href = data.link;
    }

    // Toggle Modal class
    modal.classList.add('active');
  };

  const closeProjectModal = () => {
    if (modal) {
      modal.classList.remove('active');
    }
  };

  projectCards.forEach((card) => {
    card.addEventListener('click', () => {
      const projectId = card.getAttribute('data-project');
      openProjectModal(projectId);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (modalCloseBg) modalCloseBg.addEventListener('click', closeProjectModal);

  // Close modal on escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
  });

  // 4. Contact Form Transmission Logic
  const contactForm = document.getElementById('contact-form');
  const feedbackEl = document.getElementById('form-feedback');
  const btnSubmit = document.getElementById('btn-submit');

  if (contactForm && btnSubmit && feedbackEl) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const originalBtnText = btnSubmit.innerHTML;
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<span>TRANSMITTING SIGNAL...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
      feedbackEl.className = 'form-feedback font-mono';
      feedbackEl.textContent = '';

      // Simulate API transit time
      setTimeout(() => {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalBtnText;

        // Display glowing positive confirmation
        feedbackEl.classList.add('success');
        feedbackEl.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> SIGNAL RECEIVED: TRANSMISSION ROUTED SUCCESSFULLY.`;

        // Clear input forms
        contactForm.reset();

        // Clear notification after 5 seconds
        setTimeout(() => {
          gsap.to(feedbackEl, {
            opacity: 0,
            duration: 1.0,
            onComplete: () => {
              feedbackEl.textContent = '';
              feedbackEl.style.opacity = 1;
            }
          });
        }, 5000);
      }, 1500);
    });
  }
}
