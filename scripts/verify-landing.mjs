import puppeteer from 'puppeteer-core';

const BASE = process.env.LANDING_URL || 'http://localhost:3010/';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  const results = [];

  const check = (name, ok, detail = '') => {
    results.push({ name, ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? `: ${detail}` : ''}`);
  };

  try {
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('.hero-lp__title', { timeout: 20000 });

    const title = await page.$eval('.hero-lp__title', (el) => el.textContent.trim());
    check('Hero título', title.includes('Toda a sua operação') && title.includes('Um único sistema.'), title);

    const hasPlansNav = await page.evaluate(() =>
      [...document.querySelectorAll('nav button')].some((b) => b.textContent.includes('Planos'))
    );
    check('Navbar Planos', hasPlansNav);

    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('nav button')].find((b) =>
        b.textContent.trim() === 'Planos'
      );
      btn?.click();
    });
    await sleep(1200);
    const plansVisible = await page.evaluate(() => {
      const el = document.getElementById('plans');
      const rect = el.getBoundingClientRect();
      return Boolean(el) && rect.top < window.innerHeight * 0.75 && rect.bottom > 80;
    });
    check('Scroll para Planos', plansVisible);

    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('.faq-item__btn')][1];
      if (btn) btn.click();
    });
    await sleep(200);
    const faqOpen = await page.evaluate(() => {
      const item = document.querySelectorAll('.faq-item')[1];
      return item?.getAttribute('data-open') === 'true';
    });
    check('FAQ accordion', faqOpen);

    await page.evaluate(() => {
      const btn = document.querySelector('.plans-compare-btn');
      if (btn) btn.click();
    });
    await sleep(200);
    const comparison = await page.$('#plans-comparison');
    check('Comparação de planos', Boolean(comparison));

    const wa = await page.$('.wa-float__btn');
    check('WhatsApp flutuante', Boolean(wa));

    const themeBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await page.evaluate(() => document.querySelector('.home-theme-toggle')?.click());
    await sleep(400);
    const themeAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    check('Toggle tema', themeAfter && themeAfter !== themeBefore, `${themeBefore} → ${themeAfter}`);

    await page.setViewport({ width: 390, height: 844 });
    await sleep(500);
    const menuButtonVisible = await page.evaluate(() => {
      const btn = document.querySelector('.mobile-menu-button');
      if (!btn) return false;
      const style = window.getComputedStyle(btn);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    check('Botão hamburger visível', menuButtonVisible);

    await page.evaluate(() => {
      const btn = document.querySelector('.mobile-menu-button');
      if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await sleep(500);
    const menuOpen = await page.evaluate(() =>
      document.querySelector('.nav-menu')?.classList.contains('open')
    );
    check('Menu mobile', menuOpen);

    const segmentsScroll = await page.evaluate(() => {
      const track = document.querySelector('.segments-strip__track');
      return track && track.scrollWidth > track.clientWidth;
    });
    check('Segments scroll horizontal (mobile)', segmentsScroll);

    const hasFakeStats = await page.evaluate(() =>
      /500\+|50k\+|99\.9%/.test(document.body.innerText)
    );
    check('Sem números fictícios', !hasFakeStats);

    const restaurantOnlyHero = await page.evaluate(() => {
      const hero = document.querySelector('.hero-lp__desc')?.textContent || '';
      return /gestão completa que o seu restaurante precisa/i.test(hero);
    });
    check('Copy não restaurante-only no hero', !restaurantOnlyHero);

    await page.setViewport({ width: 1440, height: 900 });
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      window.scrollTo(0, 0);
    });
    await sleep(200);
    await page.screenshot({ path: 'scripts/landing-desktop-light.png', fullPage: true });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await sleep(200);
    await page.screenshot({ path: 'scripts/landing-desktop-dark.png', fullPage: true });
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      window.scrollTo(0, 0);
    });
    await sleep(200);
    await page.screenshot({ path: 'scripts/landing-mobile-light.png', fullPage: true });
    check('Screenshots salvos', true, 'desktop light/dark + mobile');
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    console.error(`\n${failed.length} check(s) failed`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} checks passed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
