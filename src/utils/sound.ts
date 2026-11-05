// Global UI volume level (0–100). Can be set by the Control Center slider.
let _uiVolume = 75;
export const setUiVolume = (v: number) => { _uiVolume = Math.min(100, Math.max(0, v)); };
export const getUiVolume = () => _uiVolume;

// Web Audio API Synthesizer for warm, tactile Apple-like UI sounds
export const playUiClick = (enabled: boolean = true) => {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.03);

    const vol = (_uiVolume / 100) * 0.12;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch (e) {
    // audio policy
  }
};

export const playBookSlide = (enabled: boolean = true) => {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.06);

    const vol = (_uiVolume / 100) * 0.1;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (e) {}
};

export const playKeyboardClick = (enabled: boolean = true) => {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const vol = (_uiVolume / 100);

    // 1. Crisp tactile switch click (high-frequency snap)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = "sine";
    clickOsc.frequency.setValueAtTime(2400, now);
    clickOsc.frequency.exponentialRampToValueAtTime(700, now + 0.012);
    clickGain.gain.setValueAtTime(vol * 0.18, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.014);

    // 2. Mechanical switch bottom-out thock (warm acoustic body resonance)
    const thockOsc = ctx.createOscillator();
    const thockGain = ctx.createGain();
    thockOsc.type = "triangle";
    thockOsc.frequency.setValueAtTime(280, now);
    thockOsc.frequency.exponentialRampToValueAtTime(80, now + 0.038);
    thockGain.gain.setValueAtTime(vol * 0.22, now);
    thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    thockOsc.connect(thockGain);
    thockGain.connect(ctx.destination);
    thockOsc.start(now);
    thockOsc.stop(now + 0.04);
  } catch (e) {}
};

export const playPastryPop = (enabled: boolean = true) => {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

    const vol = (_uiVolume / 100) * 0.15;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
};

export const playPlantChime = (enabled: boolean = true) => {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
      const vol = (_uiVolume / 100) * 0.08;
      gain.gain.setValueAtTime(vol, ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.25);
    });
  } catch (e) {}
};
