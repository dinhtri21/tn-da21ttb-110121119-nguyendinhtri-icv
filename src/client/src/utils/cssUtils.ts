// utils/cssUtils.ts

export const extractAllStyles = async (): Promise<string> => {
  const styles: string[] = [];
  
  // 1. Đợi cho tất cả fonts và styles được load
  await document.fonts.ready;
  
  // 2. Lấy tất cả inline styles và computed styles
  const inlineStyles = Array.from(document.querySelectorAll('style'));
  inlineStyles.forEach(style => {
    if (style.textContent) {
      styles.push(`<style>${style.textContent}</style>`);
    }
  });
  
  // 3. Lấy tất cả external stylesheets và đợi chúng load xong
  const externalLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  const stylePromises = externalLinks.map(async (link) => {
    const href = link.getAttribute('href');
    if (!href) return '';
    
    try {
      if (href.startsWith('http') || href.startsWith('//')) {
        return `<link rel="stylesheet" href="${href}">`;
      }
      
      // Đợi stylesheet load xong
      const response = await fetch(href);
      if (response.ok) {
        const cssContent = await response.text();
        return `<style>${cssContent}</style>`;
      }
    } catch (error) {
      console.warn(`Failed to load stylesheet: ${href}`, error);
      return `<link rel="stylesheet" href="${href}">`;
    }
    return '';
  });

  const loadedStyles = await Promise.all(stylePromises);
  styles.push(...loadedStyles.filter(Boolean));
  
  // 4. Thêm computed styles cho các elements
  const printSection = document.getElementById('print-section');
  if (printSection) {
    const computedStyles = getComputedStylesForElements(printSection);
    styles.push(`<style>${computedStyles}</style>`);
  }
  
  // 5. Thêm CSS cần thiết cho PDF với A4 sizing
  styles.push(`
    <style>
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

      /* Ẩn các nút điều khiển */
      .cv-block-controls,
      .cv-block-delete,
      .cv-block-drag {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }

      /* Đảm bảo nội dung block vẫn hiển thị */
      .cv-block-container,
      .cv-block-content {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        background: white !important;
      }

      /* Ẩn border của input và textarea khi in */
      .cv-input {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        background: white !important;
      }
      
      .drop-zone-area {
        transform: none !important;
        scale: 1 !important;
      }
      
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        /* Ẩn các elements điều khiển khi in */
        .cv-block-controls,
        .cv-block-delete,
        .cv-block-drag,
        .print\\:hidden,
        .group-hover\\:opacity-100 {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }

        /* Đảm bảo hiển thị nội dung block */
        .cv-block-container,
        .cv-block-content {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          background: white !important;
          page-break-inside: avoid !important;
        }

        /* Đảm bảo hiển thị nội dung input và textarea */
        .cv-input {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          border: transparent !important;
          outline: transparent !important;
          box-shadow: none !important;
          background: white !important;
        }

        *:hover {
          background: initial !important;
          color: initial !important;
          border-color: initial !important;
          box-shadow: none !important;
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

// Helper function để lấy computed styles cho tất cả elements
const getComputedStylesForElements = (rootElement: HTMLElement): string => {
  const elements = [rootElement, ...Array.from(rootElement.querySelectorAll('*'))] as HTMLElement[];
  const styles: string[] = [];
  
  elements.forEach((el, index) => {
    const computedStyle = window.getComputedStyle(el);
    const className = `pdf-element-${index}`;
    el.classList.add(className);
    
    const importantProps = [
      'background-color', 'color', 'font-family', 'font-size', 'font-weight',
      'margin', 'padding', 'border', 'display', 'position', 'width', 'height',
      'flex', 'grid', 'text-align', 'line-height', 'opacity', 'visibility',
      'transform', 'transition', 'box-shadow', 'border-radius'
    ];
    
    const rules = importantProps
      .map(prop => {
        const value = computedStyle.getPropertyValue(prop);
        return value ? `${prop}: ${value} !important;` : '';
      })
      .filter(Boolean)
      .join(' ');
    
    if (rules) {
      styles.push(`.${className} { ${rules} }`);
    }
  });
  
  return styles.join('\n');
};