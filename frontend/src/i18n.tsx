import React, { createContext, useContext, useState } from "react";

type Lang = "en" | "is";

const translations: Record<Lang, Record<string, string>> = {
  en: {
  "learn.card.rejection.title": "What is rejection sampling?",
  "learn.card.rejection.body": "Rejection sampling is a technique to obtain uniform outcomes from a process that naturally produces non-uniform bitstrings. We generate raw measurements from the quantum circuit and discard (\"reject\") any results that fall outside the desired range. The accepted results are uniformly distributed over the target set (e.g., 1..N for a D N die).",
  "learn.card.exact.title": "What is exact state?",
  "learn.card.exact.body": "The \"exact state\" method prepares a quantum state that directly encodes the desired uniform distribution over the allowed outcomes. Instead of rejecting results, the circuit is engineered so that every measured outcome in the target set is equally probable. This often requires tailored amplitudes and controlled operations to shape the measurement distribution precisely.",
  "learn.card.circuit.title": "How is the quantum circuit prepared?",
  "learn.card.circuit.body": "The circuit begins by initializing qubits, then applies a sequence of gates (e.g., Hadamard, controlled rotations) to create superposition and interference patterns. For rejection sampling, the circuit generates raw bitstrings which are post-processed classically. For the exact state method, gate parameters are chosen to produce a uniform distribution over valid outcomes. Finally, the qubits are measured to obtain classical results.",
  "learn.card.qr.title": "What is quantum randomness?",
  "learn.card.qr.body": "Quantum randomness arises from fundamental indeterminacy in quantum mechanics. When a quantum system is measured, outcomes are drawn according to intrinsic probability amplitudes—there is no hidden classical state that predetermines the result. In contrast, classical randomness typically comes from complex, but ultimately deterministic processes (like pseudo-random algorithms or chaotic physical phenomena). Quantum randomness is irreducible at the theory level; classical randomness is often effective unpredictability.",
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
  "coin.flipPrompt": "Flip the coin",
  "coin.flipButton": "Flip",
    "coin.last": "🎯 Last Flip:",
    "coin.noFlips": "No flips yet",
  "coin.add100": "Add 100 flips",
  "coin.reset": "Reset",
  "coin.heads": "Heads",
  "coin.tails": "Tails",
  "step.loading": "Loading...",
  "step.title": "Step-by-Step Viewer",
  "step.selectDice": "Select dice:",
  "step.sided": "sided",
  "step.initialState": "Initial state |0…0⟩",
  "step.nextButton": "Next",
  "step.prevButton": "Previous",
  "step.step": "Step",
  "step.amplitude": "Amplitude",
  "step.state": "State",
  "step.probability": "Probability",
  },
  is: {
  "learn.card.rejection.title": "Hvað Er Hafnaúrtak?",
  "learn.card.rejection.body": "Hafnaúrtak er tækni til að fá jafna dreifingu úr ferli sem gefur upphaflega ójafnar bitaraðir. Við mælum hráar niðurstöður úr skammtahringrás og höfnum (\"höfnum\") þeim sem falla utan æskilegs bils. Þær niðurstöður sem haldið er eru jafndreifðar yfir marksett (t.d. 1..N fyrir D N tening).",
  "learn.card.exact.title": "Hvað Er Nákvæm Staða?",
  "learn.card.exact.body": "Aðferðin \"nákvæm staða\" undirbýr skammtastöðu sem kóðar beint æskilega jafna dreifingu yfir leyfð útkomu. Í stað þess að hafna niðurstöðum er hringrásin hönnuð þannig að hver mæld niðurstaða í marksettinu sé jafnlíkleg. Þetta krefst oft sérsniðinna styrkleika (amplitúda) og stýrðra aðgerða til að móta mælingadreifingu nákvæmlega.",
  "learn.card.circuit.title": "Hvernig Er Skammtahringrásin Undirbúin?",
  "learn.card.circuit.body": "Hringrásin byrjar á upphafsstillingu qubita og beitir síðan röð aðgerða (t.d. Hadamard, stýrðum snúningum) til að mynda ofurstöðu og truflunarmynstur. Fyrir hafnaúrtak skilar hringrásin hráum bitastrengjum sem eru unnir síðar í klassískri vinnslu. Fyrir nákvæma stöðu eru færibreytur aðgerðanna valdar þannig að útkoman verði jafndreifð yfir gildar niðurstöður. Að lokum eru qubitarnir mældir til að fá klassísk gildi.",
  "learn.card.qr.title": "Hvað Er Skammta Slembni?",
  "learn.card.qr.body": "Skammta slembni sprettur af grundvallar óákveðni í skammtafræði. Þegar skammta kerfi er mælt eru niðurstöður dregnar samkvæmt innbyggðum líkindastyrkleikum—engin falin klassísk staða ákveður útkomuna fyrirfram. Á móti kemur klassísk slembni oft frá flóknum en í grunninn afdeterminískum ferlum (eins og sýndarslembi reikniritum eða kaótískum fyrirbærum). Skammta slembni er óafturkræf á fræðilegu stigi; klassísk slembni er oft áhrifarík ófyrirsjáanleiki.",
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
  "coin.flipPrompt": "Kasta krónu",
  "coin.flipButton": "Kasta",
    "coin.last": "🎯 Síðasta kast:",
    "coin.noFlips": "Engin köst ennþá",
  "coin.add100": "Bæta 100 köstum við",
  "coin.reset": "Endurstilla",
  "coin.heads": "fiskur",
  "coin.tails": "skjaldamerki",
  "step.loading": "Hleður...",
  "step.title": "Skref-fyrir-skref sýn",
  "step.selectDice": "Veldu tening:",
  "step.sided": "hliða",
  "step.initialState": "Upphafsstaða |0…0⟩",
  "step.nextButton": "Næsta",
  "step.prevButton": "Fyrra",
  "step.step": "Skref",
  "step.amplitude": "Sveifla",
  "step.state": "Staða",
  "step.probability": "Líkur",
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
