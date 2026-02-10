import { jsPDF } from "jspdf";

interface Solution {
  title: string;
  description: string;
  type: "saas" | "ecommerce" | "service" | "content";
  difficulty: "easy" | "medium" | "hard";
  monetization: string;
}

interface PainPoint {
  title: string;
  description: string;
  frequency: number;
  confidence?: number;
  evidenceCount?: number;
  opportunityScore?: number;
  sentiment: "negative" | "neutral" | "mixed";
  quotes: { text: string; source: string; url?: string }[];
  keywords: string[];
  solutions?: Solution[];
}

interface SearchVolume {
  keyword: string;
  volume: number;
  competition: number;
}

interface AdLinksMap {
  facebook?: string;
  tiktok?: string;
  google?: string;
  pinterest?: string;
  spyfu?: string;
  similarweb?: string;
}

export interface ExportData {
  niche: string;
  painPoints: PainPoint[];
  searchVolume?: SearchVolume[];
  adLinks: AdLinksMap;
}

// --- CSV Export ---

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportCsv(data: ExportData): void {
  const lines: string[] = [];

  // Header section
  lines.push(`Research Report: ${escapeCsv(data.niche)}`);
  lines.push(`Generated: ${new Date().toLocaleDateString()}`);
  lines.push("");

  // Pain points table
  lines.push("PAIN POINTS");
  lines.push(
    [
      "Rank",
      "Title",
      "Description",
      "Frequency",
      "Confidence",
      "Evidence Count",
      "Opportunity Score",
      "Sentiment",
      "Keywords",
      "Solutions",
    ].join(",")
  );

  data.painPoints.forEach((pp, i) => {
    const solutionsSummary = pp.solutions
      ?.map((s) => `${s.title} (${s.type}/${s.difficulty})`)
      .join("; ");

    lines.push(
      [
        String(i + 1),
        escapeCsv(pp.title),
        escapeCsv(pp.description),
        String(pp.frequency),
        pp.confidence != null ? String(pp.confidence) : "",
        pp.evidenceCount != null ? String(pp.evidenceCount) : "",
        pp.opportunityScore != null ? String(pp.opportunityScore) : "",
        pp.sentiment,
        escapeCsv(pp.keywords.join("; ")),
        escapeCsv(solutionsSummary ?? ""),
      ].join(",")
    );
  });

  // Search volume section
  if (data.searchVolume && data.searchVolume.length > 0) {
    lines.push("");
    lines.push("SEARCH VOLUME");
    lines.push(["Keyword", "Monthly Volume", "Competition"].join(","));
    data.searchVolume.forEach((sv) => {
      lines.push(
        [escapeCsv(sv.keyword), String(sv.volume), String(sv.competition)].join(
          ","
        )
      );
    });
  }

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, `${slugify(data.niche)}-research.csv`);
}

// --- PDF Export ---

