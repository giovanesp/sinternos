import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";

interface ExportPdfOptions {
    filename?: string;
    margin?: number[];
    format?: string | number[];
    orientation?: "p" | "l" | "portrait" | "landscape";
    unit?: "pt" | "mm" | "cm" | "in" | "px" | "pc" | "em" | "ex";
}

interface ExportExcelOptions {
    filename?: string;
    sheetName?: string;
}

interface TableData {
    rows: any[];
}

export const exportService = {
    async exportToPdf(
        reportElement: HTMLElement,
        options: Partial<ExportPdfOptions> = {},
    ) {
        const defaultOptions = {
            filename: "ReportBuilder.pdf",
            margin: [20, 10, 15, 10],
            orientation: "portrait",
        };
        const pdfOptions = { ...defaultOptions, ...options };

        const headerElem = reportElement.querySelector(
            ".report-header",
        ) as HTMLElement;
        const footerElem = reportElement.querySelector(
            ".report-footer",
        ) as HTMLElement;

        const headerImage = headerElem
            ? await html2canvas(headerElem, { backgroundColor: null, scale: 2 }).then(
                (canvas) => canvas.toDataURL("image/png"),
            )
            : null;
        const footerImage = footerElem
            ? await html2canvas(footerElem, { backgroundColor: null, scale: 2 }).then(
                (canvas) => canvas.toDataURL("image/png"),
            )
            : null;

        const clone = reportElement.cloneNode(true) as HTMLElement;
        clone.querySelector(".report-header")?.remove();
        clone.querySelector(".report-footer")?.remove();

        const style = document.createElement("style");
        style.innerHTML = `
      /* Garante que imagens e canvas não quebrem */
      img, canvas, .chart-container {
        max-width: 100% !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      /* Tenta identificar linhas de grid/flex e proibir quebra dentro delas */
      .row, .d-flex, .grid-container {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      /* Remove scrollbars que podem aparecer */
      body, html { overflow: visible !important; height: auto !important; }
      .report-footer {position: fixed;bottom: 0;left: 0;width: 100%;height: 20px;background: #fff;z-index: 9999;padding: 1px 0;}
    `;
        clone.appendChild(style);

        const originalCanvases = reportElement.querySelectorAll("canvas");
        const clonedCanvases = clone.querySelectorAll("canvas");
        originalCanvases.forEach((origCanvas, idx) => {
            const dataUrl = origCanvas.toDataURL("image/png");
            const img = document.createElement("img");
            img.src = dataUrl;
            img.style.width = "100%";
            img.style.display = "block";

            const clonedCanvas = clonedCanvases[idx];
            if (clonedCanvas && clonedCanvas.parentNode) {
                (clonedCanvas.parentNode as HTMLElement).style.breakInside = "avoid";
                (clonedCanvas.parentNode as HTMLElement).style.pageBreakInside =
                    "avoid";
                clonedCanvas.parentNode.replaceChild(img, clonedCanvas);
            }
        });

        const opt = {
            margin: pdfOptions.margin,
            filename: pdfOptions.filename,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                windowWidth: 1200,
            },
            jsPDF: {
                unit: pdfOptions.unit || "mm",
                format: pdfOptions.format || "A4",
                orientation: pdfOptions.orientation || "portrait",
            },
            pagebreak: {
                mode: ["css", "legacy"],
                avoid: [
                    "canvas",
                    "img",
                    "tr",
                    ".card",
                    ".box",
                    ".container-que-nao-pode-quebrar",
                    ".secao-indivisivel",
                ],
            },
        };

        return html2pdf()
            .set(opt as any)
            .from(clone)
            .toPdf()
            .get("pdf")
            .then((pdf: any) => {
                const totalPages = pdf.internal.getNumberOfPages();
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                const headerHeightMM = 18;
                const footerHeightMM = 15;

                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);

                    if (headerImage) {
                        pdf.addImage(
                            headerImage,
                            "jpeg",
                            10,
                            0,
                            pageWidth - 20,
                            headerHeightMM,
                        );
                    }

                    if (footerImage) {
                        pdf.addImage(
                            footerImage,
                            "jpeg",
                            10,
                            pageHeight - footerHeightMM,
                            pageWidth - 20,
                            footerHeightMM,
                        );
                        pdf.setFontSize(8);
                        pdf.text(
                            `Página ${i} de ${totalPages}`,
                            pageWidth - 35,
                            pageHeight - 5,
                        );
                    }
                }
                pdf.save(pdfOptions.filename);
            });
    },

    async exportToExcel(
        tableData: TableData,
        options: Partial<ExportExcelOptions> = {},
    ) {
        const defaultOptions = {
            filename: "dados.xlsx",
            sheetName: "Planilha1",
        };

        const excelOptions = { ...defaultOptions, ...options };

        const XLSX = await import("xlsx");

        const worksheet = XLSX.utils.json_to_sheet(tableData.rows);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, excelOptions.sheetName);

        XLSX.writeFile(workbook, excelOptions.filename);
    },

    printReport(
        reportElement: HTMLElement,
        options: Partial<ExportPdfOptions> = {},
    ) {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            alert("Por favor, permita popups para imprimir o relatório.");
            return;
        }

        const styles = Array.from(document.styleSheets)
            .map((styleSheet) => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map((rule) => rule.cssText)
                        .join("\n");
                } catch (e) {
                    console.log(e);
                    return "";
                }
            })
            .filter(Boolean)
            .join("\n");

        const clone = reportElement.cloneNode(true) as HTMLElement;

        const originalCanvases = reportElement.querySelectorAll("canvas");
        const clonedCanvases = clone.querySelectorAll("canvas");
        originalCanvases.forEach((origCanvas, idx) => {
            const dataUrl = origCanvas.toDataURL("image/png");
            const img = document.createElement("img");
            img.src = dataUrl;
            img.style.maxWidth = "100%";
            const clonedCanvas = clonedCanvases[idx];
            if (clonedCanvas && clonedCanvas.parentNode) {
                clonedCanvas.parentNode.replaceChild(img, clonedCanvas);
            }
        });

        printWindow.document.write(`
  <!DOCTYPE html>
  <html>
    <head>
      <title>${options.filename || "Relatório"}</title>
      <style>${styles}</style>
      <style>
        body { margin: 0; padding: 0px; }
        @media print {
          @page { size: A4; margin: 5mm; }
          .report-header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 80px;
            background: #fff;
            z-index: 9999;
            padding: 1px 0;
            text-align: center;
          }
          .report-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 20px;
            background: #fff;
            z-index: 9999;
            padding: 1px 0;
          }
          .report-content {
            margin-top: 85px;
            margin-bottom: 40px;
          }
        }
      </style>
    </head>
    <body>
      ${clone.outerHTML}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 500);
        };
      </script>
    </body>
  </html>
  `);
        printWindow.document.close();
    },
};