import type { CardStyle } from "../../game/types";
import {
  CardBuilder,
  PALETTE as P,
  column,
  fileNumber,
  inset,
  mulberry32,
  splitH,
  splitV,
  starPoints,
  type Column,
} from "./builder";
import type { Box } from "./types";

type StyleLayout = (b: CardBuilder) => void;

function reserveBottom(col: Column, height: number, gap: number): Box {
  const h = Math.max(0, Math.min(height, col.bottom - col.y));
  const box = { x: col.x, y: col.bottom - h, w: col.w, h };
  col.bottom = box.y - gap;
  return box;
}

function statRows(b: CardBuilder, box: Box, label: string, value: string, rule: string): void {
  const stats = b.stats();
  if (!stats.length || box.h <= 0) return;
  const rows = splitV(box, stats.map(() => "*" as const), 0);
  stats.forEach((stat, i) => {
    const row = rows[i];
    b.rect({ x: row.x, y: row.y, w: row.w, h: Math.max(1, b.unit) }, rule, { alpha: 0.45 });
    const [l, v] = splitH(inset(row, 0, 3 * b.unit), ["*", row.w * 0.42], 10 * b.unit);
    b.text(l, `> ${stat.label}`, { role: "mono", color: label, maxSize: 16, minSize: 8, maxLines: 1, valign: "middle", uppercase: true });
    b.text(v, stat.value, { role: "mono", weight: 700, color: value, maxSize: 18, minSize: 8, maxLines: 1, align: "right", valign: "middle" });
  });
}

function statCells(
  b: CardBuilder,
  box: Box,
  colors: { fill?: string; stroke: string; value: string; label: string; valueRole: "display" | "pixel" | "mono" },
): void {
  const stats = b.stats();
  if (!stats.length || box.h <= 0) return;
  const cells = splitH(box, stats.map(() => "*" as const), 10 * b.unit);
  stats.forEach((stat, i) => {
    const cell = cells[i];
    if (colors.fill) b.rect(cell, colors.fill);
    b.frameRect(cell, colors.stroke, 2 * b.unit);
    const [v, l] = splitV(inset(cell, 8 * b.unit, 6 * b.unit), ["*", cell.h * 0.3], 2 * b.unit);
    b.text(v, stat.value, {
      role: colors.valueRole,
      weight: 700,
      color: colors.value,
      maxSize: colors.valueRole === "pixel" ? 22 : 30,
      minSize: 8,
      maxLines: 1,
      align: "center",
      valign: "middle",
      lineHeight: 1.15,
    });
    b.text(l, stat.label, { role: "mono", color: colors.label, maxSize: 12, minSize: 7, maxLines: 1, align: "center", valign: "middle", uppercase: true });
  });
}

