import { defineConfig } from '@unlighthouse/core'

export default defineConfig({
  site: 'https://yusufasik.com',
  scanner: {
    // Increase max routes if needed
    maxRoutes: 50,
  },
  puppeteerPageSetup: async (page) => {
    // Enable console logging from browser context
    page.on('console', msg => console.log('[Browser]', msg.text()));

    console.log('[Node] Starting page analysis...');
    
    // Set viewport to desktop size
    await page.setViewport({ width: 1440, height: 900 });

    // Start network idle monitoring
    await page.evaluate(() => {
      window.__unlighthouseScrollState = {
        networkRequests: 0,
        networkIdle: false
      };
      PerformanceObserver.setResourceTimingBufferSize(500);
    });

    // Initial screenshot for debugging (disable in production)
    await page.screenshot({ path: 'unlighthouse-scroll-start.png' });

    // Main scroll handler with enhanced waiting
    await page.evaluate(async () => {
      console.log('[Browser] Starting scroll simulation');
      
      const scrollConfig = {
        distance: 100,       // pixels per scroll
        delay: 200,          // base delay after scroll (ms)
        maxWait: 3000,       // maximum wait time for network idle (ms)
        threshold: 0.1       // height threshold to consider page fully scrolled
      };

      let totalHeight = 0;
      const scrollHeight = document.body.scrollHeight;
      let lastPosition = 0;
      let unchangedCount = 0;

      while (totalHeight < scrollHeight * (1 - scrollConfig.threshold)) {
        const beforeScroll = window.scrollY;
        window.scrollBy(0, scrollConfig.distance);
        totalHeight += scrollConfig.distance;
        
        // Adaptive waiting - longer if page is still loading
        await new Promise(resolve => {
          const checkStability = async () => {
            const currentPosition = window.scrollY;
            const isStable = (currentPosition === lastPosition);
            
            lastPosition = currentPosition;
            
            if (isStable) {
              unchangedCount++;
              if (unchangedCount > 2) {
                console.log(`[Browser] Detected stable position at ${currentPosition}px`);
                return resolve();
              }
            } else {
              unchangedCount = 0;
            }

            // Base delay + extra time if network is busy
            const delay = scrollConfig.delay + 
              (window.__unlighthouseScrollState?.networkIdle ? 0 : 100);
            
            setTimeout(checkStability, delay);
          };
          
          checkStability();
        });
      }
      
      console.log(`[Browser] Reached scroll end (${totalHeight}px)`);
    });

    // Final screenshot (disable in production)
    await page.screenshot({ path: 'unlighthouse-scroll-end.png' });
    
    console.log('[Node] Page analysis completed');
  },
})
