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
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    
    // Tạo HTML hoàn chỉnh với styles
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${styles || ""}
          <style>
            /* Reset CSS cho PDF */
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            /* Đảm bảo background colors hiển thị */
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;

    await page.setContent(fullHTML, { waitUntil: "networkidle0" });
    
    // Đợi fonts load (nếu có)
    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
      preferCSSPageSize: false,
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