// utils/cssUtils.ts

export const extractAllStyles = async (): Promise<string> => {
  const styles: string[] = [];
  
  // 1. Lấy tất cả inline styles
  const inlineStyles = Array.from(document.querySelectorAll('style'));
  inlineStyles.forEach(style => {
    if (style.textContent) {
      styles.push(`<style>${style.textContent}</style>`);
    }
  });
  
  // 2. Lấy tất cả external stylesheets
  const externalLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  for (const link of externalLinks) {
    const href = link.getAttribute('href');
    if (href) {
      try {
        if (href.startsWith('http') || href.startsWith('//')) {
          // External URL - keep as link for CDN resources
          styles.push(`<link rel="stylesheet" href="${href}">`);
        } else {
          // Local file - fetch content
          const response = await fetch(href);
          if (response.ok) {
            const cssContent = await response.text();
            styles.push(`<style>${cssContent}</style>`);
          }
        }
      } catch (error) {
        console.warn(`Failed to load stylesheet: ${href}`, error);
        styles.push(`<link rel="stylesheet" href="${href}">`);
      }
    }
  }
  
  // 3. Thêm CSS cần thiết cho PDF với A4 sizing
  styles.push(`
    <style>
      /* PDF-specific styles with A4 exact sizing */
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box;
      }
      
      html, body {
        width: 794px !important;
        margin: 0 !important;
        padding: 0 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.4;
        font-size: 14px;
      }
      
      /* Ensure A4 dimensions are maintained */
      #print-section {
        width: 794px !important;
        min-height: 1123px !important;
        max-width: 794px !important;
        margin: 0 !important;
        padding: 32px !important;
        box-sizing: border-box !important;
        background: white !important;
        position: relative !important;
        overflow: hidden !important;
      }
      
      .cv-content {
        width: 100% !important;
        min-height: calc(1123px - 64px) !important;
        display: flex !important;
        gap: 16px !important;
      }
      
      .cv-left-column {
        flex-shrink: 0 !important;
        min-height: 100% !important;
      }
      
      .cv-right-column {
        flex-shrink: 0 !important;
        min-height: 100% !important;
      }
      
      /* Remove any transforms or scales that might interfere */
      .drop-zone-area {
        transform: none !important;
        scale: 1 !important;
      }
      
      /* Ensure consistent text rendering */
      p, div, span, h1, h2, h3, h4, h5, h6 {
        margin: 0 0 0.5em 0;
        padding: 0;
      }
      
      /* Tailwind CSS CDN fallback */
      @import url('https://cdn.tailwindcss.com');
      
      /* Print media queries */
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        html, body {
          width: 794px !important;
          height: 1123px !important;
        }
        
        #print-section {
          width: 794px !important;
          min-height: 1123px !important;
          page-break-inside: avoid !important;
        }
      }
    </style>
  `);
  
  return styles.join('\n');
};

export const inlineStyles = (element: HTMLElement): HTMLElement => {
  const clonedElement = element.cloneNode(true) as HTMLElement;
  const allElements = [clonedElement, ...clonedElement.querySelectorAll('*')] as HTMLElement[];
  
  allElements.forEach(el => {
    const computedStyle = window.getComputedStyle(el);
    let inlineStyle = '';
    
    // Danh sách các properties quan trọng cần preserve
    const importantProps = [
      'background-color', 'background-image', 'background-size', 'background-position',
      'color', 'font-family', 'font-size', 'font-weight', 'font-style',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
      'border-radius', 'border-color', 'border-width', 'border-style',
      'display', 'position', 'top', 'right', 'bottom', 'left',
      'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
      'flex', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items',
      'grid', 'grid-template-columns', 'grid-template-rows', 'grid-gap',
      'text-align', 'text-decoration', 'text-transform',
      'line-height', 'letter-spacing', 'word-spacing',
      'overflow', 'overflow-x', 'overflow-y',
      'opacity', 'visibility', 'z-index',
      'box-shadow', 'text-shadow', 'transform',
      'flex-shrink', 'flex-grow', 'flex-basis'
    ];
    
    importantProps.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'initial' && value !== 'none' && value !== 'auto') {
        inlineStyle += `${prop}: ${value} !important; `;
      }
    });
    
    if (inlineStyle) {
      el.style.cssText = inlineStyle;
    }
  });
  
  return clonedElement;
};

// Cách sử dụng trong component - với validation kích thước
export const createPDFContent = async (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }
  
  // Validate element size before export
  const rect = element.getBoundingClientRect();
  console.log('Element dimensions:', {
    width: rect.width,
    height: rect.height,
    expectedWidth: 794,
    expectedHeight: 1123
  });
  
  const styles = await extractAllStyles();
  const content = element.outerHTML;
  
  return { content, styles };
};

// Helper function để kiểm tra kích thước A4
export const validateA4Size = (elementId: string): boolean => {
  const element = document.getElementById(elementId);
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const tolerance = 10; // pixels
  
  return Math.abs(rect.width - 794) <= tolerance && 
         rect.height >= 1123 - tolerance;
};