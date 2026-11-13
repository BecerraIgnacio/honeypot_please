import { PALETTE, mulberry32 } from "./builder";
import type { Box, CardAssets, CardFonts, CardImage, DrawOp, FontSpec, TextOp } from "./types";

export type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export function fontString(font: FontSpec, fonts: CardFonts): string {
  return `${font.weight} ${Math.max(1, Math.round(font.size * 10) / 10)}px ${fonts[font.role]}`;
}

function setTracking(ctx: Ctx2D, px: number): void {
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${px}px`;
}

function scratch(width: number, height: number): Ctx2D | null {
  const w = Math.max(1, Math.ceil(width));
  const h = Math.max(1, Math.ceil(height));
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h).getContext("2d");
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return canvas.getContext("2d");
}

function drawText(ctx: Ctx2D, op: TextOp, fonts: CardFonts): void {
  const { x, y, w } = op.box;
  const slot = op.font.size * op.lineHeight;
  ctx.font = fontString(op.font, fonts);
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  setTracking(ctx, op.tracking);
  op.lines.forEach((line, i) => {
    const cy = y + slot * (i + 0.5);
    const width = ctx.measureText(line).width;
    const left =
      op.align === "left" ? x + op.padX : op.align === "right" ? x + w - op.padX - width : x + (w - width) / 2;
    if (op.highlight) {
      const gap = Math.max(2, op.font.size * 0.08);
      ctx.fillStyle = op.highlight;
      ctx.fillRect(left - op.padX, cy - slot / 2 + gap / 2, width + op.padX * 2, slot - gap);
    }
    if (op.shadow) {
      ctx.fillStyle = op.shadow.color;
      ctx.fillText(line, left + op.shadow.dx, cy + op.shadow.dy);
    }
    if (op.stroke) {
      ctx.strokeStyle = op.stroke.color;
      ctx.lineWidth = op.stroke.width;
      ctx.lineJoin = "round";
      ctx.strokeText(line, left, cy);
    }
    ctx.fillStyle = op.color;
    ctx.fillText(line, left, cy);
  });
}

function drawImage(ctx: Ctx2D, image: CardImage, box: Box, fit: "cover" | "contain"): void {
  const { width: iw, height: ih, source } = image;
  if (!iw || !ih) return;
  if (fit === "cover") {
    const scale = Math.max(box.w / iw, box.h / ih);
    const sw = box.w / scale;
    const sh = box.h / scale;
    ctx.drawImage(source, (iw - sw) / 2, (ih - sh) / 2, sw, sh, box.x, box.y, box.w, box.h);
    return;
  }
  const scale = Math.min(box.w / iw, box.h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(source, box.x + (box.w - dw) / 2, box.y + (box.h - dh) / 2, dw, dh);
}

function drawStamp(ctx: Ctx2D, op: Extract<DrawOp, { kind: "stamp" }>, fonts: CardFonts): void {
  const { x, y, w, h } = op.box;
  const s = scratch(w, h);
  if (!s) return;
  const rand = mulberry32(op.seed);
  const border = Math.max(3, h * 0.07);
  s.strokeStyle = op.color;
  s.lineWidth = border;
  s.strokeRect(border / 2, border / 2, w - border, h - border);
  s.lineWidth = Math.max(1, border * 0.35);
  s.strokeRect(border * 1.8, border * 1.8, w - border * 3.6, h - border * 3.6);
  s.fillStyle = op.color;
  s.font = fontString(op.font, fonts);
  s.textAlign = "center";
  s.textBaseline = "middle";
  const slot = op.font.size;
  const top = h / 2 - (slot * op.lines.length) / 2;
  op.lines.forEach((line, i) => s.fillText(line, w / 2, top + slot * (i + 0.5)));
  s.globalCompositeOperation = "destination-out";
  const specks = Math.round((w * h) / 55);
  for (let i = 0; i < specks; i++) {
    s.globalAlpha = 0.4 + rand() * 0.6;
    const size = 0.8 + rand() * 2.6;
    s.fillRect(rand() * w, rand() * h, size, size);
  }
  s.globalAlpha = 0.8;
  s.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    s.beginPath();
    const sy = rand() * h;
    s.moveTo(0, sy);
    s.lineTo(w, sy + (rand() - 0.5) * h * 0.6);
    s.stroke();
  }
  ctx.drawImage(s.canvas, x, y, w, h);
}

function drawTexture(ctx: Ctx2D, op: Extract<DrawOp, { kind: "texture" }>): void {
  const { x, y, w, h } = op.box;
  const rand = mulberry32(op.seed);
  const alpha = ctx.globalAlpha;
  ctx.fillStyle = op.color;
  ctx.strokeStyle = op.color;
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  switch (op.texture) {
    case "scanlines": {
      const step = op.density ?? 3;
      for (let yy = y; yy < y + h; yy += step) ctx.fillRect(x, yy, w, 1);
      break;
    }
    case "grain": {
      const count = Math.round((w * h) / 45);
      for (let i = 0; i < count; i++) {
        ctx.globalAlpha = alpha * rand();
        ctx.fillRect(x + rand() * w, y + rand() * h, 1, 1);
      }
      break;
    }
    case "noise": {
      const count = Math.round((w * h) / 260);
      for (let i = 0; i < count; i++) {
        ctx.globalAlpha = alpha * rand();
        ctx.fillStyle = i % 2 ? op.color : "#ffffff";
        const size = 1 + rand() * 2.5;
        ctx.fillRect(x + rand() * w, y + rand() * h, size, size);
      }
      break;
    }
    case "halftone": {
      const s = op.density ?? 10;
      ctx.beginPath();
      for (let row = 0, py = y; py < y + h + s; row++, py += s * 0.87) {
        for (let px = x + (row % 2 ? s / 2 : 0); px < x + w + s; px += s) {
          const f = ((px - x) / w + (py - y) / h) / 2;
          const r = (s / 2) * (0.12 + 0.88 * Math.min(1, Math.max(0, f)));
          ctx.moveTo(px + r, py);
          ctx.arc(px, py, r, 0, Math.PI * 2);
        }
      }
      ctx.fill();
      break;
    }
    case "glitch": {
      for (let i = 0; i < 7; i++) {
        const sy = y + rand() * h;
        const sh = 4 + rand() * 22;
        const dx = (rand() - 0.5) * Math.min(80, w * 0.12);
        ctx.drawImage(ctx.canvas, x, sy, w, sh, x + dx, sy, w, sh);
      }
      for (let i = 0; i < 4; i++) ctx.fillRect(x + rand() * w * 0.4, y + rand() * h, w * (0.2 + rand() * 0.5), 2 + rand() * 3);
      break;
    }
    case "registration": {
      const arm = 17;
      const corners: Array<[number, number]> = [
        [x + 22, y + 22],
        [x + w - 22, y + 22],
        [x + 22, y + h - 22],
        [x + w - 22, y + h - 22],
      ];
      ctx.lineWidth = 1.5;
      for (const [cx, cy] of corners) {
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.moveTo(cx - arm, cy);
        ctx.lineTo(cx + arm, cy);
        ctx.moveTo(cx, cy - arm);
        ctx.lineTo(cx, cy + arm);
        ctx.stroke();
      }
      [PALETTE.acid, PALETTE.red, PALETTE.amber, PALETTE.ink].forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(x + w / 2 - 38 + i * 20, y + h - 13, 16, 9);
      });
      break;
    }
    case "rays": {
      const [ox, oy] = op.origin ?? [x + w / 2, y + h / 2];
      const n = op.density ?? 24;
      const radius = Math.hypot(w, h) * 1.5;
      ctx.beginPath();
      for (let i = 0; i < n; i += 2) {
        const a0 = (i / n) * Math.PI * 2;
        const a1 = ((i + 1) / n) * Math.PI * 2;
        ctx.moveTo(ox, oy);
        ctx.arc(ox, oy, radius, a0, a1);
        ctx.closePath();
      }
      ctx.fill();
      break;
    }
    case "ruled": {
      const step = op.density ?? 32;
      for (let yy = y + step; yy < y + h; yy += step) ctx.fillRect(x, yy, w, 1);
      break;
    }
    case "grid": {
      const step = op.density ?? 40;
      for (let xx = x + step; xx < x + w; xx += step) ctx.fillRect(xx, y, 1, h);
      for (let yy = y + step; yy < y + h; yy += step) ctx.fillRect(x, yy, w, 1);
      break;
    }
    case "stain": {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const r = Math.min(w, h) / 2 - 8;
      ctx.globalAlpha = alpha * 0.25;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 4; i++) {
        ctx.globalAlpha = alpha * (0.5 + rand() * 0.5);
        ctx.lineWidth = 2 + rand() * 5;
        const start = rand() * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r - rand() * 5, start, start + Math.PI * (1.1 + rand() * 0.9));
        ctx.stroke();
      }
      break;
    }
    case "vignette": {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const gradient = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.3, cx, cy, Math.hypot(w, h) / 2);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, op.color);
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, w, h);
      break;
    }
    case "corners": {
      const len = Math.min(w, h) * 0.09;
      const p = 8;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (const [cx, cy, sx, sy] of [
        [x + p, y + p, 1, 1],
        [x + w - p, y + p, -1, 1],
        [x + p, y + h - p, 1, -1],
        [x + w - p, y + h - p, -1, -1],
      ]) {
        ctx.moveTo(cx, cy + sy * len);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + sx * len, cy);
      }
      ctx.stroke();
      break;
    }
  }
}

/** Executes a layout. Missing images are skipped; the procedural backdrop under them still shows. */
export function drawCard(ctx: Ctx2D, ops: readonly DrawOp[], assets: CardAssets): void {
  for (const op of ops) {
    const { x, y, w, h } = op.box;
    ctx.save();
    if (op.alpha !== undefined) ctx.globalAlpha = op.alpha;
    if (op.blend) ctx.globalCompositeOperation = op.blend;
    if (op.rotate) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(op.rotate);
      ctx.translate(-(x + w / 2), -(y + h / 2));
    }
    if (op.clip === "ellipse") {
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.clip();
    }
    switch (op.kind) {
      case "rect":
        if (op.fill) {
          ctx.fillStyle = op.fill;
          ctx.fillRect(x, y, w, h);
        }
        if (op.stroke) {
          ctx.strokeStyle = op.stroke;
          ctx.lineWidth = op.lineWidth ?? 1;
          if (op.dash) ctx.setLineDash(op.dash);
          ctx.strokeRect(x, y, w, h);
        }
        break;
      case "ellipse":
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        if (op.fill) {
          ctx.fillStyle = op.fill;
          ctx.fill();
        }
        if (op.stroke) {
          ctx.strokeStyle = op.stroke;
          ctx.lineWidth = op.lineWidth ?? 1;
          ctx.stroke();
        }
        break;
      case "poly":
        ctx.beginPath();
        op.points.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        if (op.closed) ctx.closePath();
        ctx.lineJoin = "round";
        if (op.fill) {
          ctx.fillStyle = op.fill;
          ctx.fill();
        }
        if (op.stroke) {
          ctx.strokeStyle = op.stroke;
          ctx.lineWidth = op.lineWidth ?? 1;
          ctx.stroke();
        }
        break;
      case "text":
        drawText(ctx, op, assets.fonts);
        break;
      case "image": {
        const image = op.source === "art" ? assets.art : assets.portrait;
        if (image) {
          ctx.imageSmoothingEnabled = op.source === "art";
          drawImage(ctx, image, op.box, op.fit);
        }
        break;
      }
      case "texture":
        drawTexture(ctx, op);
        break;
      case "stamp":
        drawStamp(ctx, op, assets.fonts);
        break;
    }
    ctx.restore();
  }
}