export function exportPdf(data: ExportData): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function checkPage(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  }

  // --- Header ---
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("WhatToBuild Research Report", margin, y);
  y += 10;

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(data.niche, margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, margin, y);
  doc.setTextColor(0);
  y += 10;

  // Divider
  doc.setDrawColor(220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // --- Pain Points ---
  data.painPoints.forEach((pp, i) => {
    checkPage(45);

    // Rank + Title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const titleText = `${i + 1}. ${pp.title}`;
    const titleLines = doc.splitTextToSize(titleText, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 5 + 2;

    // Scores row
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const scores: string[] = [`Frequency: ${pp.frequency}/10`];
    if (pp.opportunityScore != null)
      scores.push(`Opportunity: ${pp.opportunityScore}/100`);
    if (pp.confidence != null) scores.push(`Confidence: ${pp.confidence}%`);
    if (pp.evidenceCount != null)
      scores.push(`Evidence: ${pp.evidenceCount} sources`);
    scores.push(`Sentiment: ${pp.sentiment}`);
    doc.text(scores.join("  |  "), margin, y);
    doc.setTextColor(0);
    y += 5;

    // Description
    doc.setFontSize(9);
    const descLines = doc.splitTextToSize(pp.description, contentWidth);
    checkPage(descLines.length * 4 + 2);
    doc.text(descLines, margin, y);
    y += descLines.length * 4 + 2;

    // Keywords
    if (pp.keywords.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(80);
      const kwText = `Keywords: ${pp.keywords.join(", ")}`;
      const kwLines = doc.splitTextToSize(kwText, contentWidth);
      checkPage(kwLines.length * 3.5 + 2);
      doc.text(kwLines, margin, y);
      doc.setTextColor(0);
      y += kwLines.length * 3.5 + 2;
    }

    // Quotes (max 3)
    const quotesToShow = pp.quotes.slice(0, 3);
    if (quotesToShow.length > 0) {
      checkPage(8);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Quotes:", margin, y);
      doc.setFont("helvetica", "normal");
      y += 4;

      quotesToShow.forEach((q) => {
        doc.setFontSize(8);
        doc.setTextColor(80);
        const qText = `"${q.text}" - ${q.source}`;
        const qLines = doc.splitTextToSize(qText, contentWidth - 4);
        checkPage(qLines.length * 3.5 + 3);
        doc.text(qLines, margin + 2, y);
        doc.setTextColor(0);
        y += qLines.length * 3.5 + 2;
      });
    }

    // Solutions
    if (pp.solutions && pp.solutions.length > 0) {
      checkPage(8);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Product Ideas:", margin, y);
      doc.setFont("helvetica", "normal");
      y += 4;

      pp.solutions.forEach((s) => {
        const sText = `${s.title} (${s.type}, ${s.difficulty}) - ${s.monetization}`;
        const sLines = doc.splitTextToSize(sText, contentWidth - 4);
        checkPage(sLines.length * 3.5 + 2);
        doc.setFontSize(8);
        doc.text(sLines, margin + 2, y);
        y += sLines.length * 3.5 + 1;

        const descText = s.description;
        const dLines = doc.splitTextToSize(descText, contentWidth - 6);
        checkPage(dLines.length * 3.5 + 2);
        doc.setTextColor(100);
        doc.text(dLines, margin + 4, y);
        doc.setTextColor(0);
        y += dLines.length * 3.5 + 2;
      });
    }

    // Separator between pain points
    y += 3;
    checkPage(4);
    doc.setDrawColor(230);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  });

  // --- Search Volume Table ---
  if (data.searchVolume && data.searchVolume.length > 0) {
    checkPage(20);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Search Volume Data", margin, y);
    y += 8;

    // Table header
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 3, contentWidth, 6, "F");
    doc.text("Keyword", margin + 2, y);
    doc.text("Monthly Volume", margin + 90, y);
    doc.text("Competition", margin + 130, y);
    doc.setFont("helvetica", "normal");
    y += 5;

    data.searchVolume.forEach((sv) => {
      checkPage(6);
      doc.setFontSize(8);
      const kwLines = doc.splitTextToSize(sv.keyword, 85);
      doc.text(kwLines[0], margin + 2, y);
      doc.text(sv.volume.toLocaleString(), margin + 90, y);
      doc.text(String(sv.competition), margin + 130, y);
      y += 5;
    });
  }

  // --- Ad Library Links ---
  const activeLinks = Object.entries(data.adLinks).filter(([, url]) => url);
  if (activeLinks.length > 0) {
    checkPage(15);
    y += 4;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Ad Library Links", margin, y);
    y += 7;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    activeLinks.forEach(([platform, url]) => {
      checkPage(5);
      doc.text(
        `${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${url}`,
        margin + 2,
        y
      );
      y += 4;
    });
  }

  doc.save(`${slugify(data.niche)}-research.pdf`);
}

// --- Helpers ---

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