const securityReport: StyleLayout = (b) => {
  const { data, unit: u } = b;
  b.rect(b.frame, P.ink);
  b.texture(b.frame, "grid", P.acid, 0.05, { density: Math.round(44 * u) });
  b.texture(b.frame, "grain", P.acid, 0.05);
  const [header, body, foot] = splitV(inset(b.frame, 30 * u), [44 * u, "*", 30 * u], 18 * u);

  b.rect(header, P.ink2);
  b.frameRect(header, P.acid, 2 * u);
  const [hl, hr] = splitH(inset(header, 14 * u, 6 * u), ["*", header.w * 0.28], 12 * u);
  b.text(hl, "ENDEAVOR SECURITY OFFICE // INCIDENT REPORT", {
    role: "mono",
    weight: 700,
    color: P.acid,
    maxSize: 17,
    minSize: 8,
    maxLines: 1,
    valign: "middle",
    tracking: 0.06,
  });
  b.text(hr, `FILE ${fileNumber(data)}`, { role: "mono", color: P.paper, maxSize: 16, minSize: 8, maxLines: 1, align: "right", valign: "middle" });

  let textBox: Box;
  let artBox: Box;
  if (b.landscape) [textBox, artBox] = splitH(body, ["*", body.w * 0.4], 28 * u);
  else [artBox, textBox] = splitV(body, [body.h * 0.42, "*"], 22 * u);

  const col = column(textBox);
  const statsBox = reserveBottom(col, b.stats().length * 30 * u, 14 * u);
  const chip = { x: col.x, y: col.y, w: Math.min(col.w, 380 * u), h: 28 * u };
  b.rect(chip, P.red);
  b.text(inset(chip, 10 * u, 4 * u), "SEVERITY: SHAREHOLDER-CRITICAL", {
    role: "mono",
    weight: 700,
    color: P.paper,
    maxSize: 15,
    minSize: 7,
    maxLines: 1,
    valign: "middle",
  });
  col.y += chip.h + 16 * u;
  b.flow(
    col,
    data.title,
    { role: "pixel", color: P.acid, maxSize: 36, minSize: 12, lineHeight: 1.3, maxLines: 3, uppercase: true, shadow: { color: P.red, dx: 3 * u, dy: 0 } },
    textBox.h * 0.3,
    16 * u,
  );
  const memeTop = col.y;
  const memeCol = { ...col, x: col.x + 18 * u, w: col.w - 18 * u };
  b.flow(
    memeCol,
    data.memePhrase,
    { role: "display", weight: 700, color: P.paper, maxSize: 78, minSize: 16, lineHeight: 1.04, maxLines: 4, uppercase: true },
    textBox.h * 0.42,
    14 * u,
  );
  if (memeCol.y - memeTop > 14 * u) b.rect({ x: col.x, y: memeTop, w: 6 * u, h: memeCol.y - memeTop - 14 * u }, P.red);
  col.y = memeCol.y;
  b.flow(col, data.subtext, { role: "mono", color: P.paper, alpha: 0.75, maxSize: 16, minSize: 9, lineHeight: 1.3, maxLines: 3 }, textBox.h * 0.2, 0);
  statRows(b, statsBox, P.acid, P.paper, P.acid);

  b.illustration(artBox, { bg: P.ink2, fg: "#22301a", accent: P.acid });
  b.texture(artBox, "scanlines", P.ink, 0.4, { density: Math.max(3, Math.round(3 * u)) });
  b.texture(artBox, "glitch", P.red, 0.55);
  b.texture(artBox, "corners", P.acid, 0.9);
  const tag = { x: artBox.x + 14 * u, y: artBox.y + 14 * u, w: artBox.w - 28 * u, h: 22 * u };
  b.ellipse({ x: tag.x, y: tag.y + 5 * u, w: 12 * u, h: 12 * u }, P.red);
  b.text({ ...tag, x: tag.x + 20 * u, w: tag.w - 20 * u }, "REC  CAM-07 // RPC-7 LOBBY", {
    role: "mono",
    weight: 700,
    color: P.red,
    maxSize: 14,
    minSize: 7,
    maxLines: 1,
    valign: "middle",
  });
  b.text({ x: artBox.x + 14 * u, y: artBox.y + artBox.h - 34 * u, w: artBox.w - 28 * u, h: 20 * u }, "2027-03-16 10:00:07 PT", {
    role: "mono",
    color: P.acid,
    maxSize: 13,
    minSize: 7,
    maxLines: 1,
    align: "right",
    valign: "middle",
  });
  const sw = Math.min(artBox.w * 0.72, 300 * u);
  const sh = 76 * u;
  b.stamp({ x: artBox.x + artBox.w - sw - 22 * u, y: artBox.y + artBox.h - sh - 56 * u, w: sw, h: sh }, "UNACCEPTABLE", P.red, -0.12, 44);

  b.rect({ x: foot.x, y: foot.y - 9 * u, w: foot.w, h: Math.max(1, u) }, P.acid, { alpha: 0.5 });
  b.footer(foot, P.paper, P.acid);
  b.texture(b.frame, "scanlines", P.ink, 0.12, { density: Math.max(3, Math.round(4 * u)) });
  b.texture(b.frame, "vignette", "#000000", 0.55);
};

