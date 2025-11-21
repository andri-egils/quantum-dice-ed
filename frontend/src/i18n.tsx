import React, { createContext, useContext, useState } from "react";

type Lang = "en" | "is";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    "site.title": "Quantum Randomizer",
    "tab.dice": "Dice",
    "tab.coin": "Coin",
    "tab.learn": "Learn",
    "tab.step": "Step by Step",
    "dice.title": "Quantum Dice Roll",
    "dice.choose": "Choose your dice:",
    "dice.method": "Method:",
    "dice.method.rejection": "Rejection Sampling",
    "dice.method.exact": "Exact State",
    "dice.rollOnce": "Roll Once",
  "dice.add100": "Add 100 Rolls",
    "dice.reset": "Reset",
  "histogram.title": "Cumulative Histogram",
    "dice.lastRoll": "🎲 Last Roll:",
  "dice.raw": "Raw:",
  "dice.rolling": "Rolling...",
    "dice.noRolls": "No rolls yet",
    "dice.resultPrefix": "Result:",
  "circuit.title": "Quantum Circuit",
    "circuit.failed": "Failed to load circuit",
    "circuit.placeholder": "Placeholder circuit",
    "coin.title": "Quantum Coin Flip",
    "coin.flip": "Flip Coin",
    "coin.last": "🎯 Last Flip:",
    "coin.noFlips": "No flips yet",
  },
  is: {
    "site.title": "Skammtaslembigjafi",
    "tab.dice": "Teningur",
    "tab.coin": "Króna",
    "tab.learn": "Læra",
    "tab.step": "Skref fyrir skref",
    "dice.title": "Skammta teninga kast",
    "dice.choose": "Veldu tening:",
    "dice.method": "Aðferð:",
    "dice.method.rejection": "Hafnaúrtak",
    "dice.method.exact": "Nákvæm staða",
  "dice.rollOnce": "Kasta einu sinni",
  "dice.add100": "Bæta við 100 köstum",
    "dice.reset": "Endurstilla",
  "histogram.title": "Uppsafnað Súlurit",
    "dice.lastRoll": "🎲 Síðasta kast:",
  "dice.raw": "Hrátt:",
  "dice.rolling": "Kasta...",
    "dice.noRolls": "Engin köst ennþá",
    "dice.resultPrefix": "Útkoma:",
    "circuit.failed": "Mistókst að hlaða hringrás",
    "circuit.placeholder": "Staðgengils rás",
  "circuit.title": "Skammtahringrás",
    "coin.title": "Skammta Krónukast",
    "coin.flip": "Skammtakast krónu",
    "coin.last": "🎯 Síðasta kast:",
    "coin.noFlips": "Engin köst ennþá",
  },
};

const I18nContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("en");

  const t = (key: string) => translations[lang][key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export const useTranslation = () => useContext(I18nContext);

export default I18nContext;
