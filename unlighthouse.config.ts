import { defineConfig } from '@unlighthouse/core'

export default defineConfig({
  site: 'https://yusufasik.com',
  puppeteerPageSetup: async (page) => {
    console.log('Starting lazy-load simulation...');
    // Take initial screenshot
    await page.screenshot({ path: 'before-scroll.png' });
    
    // Lazy load handle script
    await page.evaluate(async () => {
      console.log('[Browser Context] Scroll script started');
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        
        const scrollAndWait = async () => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          
          // Added delay after each scroll
          await new Promise(r => setTimeout(r, 200)); // 200ms delay
          
          if (totalHeight >= scrollHeight) {
            resolve();
          } else {
            setTimeout(scrollAndWait, 100); // Continue after delay
          }
        };
        
        scrollAndWait(); // Start the scrolling process
      });
    });
    
    // Take post-scroll screenshot
    await page.screenshot({ path: 'after-scroll.png' });
    console.log('Lazy-load simulation completed');
  },
})
