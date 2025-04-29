import { defineConfig } from '@unlighthouse/core'

export default defineConfig({
  site: 'https://yusufasik.com',
  puppeteerPageSetup: async (page) => {
    // Lazy load handle script
    await page.evaluate(async () => {
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
  },
})
