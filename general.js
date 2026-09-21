const bs58 = require('bs58');
const fs = require('fs');

const mnemonic = 'valley above inmate imitate want make script torch ketchup slender uphold region public general body blush weird deer potato vendor swing jealous board';
const clavePrivadaBase58 = 'PEGA_AQUI_TU_CLAVE_PRIVADA_BASE58';

try {
  const secretKey = Array.from(bs58.decode(clavePrivadaBase58));
  fs.writeFileSync('keypair.json', JSON.stringify(secretKey, null, 2));
  console.log('✅ ¡keypair.json generado con éxito!');
} catch (e) {
  console.error('❌ Error al procesar la clave:', e.message);
}
