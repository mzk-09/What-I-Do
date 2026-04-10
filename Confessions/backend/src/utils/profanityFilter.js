const BANNED_WORDS = [
  'fuck', 'shit', 'asshole', 'bitch', 'cunt', 'damn', 'bastard',
  'dick', 'pussy', 'cock', 'piss', 'slut', 'whore', 'nigger', 'faggot',
];

function containsProfanity(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((word) => lower.includes(word));
}

module.exports = { containsProfanity };
