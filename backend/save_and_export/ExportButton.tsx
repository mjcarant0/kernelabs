"use client";

import React, { useRef, useState, RefObject } from "react";

export interface ExportButtonProps {
  targetId?: string;
  targetRef?: RefObject<HTMLElement>;
  title: string;
  subtitle?: string;
  filename?: string;
  className?: string;
  label?: string;
  variant?: "primary" | "ghost";
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.onerror = () => reject(new Error(`Failed to load: ${src}`));
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

async function loadLibs() {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsPDF = (window as any).jspdf.jsPDF;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2canvas = (window as any).html2canvas;
  return { jsPDF, html2canvas };
}

// Elements matching this are hidden from the captured clone by default —
// covers the sticky top nav used across all demos, plus an opt-in escape hatch.
const DEFAULT_EXPORT_EXCLUDE_SELECTOR = ".sticky.top-0, [data-export-exclude]";

function resolveComputedColors(root: HTMLElement, liveRoot: HTMLElement): void {
  const PROPS = [
    "color", "background-color", "border-color",
    "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
    "outline-color", "text-decoration-color", "caret-color", "fill", "stroke",
  ] as const;

  const UNSUPPORTED = /\b(oklab|oklch|lab|lch|color-mix|color\()/i;

  const liveAll  = Array.from(liveRoot.querySelectorAll<HTMLElement>("*"));
  const cloneAll = Array.from(root.querySelectorAll<HTMLElement>("*"));

  const pairs: Array<[HTMLElement, HTMLElement]> = [
    [liveRoot, root],
    ...liveAll.map((live, i) => [live, cloneAll[i]] as [HTMLElement, HTMLElement]),
  ];

  for (const [liveEl, cloneEl] of pairs) {
    if (!cloneEl) continue;
    const computed = window.getComputedStyle(liveEl);

    for (const prop of PROPS) {
      const val = computed.getPropertyValue(prop);
      if (!val || val === "none" || val === "initial" || val === "inherit") continue;
      if (UNSUPPORTED.test(val)) {
        cloneEl.style.setProperty(prop, "transparent");
      } else {
        cloneEl.style.setProperty(prop, val);
      }
    }

    const bgShorthand = computed.getPropertyValue("background");
    if (UNSUPPORTED.test(bgShorthand)) {
      const bgColor = computed.getPropertyValue("background-color");
      cloneEl.style.background = UNSUPPORTED.test(bgColor) ? "transparent" : bgColor;
    }
  }
}

export default function ExportButton({
  targetId,
  targetRef,
  title,
  subtitle,
  filename,
  className = "",
  label = "Export PDF",
  variant = "primary",
}: ExportButtonProps) {
  const [status, setStatus] = useState<"idle" | "capturing" | "done" | "error">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleExport() {
    if (status === "capturing") return;
    setStatus("capturing");

    try {
      const el: HTMLElement | null =
        targetRef?.current ??
        (targetId ? document.getElementById(targetId) : null) ??
        document.body;

      if (!el) {
        console.error("[ExportButton] Target element not found.");
        setStatus("error");
        return;
      }

      const { jsPDF, html2canvas } = await loadLibs();

      const isDark = document.documentElement.classList.contains("dark");

      // ── Theme tokens ──
      const pageBg       = isDark ? "#020b18" : "#f0f6fa";
      const cardBg       = isDark ? "#0d1f35" : "#ffffff";
      const headerBg     = isDark ? [3, 13, 31]      : [232, 240, 247] as [number,number,number];
      const footerBg     = isDark ? [3, 13, 31]      : [232, 240, 247] as [number,number,number];
      const logoBorder   = isDark ? [0, 180, 220]    : [0, 140, 180]   as [number,number,number];
      const logoGt       = isDark ? [0, 200, 255]    : [0, 140, 200]   as [number,number,number];
      const logoKerne    = isDark ? [255, 255, 255]  : [15, 40, 80]    as [number,number,number];
      const logoLabs     = isDark ? [0, 200, 255]    : [0, 140, 200]   as [number,number,number];
      const cursor       = isDark ? [0, 200, 255]    : [0, 140, 200]   as [number,number,number];
      const subtitleCol  = isDark ? [140, 160, 190]  : [80, 110, 150]  as [number,number,number];
      const timestampCol = isDark ? [80, 110, 150]   : [100, 130, 160] as [number,number,number];
      const footerCol    = isDark ? [60, 90, 130]    : [90, 120, 155]  as [number,number,number];
      const textColor    = isDark ? "#e2e8f0" : "#1e293b";

      const liveEl: HTMLElement = el;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: pageBg,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 900,
        width: el.scrollWidth,
        height: el.scrollHeight,
        onclone: (_clonedDoc: Document, clonedEl: HTMLElement) => {
          resolveComputedColors(clonedEl, liveEl);

          // Hide sticky nav bars / anything explicitly opted out
          clonedEl.querySelectorAll<HTMLElement>(DEFAULT_EXPORT_EXCLUDE_SELECTOR).forEach((e) => {
            e.style.display = "none";
          });

          clonedEl.style.background = pageBg;
          clonedEl.style.backdropFilter = "none";
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (clonedEl.style as any).webkitBackdropFilter = "none";
          clonedEl.style.padding = "24px";
          clonedEl.style.borderRadius = "0";
          clonedEl.style.minHeight = "unset";
          clonedEl.style.width = "900px";

          clonedEl.querySelectorAll<HTMLElement>("*").forEach((e) => {
            // backdrop-blur isn't supported by html2canvas and causes
            // ghosted/duplicated text and shapes underneath — strip it.
            e.style.backdropFilter = "none";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (e.style as any).webkitBackdropFilter = "none";

            // html2canvas double-paints text inside rounded-full +
            // flex-centered badges (e.g. the "P2" process badges in the
            // recovery snapshot), producing a ghosted duplicate above the
            // row no matter how the original element's display/centering is
            // adjusted. Instead, rebuild the badge from scratch: clear the
            // original element's text node, then add a fresh absolutely
            // positioned <span> for the label. A brand-new node has no
            // leftover layout state for html2canvas to double-paint.
            if (e.classList.contains("rounded-full")) {
              const rect = e.getBoundingClientRect();
              const text = e.textContent?.trim();
              if (rect.height > 0 && text) {
                // Remove existing child nodes (including the text node)
                while (e.firstChild) e.removeChild(e.firstChild);

                e.style.position = "relative";
                e.style.display = "block";
                e.style.width = `${rect.width}px`;
                e.style.height = `${rect.height}px`;
                e.style.boxSizing = "border-box";

                const label = document.createElement("span");
                label.textContent = text;
                label.style.position = "absolute";
                label.style.top = "0";
                label.style.left = "0";
                label.style.width = "100%";
                label.style.height = "100%";
                label.style.display = "flex";
                label.style.alignItems = "center";
                label.style.justifyContent = "center";
                label.style.color = window.getComputedStyle(e).color;
                label.style.fontSize = window.getComputedStyle(e).fontSize;
                label.style.fontWeight = window.getComputedStyle(e).fontWeight;
                label.style.fontFamily = window.getComputedStyle(e).fontFamily;
                e.appendChild(label);
              }
            }

            const bg = e.style.backgroundColor;
            if (!bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent") {
              e.style.backgroundColor = pageBg;
            }
            if (isDark && (bg === "rgb(255, 255, 255)" || bg === "rgba(255, 255, 255, 1)")) {
              e.style.backgroundColor = cardBg;
            }
            if (!isDark && (bg === "rgb(2, 11, 24)" || bg === "rgb(3, 13, 31)")) {
              e.style.backgroundColor = cardBg;
            }
            const col = e.style.color;
            if (!col || col === "rgba(0, 0, 0, 0)" || col === "transparent") {
              e.style.color = textColor;
            }
          });
        },
      });

      const PAGE_W   = 210;
      const PAGE_H   = 297;
      const MARGIN   = 14;
      const HEADER_H = 24;
      const FOOTER_H = 10;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // ── Helpers: draw page background + header (called for every page) ──
      const drawPageBg = () => {
        pdf.setFillColor(...(isDark ? [2, 11, 24] : [240, 246, 250]) as [number,number,number]);
        pdf.rect(0, 0, PAGE_W, PAGE_H, "F");
      };

      const drawHeader = () => {
        pdf.setFillColor(...headerBg);
        pdf.rect(0, 0, PAGE_W, HEADER_H, "F");

        if (!isDark) {
          pdf.setDrawColor(180, 210, 230);
          pdf.setLineWidth(0.3);
          pdf.line(0, HEADER_H, PAGE_W, HEADER_H);
        }

        // Logo border box
        pdf.setDrawColor(...logoBorder);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(MARGIN, 4, 33, 10, 1.5, 1.5, "S");

        pdf.setTextColor(...logoGt);
        pdf.setFont("courier", "bold");
        pdf.setFontSize(8);
        pdf.text(">", MARGIN + 4, 9.5);

        pdf.setTextColor(...logoKerne);
        pdf.setFont("courier", "bold");
        pdf.setFontSize(10);
        pdf.text("kerne", MARGIN + 7, 10);

        pdf.setTextColor(...logoLabs);
        pdf.setFont("courier", "bold");
        pdf.setFontSize(10);
        pdf.text("labs", MARGIN + 18, 10);

        pdf.setFillColor(...cursor);
        pdf.rect(MARGIN + 28.5, 6, 0.8, 5.5, "F");

        if (subtitle) {
          pdf.setTextColor(...subtitleCol);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7);
          pdf.text(subtitle, MARGIN, 19);
        }

        pdf.setTextColor(...timestampCol);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.text(new Date().toLocaleString(), PAGE_W - MARGIN, 10.5, { align: "right" });
      };

      // ── Page 1 background + header ──
      drawPageBg();
      drawHeader();

      // ── Image (multi-page via canvas slicing) ──
      const usableW  = PAGE_W - MARGIN * 2;
      const usableH  = PAGE_H - HEADER_H - FOOTER_H - MARGIN;  // content area on every page (header on every page)

      const scaleF   = usableW / canvas.width;                  // mm per canvas px

      // ── Smart page breaks: avoid slicing through the middle of content ──
      // A row is "safe" to cut on if it has almost no color variance across
      // its width — i.e. a blank gap (between cards, or the padding between
      // table rows inside a card), as opposed to a row containing text,
      // icons, or colored elements.
      const ctx = canvas.getContext("2d")!;

      function isRowSafe(y: number): boolean {
        const row = ctx.getImageData(0, y, canvas.width, 1).data;
        let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
        for (let x = 0; x < canvas.width; x += 2) {
          const i = x * 4;
          const r = row[i], g = row[i + 1], b = row[i + 2];
          if (r < rMin) rMin = r;
          if (r > rMax) rMax = r;
          if (g < gMin) gMin = g;
          if (g > gMax) gMax = g;
          if (b < bMin) bMin = b;
          if (b > bMax) bMax = b;
        }
        return (rMax - rMin) <= 8 && (gMax - gMin) <= 8 && (bMax - bMin) <= 8;
      }

      let sliceTopPx = 0;
      let pageNum    = 1;

      while (sliceTopPx < canvas.height) {
        let sliceHPx = Math.min(
          Math.round(usableH / scaleF),
          canvas.height - sliceTopPx
        );

        // If this isn't the last page, try to land the cut on a safe (blank)
        // row rather than mid-content. Search back up to 50% of the slice height.
        const idealBottomPx = sliceTopPx + sliceHPx;
        if (idealBottomPx < canvas.height) {
          const minSliceHPx = Math.round(sliceHPx * 0.5);
          for (let y = idealBottomPx; y > sliceTopPx + minSliceHPx; y--) {
            if (isRowSafe(y)) {
              sliceHPx = y - sliceTopPx;
              break;
            }
          }
        }

        // Cut a horizontal strip from the full canvas
        const strip = document.createElement("canvas");
        strip.width  = canvas.width;
        strip.height = sliceHPx;
        strip.getContext("2d")!.drawImage(
          canvas,
          0, sliceTopPx, canvas.width, sliceHPx,
          0, 0,          canvas.width, sliceHPx
        );

        const imgY = HEADER_H + MARGIN / 2;
        pdf.addImage(
          strip.toDataURL("image/png"), "PNG",
          MARGIN, imgY,
          usableW, sliceHPx * scaleF
        );

        // Footer for this page
        pdf.setFillColor(...footerBg);
        pdf.rect(0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H, "F");
        if (!isDark) {
          pdf.setDrawColor(180, 210, 230);
          pdf.setLineWidth(0.3);
          pdf.line(0, PAGE_H - FOOTER_H, PAGE_W, PAGE_H - FOOTER_H);
        }
        pdf.setTextColor(...footerCol);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.5);
        pdf.text("Generated by kernelabs", MARGIN, PAGE_H - 4);
        pdf.text(`Page ${pageNum}`, PAGE_W - MARGIN, PAGE_H - 4, { align: "right" });

        sliceTopPx += sliceHPx;
        pageNum++;

        if (sliceTopPx < canvas.height) {
          pdf.addPage();
          drawPageBg();
          drawHeader();
        }
      }

