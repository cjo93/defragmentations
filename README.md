# DEFRAG_OS // System Architecture for the Psyche

&gt; **"The hardware store for the human psyche."**

![Status](https://img.shields.io/badge/SYSTEM-ONLINE-emerald?style=flat-square)
![Core](https://img.shields.io/badge/INTELLIGENCE-GEMINI_PRO-blue?style=flat-square)
![Stack](https://img.shields.io/badge/VITE-REACT_TS-white?style=flat-square)

## 01 // OVERVIEW

**Defrag** is a mechanical diagnostic tool for human psychology. It utilizes the **Google Gemini API** to synthesize **Human Design**, **Gene Keys**, **Astrology**, and **Bowen Family Systems** into a clear, logical "User Manual."

### Core Systems
* **The Engine:** Astronomical calculation of planetary positions and Human Design gates.
* **SEDA Protocol:** *Spiritual Emergence Differential Assessment*—a safety layer that detects distress.
* **Orbit:** A relational physics engine that maps friction, fusion, and flow between people.
* **Intelligence Hub:** A real-time interface to the `gemini-1.5-pro` model, acting as a "System Admin" for psychology.

---

## 02 // INSTALLATION

**Prerequisites:** Node.js v18+

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/cjo93/defragmentations.git](https://github.com/cjo93/defragmentations.git)
    cd defragmentations
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # Ensure all real-time libraries are present
    npm install @google/genai astronomy-engine lucide-react framer-motion clsx tailwind-merge
    ```

3.  **Boot System**
    ```bash
    npm run dev
    ```
    Access the console at `http://localhost:5173`

---

## 03 // CONFIGURATION (CRITICAL)

This system requires a valid **Google Gemini API Key** to function. Without it, the Intelligence Hub will not return data.

1.  Create a file named `.env` in the root directory.
2.  Add your key:

```ini
# [CRITICAL] GOOGLE GEMINI API
# Get your key here: [https://aistudio.google.com/](https://aistudio.google.com/)
VITE_GEMINI_API_KEY=AIzaSy...

# [OPTIONAL] STRIPE PAYMENTS
# Required for "Pro" tier checkouts
VITE_STRIPE_PUBLIC_KEY=pk_test...

```

---

## 04 // ARCHITECTURE

The codebase follows a strictly typed "System Architecture" pattern.

```
/src
├── /components      # UI Layer (The "Console")
│   ├── /visuals     # Canvas & SVG Engines
│   ├── /layout      # CinemaLayout & MainLayout wrappers
│   └── Dashboard.tsx
├── /services        # Logic Layer (The "Engine")
│   ├── engine.ts    # Astronomical & Human Design Math
│   ├── sedaCalculator.ts  # Safety & Risk Assessment
│   └── geminiService.ts   # REAL Google GenAI Implementation
├── /constants       # Static Truth Layer
│   └── manifest.ts  # The "Brand Bible"
└── /styles          # Tailwind CSS

```

---

## 05 // SAFETY PROTOCOLS

**Defrag is a data processing tool, not a medical device.**

* **Benevolence Filter:** The AI is strictly instructed to view "Malice" as "System Error." It never blames, judges, or diagnoses.
* **Psych Translation Layer:** Clinical terms (e.g., "Coercive Control") are translated into mechanical metaphors (e.g., "Unauthorized Admin Access").

---

*Built with precision in California.*
