import { Button, Container, Flex, Group, Select } from "@mantine/core";
import {
  IconFileCv,
  IconPhoto,
  IconWorld,
  IconDownload,
  IconPalette,
  IconInputAi,
} from "@tabler/icons-react";
import { Text } from "@mantine/core";
import MySelectCvTheme from "../Select/MySelectCvTheme";
import { useState } from "react";

export default function MyToolBar() {
  const [isExporting, setIsExporting] = useState(false);

  const getAllStyles = () => {
    // Lấy tất cả inline styles
    const inlineStyles = Array.from(document.querySelectorAll('style'))
      .map(style => style.outerHTML)
      .join('');
    
    // Lấy tất cả external stylesheets
    const externalStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map(link => {
        try {
          // Đối với external stylesheets, ta cần load nội dung
          const href = link.getAttribute('href');
          if (href && href.startsWith('http')) {
            return `<link rel="stylesheet" href="${href}">`;
          }
          return link.outerHTML;
        } catch (e) {
          return link.outerHTML;
        }
      })
      .join('');

    // Lấy computed styles cho các elements chính
    const computedStyles = getComputedStylesForElement();
    
    return `
      ${externalStyles}
      ${inlineStyles}
      <style>
        ${computedStyles}
      </style>
    `;
  };

  const getComputedStylesForElement = () => {
    const element = document.getElementById("print-section");
    if (!element) return '';
    
    // Lấy computed styles cho element chính và các children
    const allElements = [element, ...element.querySelectorAll('*')];
    const styles = [];
    
    allElements.forEach((el, index) => {
      const computedStyle = window.getComputedStyle(el);
      const className = `pdf-element-${index}`;
      el.classList.add(className);
      
      // Lấy một số properties quan trọng
      const importantProps = [
        'background-color', 'color', 'font-family', 'font-size', 'font-weight',
        'margin', 'padding', 'border', 'display', 'position', 'width', 'height',
        'flex', 'grid', 'text-align', 'line-height'
      ];
      
      const cssRules = importantProps
        .map(prop => `${prop}: ${computedStyle.getPropertyValue(prop)};`)
        .join(' ');
      
      styles.push(`.${className} { ${cssRules} }`);
    });
    
    return styles.join('\n');
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("print-section");
    
    if (!element) {
      alert("Không tìm thấy phần tử để xuất PDF");
      return;
    }

    setIsExporting(true);
    
    try {
      const content = element.outerHTML;
      const styles = getAllStyles();
      
      console.log('Exporting with styles:', styles.substring(0, 200) + '...');
      
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        body: JSON.stringify({ content, styles }),
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lỗi khi xuất PDF");
      }
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv-nguyen-van-a-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Export error:", error);
      alert(`Lỗi khi xuất PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Flex
      flex={1}
      direction="row"
      justify="space-between"
      align="center"
      wrap="wrap"
      gap={16}
    >
      <Group gap={4}>
        <IconFileCv stroke={1} size={24} />
        <Text>Tên file</Text>
        <IconWorld stroke={1} size={24} />
      </Group>
      <Group gap={4}>
        <MySelectCvTheme />
        <Button leftSection={<IconPalette size={16} />} variant="default">
          Màu sắc
        </Button>
        <Button
          onClick={handleExportPDF}
          leftSection={<IconDownload size={16} />}
          variant="default"
          loading={isExporting}
          disabled={isExporting}
        >
          {isExporting ? "Đang tải..." : "Tải xuống"}
        </Button>
        <Button leftSection={<IconInputAi size={16} />} variant="default">
          Đánh giá
        </Button>
      </Group>
    </Flex>
  );
}