let context = null;
let unlocked = false;
let blocked = false;

function audioContextClass() {
  if (typeof window === 'undefined') return null;
  return window.AudioContext || window.webkitAudioContext || null;
}

/** Libera o áudio depois do primeiro gesto. Falha uma vez e não fica tentando. */
export function unlockOrderAlertSound() {
  if (blocked || unlocked) return unlocked;
  const Ctx = audioContextClass();
  if (!Ctx) {
    blocked = true;
    return false;
  }
  try {
    context = context || new Ctx();
    const pending = context.resume?.();
    if (pending && typeof pending.then === 'function') {
      pending.then(() => {
        unlocked = context.state === 'running';
      }).catch(() => {
        blocked = true;
      });
    }
    unlocked = context.state === 'running';
    return unlocked;
  } catch {
    blocked = true;
    return false;
  }
}

/** Beep curto. Sem gesto prévio, ou se o navegador recusar, devolve false e segue a tela. */
export function playNewOrderBeep() {
  if (blocked || !unlocked || !context) return false;
  try {
    const now = context.currentTime || 0;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.18);
    return true;
  } catch {
    blocked = true;
    return false;
  }
}