      // ── Save ──
      const dateStr = new Date().toISOString().slice(0, 10);
      const stem = filename ?? `${slugify(title)}-${dateStr}`;
      pdf.save(`${stem}.pdf`);

      setStatus("done");
    } catch (err) {
      console.error("[ExportButton] Export failed:", err);
      setStatus("error");
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setStatus("idle"), 2000);
    }
  }

  const iconMap = {
    idle: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3" />
      </svg>
    ),
    capturing: (
      <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    ),
    done: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  };

  const labelMap = { idle: label, capturing: "Capturing…", done: "Saved!", error: "Failed" };

  const base = "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400";

  const stateClass =
    status === "done"      ? "!bg-emerald-500/15 !text-emerald-400 !border-emerald-400/30" :
    status === "error"     ? "!bg-rose-500/15 !text-rose-400 !border-rose-400/30" :
    status === "capturing" ? "cursor-wait opacity-70" : "";

  const variantClass =
    variant === "primary"
      ? `bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-400/40 dark:border-cyan-500/30 hover:bg-cyan-500/25 active:scale-95 ${stateClass}`
      : `text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 border border-transparent hover:border-slate-200 dark:hover:border-white/10 active:scale-95 ${stateClass}`;

  return (
    <button
      onClick={handleExport}
      disabled={status === "capturing"}
      aria-label={`${labelMap[status]} — ${title}`}
      className={`${base} ${variantClass} ${className}`}
    >
      {iconMap[status]}
      <span>{labelMap[status]}</span>
    </button>
  );
}
