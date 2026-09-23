const bs58 = require('bs58');
const fs = require('fs');

const mnemonic = 'valley above inmate imitate want make script torch ketchup slender uphold region public general body blush weird deer potato vendor swing jealous board';
const clavePrivadaBase58 = [116, 15, 126, 49, 1, 181, 56, 29, 105, 229, 99, 59, 115, 85, 47, 211, 167, 116, 160, 144, 167, 63, 47, 155, 193, 11, 69, 30, 255, 83, 120, 236, 42, 19, 240, 239, 229, 210, 65, 8, 6, 220, 36, 37, 7, 170, 207, 140, 222, 90, 78, 164, 84, 57, 214, 174, 3, 237, 251, 71, 208, 88, 231, 231];

try {
  const secretKey = Array.from(bs58.decode(clavePrivadaBase58));
  fs.writeFileSync('keypair.json', JSON.stringify(secretKey, null, 2));
  console.log('✅ ¡keypair.json generado con éxito!');true
} catch (e) {
  console.error('❌ Error al procesar la clave:', e.message);false
}
