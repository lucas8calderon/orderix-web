import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { mdToPdf } from "md-to-pdf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  "01-system-overview.md",
  "02-backend-architecture.md",
  "03-web-architecture.md",
  "04-android-architecture.md",
  "05-authentication-flow.md",
  "06-multitenancy-flow.md",
  "07-order-flow.md",
  "08-table-flow.md",
  "09-command-flow.md",
  "10-counter-flow.md",
  "11-kds-flow.md",
  "12-payment-flow.md",
  "13-inventory-flow.md",
  "14-api-map.md",
  "15-database-model.md",
  "16-integration-map.md",
  "17-problems-and-gaps.md",
  "18-complete-system-flow.md",
];

const cover = `# Weper / Weper — Documentação de Arquitetura

Gerado a partir do código real dos repositórios \`weper-backend\`, \`weper-web\` e \`weper-android\`.

**Data:** 30 de agosto de 2026

Este PDF reúne os 18 documentos técnicos da pasta \`docs/architecture/\`. Nenhum fluxo foi inventado: nomes de classes, endpoints e tabelas correspondem ao código existente.

| # | Documento |
|---|-----------|
| 01 | Visão geral do sistema |
| 02 | Arquitetura do backend |
| 03 | Arquitetura do frontend web |
| 04 | Arquitetura do Android |
| 05 | Fluxo de autenticação |
| 06 | Multi-tenancy |
| 07 | Fluxo de pedido |
| 08 | Fluxo de mesa |
| 09 | Fluxo de comanda |
| 10 | Fluxo de balcão |
| 11 | Fluxo da cozinha / KDS |
| 12 | Fluxo de pagamento |
| 13 | Fluxo de estoque |
| 14 | Mapa de endpoints |
| 15 | Modelo de dados |
| 16 | Integrações e dependências |
| 17 | Problemas e gaps |
| 18 | Fluxo completo do sistema |
`;

function rewriteRelativeLinks(markdown) {
  return markdown.replace(/\]\(\.\/([^)]+)\.md\)/g, "](#$1)");
}

function mermaidToHtml(markdown) {
  return markdown.replace(/```mermaid\s*\n([\s\S]*?)```/g, (_, diagram) => {
    const escaped = diagram
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre class="mermaid">\n${escaped}\n</pre>`;
  });
}

const parts = [cover];
for (const file of files) {
  const raw = fs.readFileSync(path.join(__dirname, file), "utf8");
  parts.push(
    '<div style="page-break-before: always;"></div>\n\n' +
      mermaidToHtml(rewriteRelativeLinks(raw))
  );
}

const combinedPath = path.join(__dirname, "_combined.md");
fs.writeFileSync(combinedPath, parts.join("\n\n"), "utf8");

const pdf = await mdToPdf(
  { path: combinedPath },
  {
    dest: path.join(__dirname, "weper-arquitetura.pdf"),
    pdf_options: {
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate:
        '<div style="font-size:9px;width:100%;padding:0 18mm;color:#666;">Weper / Weper — Arquitetura</div>',
      footerTemplate:
        '<div style="font-size:9px;width:100%;padding:0 18mm;color:#666;display:flex;justify-content:space-between;"><span>Confidencial — documentação técnica</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
      margin: { top: "22mm", bottom: "20mm", left: "14mm", right: "14mm" },
    },
    stylesheet: path.join(__dirname, "_pdf.css"),
    body_class: ["markdown-body"],
    launch_options: { args: ["--no-sandbox"] },
    script: [
      { url: "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js" },
      {
        content:
          "document.addEventListener('DOMContentLoaded', function () { if (window.mermaid) { mermaid.initialize({ startOnLoad: true, theme: 'neutral', securityLevel: 'loose' }); } });",
      },
    ],
  }
);

if (!pdf) {
  throw new Error("Falha ao gerar PDF");
}

fs.unlinkSync(combinedPath);
console.log("PDF gerado:", pdf.filename, "bytes:", pdf.content.length);
