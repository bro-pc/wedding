const settings = {
  weddingDate: '2026-06-26T18:00:00+03:00',
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycby3vfPlznBj_vhbQsEgNjaKylVStxirLNJ26ZqAcSaUlrn8Ku6-tAamYui0BXb3uJY/exec',
  couple: 'Muhammadjon and Mehrona',
  place: 'Ресторан «Стамбул», Москва, улица Скульптора Мухиной, 11'
};

const opening = document.getElementById('opening');
const openInvite = document.getElementById('openInvite');
const musicButton = document.getElementById('musicButton');
const rsvpNote = document.getElementById('rsvpNote');
const rsvpForm = document.getElementById('rsvpForm');
const sendRsvpBtn = document.getElementById('sendRsvpBtn');
const guestName = document.getElementById('guestName');
const choices = document.querySelectorAll('.choice');
const petals = document.getElementById('petals');

let selectedAnswer = 'Я приду';
let audio = null;
let audioContext = null;
let musicTimer = null;
let musicEnabled = false;

function openPage() {
  document.body.classList.add('opened');
  opening.classList.add('hidden');
  startMusic();
  setTimeout(() => opening.remove(), 1000);
}

function createPetals() {
  const count = window.innerWidth < 640 ? 18 : 32;
  for (let i = 0; i < count; i += 1) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDuration = `${8 + Math.random() * 10}s`;
    petal.style.animationDelay = `${Math.random() * 8}s`;
    petal.style.setProperty('--drift', `${-70 + Math.random() * 140}px`);
    petal.style.opacity = `${0.35 + Math.random() * 0.55}`;
    petals.appendChild(petal);
  }
}

function revealOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.16 });

  document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
}

function updateTimer() {
  const target = new Date(settings.weddingDate).getTime();
  const now = Date.now();
  const diff = Math.max(target - now, 0);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const seconds = Math.floor(diff / 1000) % 60;

  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

function tryFileMusic() {
  audio = new Audio('music.mp3');
  audio.loop = true;
  audio.volume = 0.34;

  return audio.play().then(() => {
    musicEnabled = true;
    musicButton.classList.remove('paused');
  }).catch(() => {
    audio = null;
    startSynthMusic();
  });
}

function startSynthMusic() {
  audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
  const notes = [523.25, 659.25, 783.99, 987.77, 880, 783.99, 659.25, 587.33];
  let step = 0;
  musicEnabled = true;
  musicButton.classList.remove('paused');

  const playNote = () => {
    if (!musicEnabled || !audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.value = notes[step % notes.length];
    filter.type = 'lowpass';
    filter.frequency.value = 1600;

    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, audioContext.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 1.45);

    step += 1;
    musicTimer = setTimeout(playNote, 1120);
  };

  playNote();
}

function startMusic() {
  if (musicEnabled) return;
  tryFileMusic();
}

function stopMusic() {
  musicEnabled = false;
  musicButton.classList.add('paused');

  if (audio) {
    audio.pause();
    return;
  }

  if (musicTimer) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
}

function toggleMusic() {
  if (musicEnabled) {
    stopMusic();
  } else if (audio) {
    audio.play().then(() => {
      musicEnabled = true;
      musicButton.classList.remove('paused');
    }).catch(() => startSynthMusic());
  } else {
    startSynthMusic();
  }
}

function makeRsvpPayload() {
  const name = guestName.value.trim();
  return {
    name,
    answer: selectedAnswer,
    couple: settings.couple,
    place: settings.place,
    eventDate: '26.06.2026',
    eventTime: '18:00',
    page: window.location.href,
    createdAt: new Date().toLocaleString('ru-RU')
  };
}

function setSendingState(isSending) {
  sendRsvpBtn.disabled = isSending;
  sendRsvpBtn.textContent = isSending ? 'Отправляем...' : 'Отправить ответ';
}

async function sendRsvp(event) {
  event.preventDefault();

  const payload = makeRsvpPayload();
  if (!payload.name) {
    rsvpNote.textContent = 'Пожалуйста, напишите своё ФИО.';
    guestName.focus();
    return;
  }

  if (!settings.rsvpEndpoint) {
    rsvpNote.textContent = 'Нужно вставить ссылку Google Apps Script в rsvpEndpoint внутри script.js.';
    return;
  }

  setSendingState(true);
  rsvpNote.textContent = 'Отправляем ответ...';

  const formData = new URLSearchParams(payload);

  try {
    await fetch(settings.rsvpEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    });

    rsvpForm.reset();
    rsvpNote.textContent = 'Спасибо! Ваш ответ сохранён.';
  } catch {
    rsvpNote.textContent = 'Не получилось отправить ответ. Попробуйте ещё раз.';
  } finally {
    setSendingState(false);
  }
}

choices.forEach((choice) => {
  choice.addEventListener('click', () => {
    choices.forEach((item) => item.classList.remove('active'));
    choice.classList.add('active');
    selectedAnswer = choice.dataset.answer;
  });
});

openInvite.addEventListener('click', openPage);
musicButton.addEventListener('click', toggleMusic);
rsvpForm.addEventListener('submit', sendRsvp);

createPetals();
revealOnScroll();
updateTimer();
setInterval(updateTimer, 1000);