const tabloid: StyleLayout = (b) => {
  const { data, unit: u } = b;
  b.rect(b.frame, P.paper);
  b.texture(b.frame, "grain", P.ink, 0.1);
  const [mast, strip, body, foot] = splitV(inset(b.frame, 24 * u), [(b.landscape ? 104 : 120) * u, 30 * u, "*", 28 * u], 10 * u);

  b.rect(mast, P.red);
  b.texture(mast, "halftone", P.ink, 0.22, { density: Math.round(8 * u), blend: "multiply" });
  b.text(inset(mast, 18 * u, 8 * u), "THE DAILY ALLOCATION", {
    role: "display",
    weight: 700,
    color: P.paper,
    maxSize: 96,
    minSize: 20,
    maxLines: 1,
    align: "center",
    valign: "middle",
    lineHeight: 1,
    tracking: 0.02,
    shadow: { color: P.ink, dx: 4 * u, dy: 4 * u },
  });
  b.rect(strip, P.ink);
  b.text(inset(strip, 12 * u, 3 * u), "GTC WEEK 2027 SPECIAL EDITION  •  SANTA CLARA'S LEAST RELIABLE NEWSPAPER  •  $5 TRILLION OR LESS", {
    role: "mono",
    weight: 700,
    color: P.amber,
    maxSize: 14,
    minSize: 7,
    maxLines: 1,
    align: "center",
    valign: "middle",
  });

  const headline = { role: "display", weight: 700, color: P.ink, maxSize: 92, minSize: 18, lineHeight: 0.98, maxLines: 3, uppercase: true } as const;
  let restCol: Column;
  let photo: Box;
  if (b.landscape) {
    const [left, right] = splitH(body, ["*", body.w * 0.37], 24 * u);
    restCol = column(left);
    photo = right;
    b.flow(restCol, data.title, headline, body.h * 0.44, 14 * u);
  } else {
    const headCol = column(body);
    b.flow(headCol, data.title, headline, body.h * 0.34, 18 * u);
    const lower = { x: body.x, y: headCol.y, w: body.w, h: body.y + body.h - headCol.y };
    const [p, side] = splitH(lower, [lower.w * 0.47, "*"], 22 * u);
    restCol = column(side);
    photo = p;
  }
  const statsBox = reserveBottom(restCol, b.stats().length ? 64 * u : 0, 14 * u);
  b.flow(
    restCol,
    data.memePhrase,
    { role: "display", weight: 700, color: P.paper, highlight: P.red, padX: 10 * u, maxSize: 54, minSize: 14, lineHeight: 1.2, maxLines: 4, uppercase: true },
    (restCol.bottom - restCol.y) * 0.62,
    12 * u,
  );
  b.flow(restCol, data.subtext, { role: "mono", weight: 700, color: P.ink, maxSize: 16, minSize: 9, lineHeight: 1.3, maxLines: 3 }, restCol.bottom - restCol.y, 0);
  statCells(b, statsBox, { fill: P.amber, stroke: P.ink, value: P.ink, label: P.ink, valueRole: "display" });

  const [frame, caption] = splitV(photo, ["*", 24 * u], 6 * u);
  b.rect(frame, "#fffdf5");
  b.frameRect(frame, P.ink, 2 * u);
  b.illustration(inset(frame, 12 * u), { bg: "#2a2622", fg: P.ink, accent: P.red });
  b.texture(inset(frame, 12 * u), "halftone", P.ink, 0.35, { density: Math.round(7 * u), blend: "multiply" });
  const tape = { w: 90 * u, h: 22 * u };
  b.rect({ x: frame.x + 18 * u, y: frame.y + 6 * u, ...tape }, P.amber, { alpha: 0.75, rotate: -0.18 });
  b.rect({ x: frame.x + frame.w - tape.w - 18 * u, y: frame.y + 6 * u, ...tape }, P.amber, { alpha: 0.75, rotate: 0.16 });
  b.text(caption, "PICTURED: THE APPLICANT. ALLEGEDLY.", { role: "mono", weight: 700, color: P.ink, maxSize: 13, minSize: 7, maxLines: 1, align: "center", valign: "middle" });

  const r = 62 * u;
  const cx = frame.x + frame.w - r - 4 * u;
  const cy = frame.y + frame.h * 0.62;
  b.poly(starPoints(cx, cy, r, r * 0.74, 16), { fill: P.amber, stroke: P.ink, lineWidth: 3 * u });
  b.text({ x: cx - r * 0.7, y: cy - r * 0.32, w: r * 1.4, h: r * 0.64 }, "EXCLUSIVE!", {
    role: "display",
    weight: 700,
    color: P.ink,
    maxSize: 26,
    minSize: 8,
    maxLines: 1,
    align: "center",
    valign: "middle",
    rotate: -0.2,
  });

  b.texture({ x: b.width * 0.55, y: b.height * 0.6, w: b.width * 0.45 - 6 * u, h: b.height * 0.4 - 6 * u }, "halftone", P.red, 0.18, {
    density: Math.round(10 * u),
    blend: "multiply",
  });
  b.texture(inset(b.frame, 6 * u), "registration", P.ink, 0.6);
  b.footer(inset(foot, 32 * u, 0), P.ink, P.red);
};

