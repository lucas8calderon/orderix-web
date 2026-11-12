// Converte as capturas em WebP nos tamanhos usados pela landing.
const sharp = require(process.env.SHARP_PATH || '../../../orderix-visual/node_modules/sharp');
const path = require('path'); const fs = require('fs');
const SHOTS = path.join(__dirname, '.shots');
const ANDROID = path.join(__dirname, '../../../orderix-visual/assets/product-screenshots/app-garcom');
const DEST = path.join(__dirname, '../../src/assets/images/landing/features');
fs.mkdirSync(DEST, { recursive: true });
const jobs = [
  ['phone-menu', 'delivery-cardapio', 640], ['phone-produto', 'delivery-produto', 640], ['phone-carrinho', 'delivery-carrinho', 640], ['phone-pedido', 'delivery-acompanhamento', 640],
  ['pdv', 'salao-pdv', 1600], ['mesas', 'salao-mesas', 1600], ['comandas', 'salao-comandas', 1600],
  ['kds-0', 'cozinha-antes', 1500], ['kds-1', 'cozinha-novo', 1500], ['kds-2', 'cozinha-producao', 1500], ['phone-pedido-recebido', 'delivery-recebido', 640],
  ['dashboard', 'gestao-dashboard', 1600], ['estoque', 'gestao-estoque', 1600],
];
(async () => {
  for (const [src, name, width] of jobs) {
    const info = await sharp(path.join(SHOTS, `${src}.png`)).resize({ width }).webp({ quality: 78 }).toFile(path.join(DEST, `${name}.webp`));
    console.log(name, info.width, info.height, Math.round(info.size / 1024) + 'kb');
  }
  for (const [src, name] of [['mesas', 'garcom-mesas'], ['comandas', 'garcom-comandas'], ['pedidos', 'garcom-atendimento']]) {
    // Corta só a barra de status do aparelho (hora, bateria, notificações pessoais).
    const info = await sharp(path.join(ANDROID, `${src}.png`)).extract({ left: 0, top: 94, width: 1080, height: 2306 }).resize({ width: 640 }).webp({ quality: 78 }).toFile(path.join(DEST, `${name}.webp`));
    console.log(name, info.width, info.height, Math.round(info.size / 1024) + 'kb');
  }
  process.exit(0);
})();
