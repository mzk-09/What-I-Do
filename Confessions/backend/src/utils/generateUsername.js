const adjectives = [
  'Shadow', 'Neon', 'Ghost', 'Silent', 'Cosmic', 'Dark', 'Wild', 'Lost',
  'Broken', 'Hollow', 'Mystic', 'Rogue', 'Faded', 'Rebel', 'Void',
  'Savage', 'Cursed', 'Frozen', 'Blazing', 'Phantom',
];

const nouns = [
  'Fox', 'Wolf', 'Raven', 'Tiger', 'Hawk', 'Viper', 'Storm', 'Echo',
  'Blade', 'Phoenix', 'Specter', 'Cipher', 'Wraith', 'Pulse', 'Comet',
  'Dagger', 'Ember', 'Frost', 'Glitch', 'Nexus',
];

function generateUsername() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}${noun}${num}`;
}

module.exports = { generateUsername };
