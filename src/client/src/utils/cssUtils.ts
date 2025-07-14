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
            // External URL
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
    
    // 3. Thêm CSS cần thiết cho PDF
    styles.push(`
      <style>
        /* PDF-specific styles */
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Tailwind CSS CDN fallback */
        @import url('https://cdn.tailwindcss.com');
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
        'box-shadow', 'text-shadow', 'transform'
      ];
      
      importantProps.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value !== 'initial' && value !== 'none' && value !== 'auto') {
          inlineStyle += `${prop}: ${value}; `;
        }
      });
      
      if (inlineStyle) {
        el.style.cssText = inlineStyle;
      }
    });
    
    return clonedElement;
  };
  
  // Cách sử dụng trong component
  export const createPDFContent = async (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }
    
    const styles = await extractAllStyles();
    const content = element.outerHTML;
    
    return { content, styles };
  };