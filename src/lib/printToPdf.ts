/**
 * Browser print-to-PDF helper (Blob → window.open → window.print).
 * Shared by the paid Visa Cover Letter and the free Invitation Letter tool.
 */

export function buildPrintableLetterHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>${title.replace(/</g, "&lt;")}</title>
    <style>
      @page {
        size: A4;
        margin: 2.5cm;
        @top-center { content: none; }
        @bottom-center { content: none; }
        @top-left { content: none; }
        @bottom-left { content: none; }
        @top-right { content: none; }
        @bottom-right { content: none; }
      }
      html, body {
        font-family: "Times New Roman", Times, serif;
        font-size: 12pt;
        line-height: 1.8;
        color: #000;
        background: #fff;
        margin: 0;
        padding: 0;
      }
      .letter {
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      strong { font-weight: bold; }
      em { font-style: italic; }
    </style>
  </head>
  <body>
    <div class="letter">${bodyHtml}</div>
    <script>
      window.onload = function() {
        setTimeout(function() { window.print(); }, 300);
      };
    <\/script>
  </body>
</html>`;
}

/** Open a printable HTML document and trigger the browser print dialog. */
export function printHtmlDocument(html: string): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (w) {
    w.onafterprint = () => {
      URL.revokeObjectURL(url);
      w.close();
    };
  }
}

/** Convenience: wrap plain text (newlines → <br>) and print as a letter. */
export function printPlainLetter(title: string, plainText: string): void {
  const bodyHtml = plainText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  printHtmlDocument(buildPrintableLetterHtml(title, bodyHtml));
}
