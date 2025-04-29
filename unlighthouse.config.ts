import { defineConfig } from '@unlighthouse/core'

export default defineConfig({
  site: 'https://yusufasik.com',
  puppeteerPageSetup: async (page) => {
    console.log('Starting scroll simulation...');
    // Take initial screenshot
    await page.screenshot({ path: 'before-scroll.png' });
    // Lazy load handle script
    await page.evaluate(async () => {
      console.log('[Browser Context] Scroll script started');
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100); // Scroll 100px each 100ms
      });
    });
    // Take post-scroll screenshot
    await page.screenshot({ path: 'after-scroll.png' });
    console.log('[Browser Context] Scroll completed');
  },
})