const classified: StyleLayout = (b) => {
  const { data, unit: u } = b;
  const rand = mulberry32(b.seed());
  b.rect(b.frame, P.paper);
  b.texture(b.frame, "grain", P.ink, 0.12);
  b.texture(b.frame, "vignette", "#8a6a2a", 0.4, { blend: "multiply" });
  const ring = 190 * u;
  b.texture({ x: b.width - ring - 40 * u, y: 70 * u, w: ring, h: ring }, "stain", "#7a4f1d", 0.28, { blend: "multiply" });
  const [top, body, foot] = splitV(inset(b.frame, 34 * u), [40 * u, "*", 26 * u], 16 * u);

  b.rect({ x: top.x, y: top.y, w: top.w, h: 3 * u }, P.red);
  b.rect({ x: top.x, y: top.y + top.h - 3 * u, w: top.w, h: 3 * u }, P.red);
  b.text(inset(top, 8 * u, 7 * u), "TOP SECRET // ROMANTIC PERIMETER // EYES ONLY", {
    role: "mono",
    weight: 700,
    color: P.red,
    maxSize: 18,
    minSize: 8,
    maxLines: 1,
    align: "center",
    valign: "middle",
    tracking: 0.12,
  });

  let photoCol: Box;
  let headCol: Column;
  let restCol: Column;
  if (b.landscape) {
    const [p, t] = splitH(body, [body.w * 0.33, "*"], 32 * u);
    photoCol = p;
    headCol = column(t);
    restCol = headCol;
  } else {
    const [upper, lower] = splitV(body, [body.h * 0.44, "*"], 20 * u);
    const [p, h] = splitH(upper, [upper.w * 0.44, "*"], 26 * u);
    photoCol = p;
    headCol = column(h);
    restCol = column(lower);
  }

  const [photo, caption] = splitV(photoCol, [Math.min(photoCol.h - 30 * u, photoCol.w * 1.22), 22 * u], 8 * u);
  b.rect(photo, "#fbf7ea");
  b.frameRect(photo, "#b9ab86", 2 * u);
  b.illustration(inset(photo, 10 * u), { bg: "#cfc4a6", fg: P.ink2, accent: P.ink });
  b.texture(inset(photo, 10 * u), "grain", P.ink, 0.2);
  const clipX = photo.x + photo.w * 0.7;
  b.poly(
    [
      [clipX, photo.y + 40 * u],
      [clipX, photo.y + 6 * u],
      [clipX + 22 * u, photo.y + 6 * u],
      [clipX + 22 * u, photo.y + 52 * u],
      [clipX + 8 * u, photo.y + 52 * u],
      [clipX + 8 * u, photo.y + 18 * u],
    ],
    { stroke: "#6d6d6d", lineWidth: 4 * u, closed: false },
  );
  b.text(caption, "FIG. 1. SUBJECT. DO NOT DATE.", { role: "mono", weight: 700, color: P.ink, maxSize: 13, minSize: 7, maxLines: 1, valign: "middle" });

  b.flow(headCol, `DOSSIER NO. ${fileNumber(data)}`, { role: "mono", weight: 700, color: P.red, maxSize: 15, minSize: 8, maxLines: 1 }, 24 * u, 6 * u);
  b.flow(headCol, "OPERATION", { role: "mono", color: P.ink, alpha: 0.6, maxSize: 12, minSize: 7, maxLines: 1, tracking: 0.2 }, 18 * u, 4 * u);
  b.flow(
    headCol,
    data.title,
    { role: "mono", weight: 700, color: P.ink, maxSize: 38, minSize: 12, lineHeight: 1.15, maxLines: 3, uppercase: true },
    b.landscape ? body.h * 0.26 : headCol.bottom - headCol.y,
    14 * u,
  );

  const fields = b.stats().length ? Math.ceil(b.stats().length / 2) * 50 * u : 0;
  const statsBox = reserveBottom(restCol, fields, 14 * u);
  b.flow(
    restCol,
    data.memePhrase,
    { role: "display", weight: 700, color: P.ink, maxSize: 56, minSize: 16, lineHeight: 1.02, maxLines: 3, uppercase: true },
    (restCol.bottom - restCol.y) * 0.55,
    12 * u,
  );
  const barH = 13 * u;
  for (let i = 0; i < 3 && restCol.bottom - restCol.y > barH * 2 + 40 * u; i++) {
    const offset = rand() * restCol.w * 0.2;
    b.rect({ x: restCol.x + offset, y: restCol.y, w: restCol.w * (0.45 + rand() * 0.35), h: barH }, P.ink);
    restCol.y += barH + 9 * u;
  }
  restCol.y += 4 * u;
  b.flow(restCol, data.subtext, { role: "mono", color: P.ink, maxSize: 16, minSize: 9, lineHeight: 1.3, maxLines: 3 }, restCol.bottom - restCol.y, 0);

  const stats = b.stats();
  if (stats.length) {
    const rows = splitV(statsBox, Array.from({ length: Math.ceil(stats.length / 2) }, () => "*" as const), 4 * u);
    stats.forEach((stat, i) => {
      const cell = splitH(rows[Math.floor(i / 2)], ["*", "*"], 24 * u)[i % 2];
      const [l, v] = splitV(cell, [16 * u, "*"], 2 * u);
      b.text(l, stat.label, { role: "mono", weight: 700, color: P.red, maxSize: 11, minSize: 7, maxLines: 1, uppercase: true, tracking: 0.1 });
      b.text(v, stat.value, { role: "mono", weight: 700, color: P.ink, maxSize: 22, minSize: 8, maxLines: 1, valign: "middle" });
      b.rect({ x: cell.x, y: cell.y + cell.h - 2 * u, w: cell.w, h: 2 * u }, P.ink, { alpha: 0.7 });
    });
  }

  const big = { w: Math.min(b.width * 0.42, 440 * u), h: 104 * u };
  b.stamp(
    { x: b.landscape ? photoCol.x + photoCol.w * 0.55 : b.width - big.w - 70 * u, y: b.landscape ? body.y + body.h * 0.52 : body.y + body.h * 0.3, ...big },
    "CLASSIFIED",
    P.red,
    -0.17,
    80,
  );
  const small = { w: 250 * u, h: 66 * u };
  b.stamp({ x: b.width - small.w - 54 * u, y: b.height - small.h - 74 * u, ...small }, "ROMANCE DENIED", P.red, 0.09, 34);
  b.footer(foot, P.ink, P.red);
};

