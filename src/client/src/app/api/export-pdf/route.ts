import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
  const { siteUrl, selector } = await req.json();

  if (!siteUrl || !selector) {
    return NextResponse.json(
      { error: "Missing siteUrl or selector" },
      { status: 400 }
    );
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(siteUrl, { waitUntil: "networkidle0" });

  // Chỉ giữ lại nội dung trong selector
  await page.evaluate((sel) => {
    const target = document.querySelector(sel);
    if (!target) {
      throw new Error(`Selector "${sel}" not found`);
    }
    document.body.innerHTML = target.outerHTML;
  }, selector);

  // In PDF của phần được giữ lại
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="component-export.pdf"',
    },
  });
}
