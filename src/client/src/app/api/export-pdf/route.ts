// api/export-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
  try {
    const { content, styles } = await req.json();
    
    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor"
      ],
    });

    const page = await browser.newPage();
    
    // Set viewport để khớp với A4 (96 DPI)
    await page.setViewport({
      width: 794,  // A4 width at 96 DPI
      height: 1123, // A4 height at 96 DPI
      deviceScaleFactor: 1
    });

    // Tạo HTML hoàn chỉnh với styles được tối ưu cho A4
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=794px, initial-scale=1.0">
          ${styles || ""}
          <style>
            /* Reset CSS cho PDF */
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            html, body {
              width: 794px;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Đảm bảo container chính có kích thước A4 chính xác */
            #print-section {
              width: 794px !important;
              min-height: 1123px !important;
              max-width: 794px !important;
              margin: 0 !important;
              padding: 32px !important;
              box-sizing: border-box !important;
              page-break-inside: avoid;
              background: white !important;
            }

            /* Ẩn các elements điều khiển */
            .cv-block-controls,
            .cv-block-delete,
            .cv-block-drag,
            .print\\:hidden,
            .group-hover\\:opacity-100,
            button.absolute,
            .cursor-move,
            [class*="backdrop-blur"] {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
            }

            /* Đảm bảo nội dung block và input hiển thị */
            .cv-block-container,
            .cv-block-content,
            .cv-input {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              background: white !important;
            }
            
            /* Đảm bảo background colors hiển thị */
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Fix cho các elements có thể bị scale */
            .drop-zone-area {
              width: 794px !important;
              min-height: 1123px !important;
              transform: none !important;
              scale: 1 !important;
            }
            
            /* Đảm bảo fonts render đúng */
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }

              /* Reset tất cả các hiệu ứng hover */
              *:hover {
                background: initial !important;
                color: initial !important;
                border-color: initial !important;
                box-shadow: none !important;
              }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;

    await page.setContent(fullHTML, { 
      waitUntil: ["networkidle0", "domcontentloaded"] 
    });
    
    // Đợi fonts load và styles apply
    await page.evaluateHandle('document.fonts.ready');

    // Thêm script để xóa các elements không cần thiết trước khi tạo PDF
    await page.evaluate(() => {
      // Xóa tất cả các nút điều khiển
      const controlElements = document.querySelectorAll('.cv-block-controls, .cv-block-delete, .cv-block-drag, button.absolute, .cursor-move');
      controlElements.forEach(el => el.remove());

      // Xóa các attributes không cần thiết
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        el.removeAttribute('data-dnd-draggable');
        el.removeAttribute('draggable');
        el.removeAttribute('role');
        el.removeAttribute('tabindex');
      });
    });
    
    // Thay thế page.waitForTimeout bằng setTimeout với Promise
    await new Promise(resolve => setTimeout(resolve, 1000));

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      width: "210mm",
      height: "297mm",
      scale: 1.0,
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="cv-nguyen-van-a.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: `Lỗi khi xuất PDF: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}