const boardMemo: StyleLayout = (b) => {
  const { data, unit: u } = b;
  const rand = mulberry32(b.seed());
  b.rect(b.frame, P.paper);
  b.texture(b.frame, "ruled", P.ink, 0.07, { density: Math.round(32 * u) });
  b.texture(b.frame, "grain", P.ink, 0.07);
  const [header, fields, rule, body, foot] = splitV(inset(b.frame, 30 * u), [58 * u, 124 * u, 3 * u, "*", 26 * u], 12 * u);

  b.rect(header, P.ink);
  const [hl, hr] = splitH(inset(header, 16 * u, 10 * u), ["*", header.w * 0.27], 16 * u);
  b.text(hl, "INTERNAL MEMORANDUM // OFFICE OF THE BOARD", {
    role: "display",
    weight: 700,
    color: P.paper,
    maxSize: 32,
    minSize: 10,
    maxLines: 1,
    valign: "middle",
    lineHeight: 1,
  });
  b.rect(hr, P.amber);
  b.text(inset(hr, 8 * u, 3 * u), "PRIORITY: EXISTENTIAL", { role: "mono", weight: 700, color: P.ink, maxSize: 15, minSize: 7, maxLines: 1, align: "center", valign: "middle" });

  const [to, from, re] = splitV(fields, [24 * u, 24 * u, "*"], 4 * u);
  const field = (row: Box, label: string, value: string, bold: boolean, lines: number) => {
    const [l, v] = splitH(row, [84 * u, "*"], 8 * u);
    b.text(l, label, { role: "mono", weight: 700, color: P.red, maxSize: 16, minSize: 8, maxLines: 1 });
    b.text(v, value, {
      role: bold ? "display" : "mono",
      weight: bold ? 700 : 400,
      color: P.ink,
      maxSize: bold ? 30 : 16,
      minSize: 8,
      maxLines: lines,
      lineHeight: bold ? 1.05 : 1.2,
      uppercase: bold,
    });
  };
  field(to, "TO:", "All Shareholders; The Jacket", false, 1);
  field(from, "FROM:", "The Board of Directors, GTC Week 2027", false, 1);
  field(re, "RE:", data.title, true, 2);
  b.rect(rule, P.ink);

  const [memo, side] = b.landscape ? splitH(body, ["*", body.w * 0.38], 26 * u) : splitV(body, ["*", body.h * 0.4], 18 * u);
  const col = column(memo);
  const statsBox = reserveBottom(col, b.stats().length ? 64 * u : 0, 12 * u);
  b.flow(
    col,
    data.memePhrase,
    { role: "display", weight: 700, color: P.ink, highlight: P.amber, padX: 8 * u, maxSize: 58, minSize: 16, lineHeight: 1.12, maxLines: 4, uppercase: true },
    (col.bottom - col.y) * 0.62,
    12 * u,
  );
  b.flow(col, data.subtext, { role: "mono", color: P.ink, maxSize: 16, minSize: 9, lineHeight: 1.3, maxLines: 3 }, (col.bottom - col.y) * 0.7, 8 * u);
  b.flow(col, "The Board. cc: The Jacket (sentience pending review)", { role: "mono", color: P.ink, alpha: 0.65, maxSize: 13, minSize: 7, maxLines: 1 }, 20 * u, 0);
  statCells(b, statsBox, { stroke: P.ink, value: P.ink, label: P.red, valueRole: "display" });

  const [chart, exhibit] = b.landscape ? splitV(side, ["*", side.h * 0.46], 14 * u) : splitH(side, ["*", side.w * 0.38], 14 * u);
  b.rect(chart, P.ink2);
  b.texture(chart, "grid", P.amber, 0.16, { density: Math.round(26 * u) });
  const plot = inset(chart, 14 * u, 30 * u);
  const n = 34;
  const crashAt = Math.floor(n * 0.68);
  const points: Array<[number, number]> = [];
  let level = 0.55;
  for (let i = 0; i < n; i++) {
    level = i < crashAt ? Math.min(0.95, level + 0.012 + (rand() - 0.45) * 0.06) : Math.max(0.04, level - 0.1 - rand() * 0.08);
    points.push([plot.x + (plot.w * i) / (n - 1), plot.y + plot.h * (1 - level)]);
  }
  b.poly([...points, [plot.x + plot.w, plot.y + plot.h], [plot.x, plot.y + plot.h]], { fill: P.red, alpha: 0.22 });
  b.poly(points, { stroke: P.red, lineWidth: 3 * u, closed: false });
  b.text({ x: chart.x + 12 * u, y: chart.y + 8 * u, w: chart.w - 24 * u, h: 18 * u }, "NVDA // INTRADAY // GTC WEEK", {
    role: "mono",
    weight: 700,
    color: P.amber,
    maxSize: 12,
    minSize: 7,
    maxLines: 1,
  });
  b.text({ x: chart.x + 12 * u, y: chart.y + chart.h - 24 * u, w: chart.w - 24 * u, h: 18 * u }, "SHAREHOLDER VALUE: UNDER REVIEW", {
    role: "mono",
    weight: 700,
    color: P.red,
    maxSize: 12,
    minSize: 7,
    maxLines: 1,
    align: "right",
  });

  b.illustration(exhibit, { bg: P.ink2, fg: P.ink, accent: P.amber });
  b.texture(exhibit, "scanlines", P.ink, 0.25, { density: Math.max(3, Math.round(3 * u)) });
  const chip = { x: exhibit.x + 8 * u, y: exhibit.y + 8 * u, w: Math.min(exhibit.w - 16 * u, 110 * u), h: 22 * u };
  b.rect(chip, P.amber);
  b.text(inset(chip, 6 * u, 2 * u), "EXHIBIT A", { role: "mono", weight: 700, color: P.ink, maxSize: 13, minSize: 7, maxLines: 1, align: "center", valign: "middle" });

  const sw = Math.min(memo.w * 0.6, 330 * u);
  const sh = 72 * u;
  b.stamp({ x: memo.x + memo.w - sw - 10 * u, y: memo.y + memo.h * 0.5 - sh / 2, w: sw, h: sh }, "NOT FINANCIAL ADVICE", P.red, 0.08, 36);
  b.footer(foot, P.ink, P.red);
};

