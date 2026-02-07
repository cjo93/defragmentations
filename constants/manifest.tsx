
import React from 'react';

export const DEFRAG_MANIFEST = {
  BRAND: {
    NAME: "DEFRAG",
    TAGLINE: "Understand the mechanics of yourself and your relationships.",
  },
  LANDING: {
    HERO_TITLE: "Stop guessing why friction happens.",
    HERO_SUB: "Defrag helps you understand the natural mechanics of your personality. We simply explain how your energy works, and how it interacts with others.",
    CTA_PRIMARY: "Start Analysis",
    CTA_SECONDARY: "Methodology",
    TIERS: {
      SINGLE: { name: "Blueprint", price: "$29", desc: "A complete guide to your personal design.", ID: "price_single_1" },
      BASIC: { name: "Daily", price: "$9/mo", desc: "Daily insights on your personal weather.", ID: "price_basic_1" },
      PRO: { name: "Orbit", price: "$19/mo", desc: "Relationship dynamics for partners and families.", ID: "price_pro_1" }
    }
  },
  COMPANY: {
    ABOUT: {
      TITLE: "We are the Janitors of the Psyche.",
      MISSION: "We don't want to fix you. We just want to help you run the code you were actually designed for.",
    },
    LEGAL: {
      TOS_SUMMARY: "Defrag is a data processing tool, not a medical device.",
      PRIVACY: "Your data is encrypted. We do not sell your natal coordinates."
    }
  },
  SYSTEM_PROMPTS: {
    CORE_IDENTITY: `
      You are DEFRAG. You are a wise, grounded guide.
      1. NO METAPHORS (No "hardware/software").
      2. PLAIN ENGLISH.
      3. NO CLINICAL JARGON.
      4. GENTLE AUTHORITY.
    `,
  },
  PSYCH_TRANSLATION_LAYER: {
    CONCEPTS: {
      "ANXIETY": "intense mental pressure",
      "DEPRESSION": "need for deep rest",
      "TRAUMA_TRIGGER": "reaction from the past",
      "DISSOCIATION": "checking out",
      "COERCIVE_CONTROL": "pressure to change",
      "GROUNDING": "coming back to the room"
    },
    PROTOCOLS: {
      "EXPLAIN_FULL_CONTEXT": "If a user is confused, stop. Take a paragraph to explain the 'Why' behind the insight.",
      "VALIDATE_REALITY": "Always acknowledge the user's feeling as real before offering an explanation.",
      "UNCERTAINTY_FALLBACK": "Never guess. If unsure, ask the user to clarify.",
      "AGENCY_FIRST": "Never tell the user what to do. Offer options.",
      "NO_PATHOLOGY": "Never diagnose.",
      "VALIDATION_LOOP": "Confirm understanding before proceeding."
    }
  },
  SAFETY_PROTOCOL: {
    UNIVERSAL_TONE: "Speak with warmth and clarity. Use simple, accessible language.",
    MODES: {
      LOGIC_MODE: "Provide clear, direct analysis. Be helpful.",
      HOLDING_SPACE: "The user is under load. Slow down. Validate their feelings first.",
      CRISIS_MODE: "Stop analysis. Gently suggest seeking professional support."
    }
  }
};
