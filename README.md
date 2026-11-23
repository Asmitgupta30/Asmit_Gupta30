# Asmit Gupta — Personal Academic Website

Personal academic and portfolio website for **Asmit Gupta** (Final-Year BS-MS Dual Degree, IISER Kolkata & MS Thesis at NISER).

Designed with a warm basalt, chondrite ochre, and deep space obsidian aesthetic, featuring an interactive Keplerian accretion disk and star-planet magnetic interaction simulation.

---

## 🌟 Key Features & Sections

- **Interactive Keplerian Disk & Star-Planet Interaction Simulation (`#field`)**:
  - Central host star with limb darkening and coronal magnetic prominence loops.
  - Protoplanetary accretion disk governed by Keplerian shear ($\Omega(r) \propto r^{-1.5}$) with an annular gap carved out by rocky exoplanet GJ 486b.
  - Dynamic star-planet magnetic interaction (Alfvén wings / flux tube) with streaming plasma packets and auroral footprints.
  - 60fps vanilla Canvas 2D simulation with smooth cursor parallax and automatic viewport observer pausing.
- **Top-Left Name & Signature Tagline**:
  - Left-aligned header with revived tagline: *“From Questionable Astrophysics to Quartzarenites?”*.
- **Profile & Voice**:
  - Authentic student voice: Geology major studying stellar chemistry and rocky planetary mantles, cooking in room, basketball court, and unreviewed mirror rhythm practice.
- **Research Experience (All appointments as Researcher)**:
  - **NISER Bhubaneswar** (July 2025 – Present): *Researcher · Exoplanets & Planetary Formation Group* — Planet formation and accretion dynamics in protoplanetary disks, high-pressure mantle mineralogy, and devolatilization modeling.
  - **PRL Mt. Abu Observatory** (May 2025 – Nov 2025): *Researcher · Astronomy & Astrophysics Division* — Multiwavelength blazar optical variability at 2.5m telescope, automated FITS photometry pipeline.
  - **TIFR Mumbai** (May 2024 – Aug 2024): *Researcher · Department of Astronomy & Astrophysics* — SDSS-IV eBOSS 2-point correlation functions (2pcf) and dark matter halo mass functions.
  - **IISc Bengaluru** (June 2024 – July 2024): *Researcher · Centre for High Energy Physics (C.H.E.P.)* — D-muon spectrum analysis with CERN ROOT.
- **Academic Writing (Tasteful Single Paper Link Placement)**:
  - **Accepted Refereed Article**: *Stellar Abundances as Probes of Rocky Exoplanet Interiors: The Mantle Composition and Mineralogy of GJ 486b*, The Astrophysical Journal (ApJ), Accepted 2026, [DOI: 10.3847/1538-4357/ae9ba8](https://doi.org/10.3847/1538-4357/ae9ba8).
  - Working manuscripts under review and preparation (*Chemical Imprint of Accretion*, *Self-Consistent ML Framework*, *Interior-Outgassing Link*).
  - Selected talks and colloquia (Earth Club, ICTS Bengaluru, MPIA Heidelberg).
- **Scientific Software & Pipelines**:
  - *Project ALFEVEN* (ML solar wind velocity forecasting).
  - *ExoHab & ExoTide* (Habitability & transit light-curve modeling).
  - *Auto-Photometry FITS Pipeline* (Aperture photometry & CCD calibration).
  - *Petrology Visualizer Suite* (Adopted for IISER Kolkata departmental coursework).
- **Fieldwork on Rhythm, Athletics & Photography**:
  - Taekwondo instructor (Self-Defense Club), basketball team (Power Forward & Shooting Guard, 2022–present), college rock band bassist, district-level cricket, 400°C fest tandoor duty.
  - Original *Un-Seeked Pleasures* photography gallery with full-screen lightbox modal.
- **Curriculum Vitae (PDF & Interactive Web)**:
  - Official PDF downloadable directly via [cv.pdf](cv.pdf).
  - Web version available at [cv.html](cv.html).

---

## 🚀 How to Host on GitHub Pages (`asmitgupta30.github.io`)

### Step 1: Commit Local Changes
Open a terminal in this directory:
```bash
git add .
git commit -m "feat: launch personal academic website"
```

### Step 2: Create a Repository on GitHub
1. Go to [GitHub New Repository](https://github.com/new).
2. Name the repository:
   ```
   asmitgupta30.github.io
   ```
   *(Set visibility to **Public**)*.

### Step 3: Link Remote and Push
```bash
git remote add origin https://github.com/Asmitgupta30/asmitgupta30.github.io.git
git push -u origin main
```

### Step 4: Verify GitHub Pages
1. In your GitHub repository, navigate to **Settings → Pages**.
2. Under **Build and deployment > Source**, select **Deploy from a branch** (Branch: `main`, folder: `/ (root)`).
3. Your website will be live in seconds at:
   ```
   https://asmitgupta30.github.io/
   ```

---

## 💻 Local Preview

```bash
# Option A: Python HTTP Server
python -m http.server 8000
# Then open: http://localhost:8000 in your browser

# Option B: Direct Browser Preview
Double-click index.html
```