const propaganda: StyleLayout = (b) => {
  const { data, unit: u } = b;
  b.rect(b.frame, P.red);
  const d = b.landscape ? b.height * 0.6 : b.width * 0.46;
  const cx = b.landscape ? b.width * 0.74 : b.width / 2;
  const cy = b.landscape ? b.height * 0.5 : 64 * u + d / 2 + 40 * u;
  b.texture(b.frame, "rays", P.ink, 0.3, { density: 28, origin: [cx, cy] });
  b.texture(b.frame, "noise", P.ink, 0.12);

  const banner = { x: 0, y: 0, w: b.width, h: 44 * u };
  b.rect(banner, P.acid);
  b.text(inset(banner, 70 * u, 8 * u), "THE MORE YOU SCREEN, THE MORE YOU SAVE", {
    role: "pixel",
    color: P.ink,
    maxSize: 18,
    minSize: 8,
    maxLines: 1,
    align: "center",
    valign: "middle",
    lineHeight: 1.2,
  });
  b.poly(starPoints(80 * u, banner.h / 2, 14 * u, 6 * u, 5), { fill: P.red });
  b.poly(starPoints(b.width - 80 * u, banner.h / 2, 14 * u, 6 * u, 5), { fill: P.red });

  const ring = { x: cx - d / 2 - 14 * u, y: cy - d / 2 - 14 * u, w: d + 28 * u, h: d + 28 * u };
  b.ellipse(ring, P.ink);
  const medal = { x: cx - d / 2, y: cy - d / 2, w: d, h: d };
  b.illustration(medal, { bg: P.ink2, fg: P.ink, accent: P.acid, clip: "ellipse" });
  b.texture(medal, "halftone", P.red, 0.25, { density: Math.round(9 * u), blend: "multiply", clip: "ellipse" });
  b.ellipse(inset(ring, 4 * u), undefined, { stroke: P.acid, lineWidth: 6 * u });
  b.texture({ x: 0, y: b.height * 0.55, w: b.width, h: b.height * 0.45 }, "halftone", P.ink, 0.22, { density: Math.round(12 * u), blend: "multiply" });
  b.texture(b.frame, "glitch", P.acid, 0.5);

  const footBand = { x: 0, y: b.height - 46 * u, w: b.width, h: 46 * u };
  const textArea = b.landscape
    ? { x: 40 * u, y: banner.h + 26 * u, w: ring.x - 40 * u - 30 * u, h: footBand.y - banner.h - 46 * u }
    : { x: 44 * u, y: ring.y + ring.h + 24 * u, w: b.width - 88 * u, h: footBand.y - (ring.y + ring.h) - 44 * u };
  const col = column(textArea);
  const statsBox = reserveBottom(col, b.stats().length ? 62 * u : 0, 14 * u);
  b.flow(
    col,
    data.title,
    {
      role: "display",
      weight: 700,
      color: P.paper,
      maxSize: 104,
      minSize: 20,
      lineHeight: 0.95,
      maxLines: 3,
      uppercase: true,
      shadow: { color: P.acid, dx: -5 * u, dy: 4 * u },
      align: b.landscape ? "left" : "center",
    },
    (col.bottom - col.y) * 0.5,
    16 * u,
  );
  b.flow(
    col,
    data.memePhrase,
    {
      role: "display",
      weight: 700,
      color: P.acid,
      highlight: P.ink,
      padX: 14 * u,
      maxSize: 38,
      minSize: 13,
      lineHeight: 1.22,
      maxLines: 3,
      uppercase: true,
      align: b.landscape ? "left" : "center",
    },
    (col.bottom - col.y) * 0.7,
    12 * u,
  );
  b.flow(
    col,
    data.subtext,
    { role: "mono", weight: 700, color: P.paper, maxSize: 16, minSize: 9, lineHeight: 1.3, maxLines: 2, align: b.landscape ? "left" : "center" },
    col.bottom - col.y,
    0,
  );
  statCells(b, statsBox, { fill: P.ink, stroke: P.amber, value: P.amber, label: P.paper, valueRole: "pixel" });

  b.texture({ x: 8 * u, y: 8 * u, w: b.width - 16 * u, h: footBand.y - 8 * u }, "registration", P.ink, 0.7);
  b.rect(footBand, P.ink);
  b.footer(inset(footBand, 30 * u, 8 * u), P.paper, P.acid);
};

export const STYLE_LAYOUTS: Readonly<Record<CardStyle, StyleLayout>> = {
  "security-report": securityReport,
  tabloid,
  classified,
  "board-memo": boardMemo,
  propaganda,
};
