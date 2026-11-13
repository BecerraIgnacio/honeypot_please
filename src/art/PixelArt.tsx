import type { CSSProperties } from "react";
import type { PortraitSpec } from "../game/types";
import { type JensenMood, jensenSvg } from "./jensen";
import type { PixelSvg } from "./pixel";
import { portraitSvg } from "./portrait";

const pixelated: CSSProperties = { display: "inline-block", lineHeight: 0, imageRendering: "pixelated" };

/**
 * Renders markup from this module's generators. PixelSvg is a branded string only the
 * generators produce, so arbitrary or user-supplied text cannot reach innerHTML.
 */
export function Pixel({ svg, className, label }: { svg: PixelSvg; className?: string; label?: string }) {
  return (
    <span
      className={className}
      style={pixelated}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function Portrait({
  spec,
  size,
  className,
  label = "Applicant at the checkpoint window",
}: {
  spec: PortraitSpec;
  size?: number;
  className?: string;
  label?: string;
}) {
  return <Pixel svg={portraitSvg(spec, { size })} className={className} label={label} />;
}

export function JensenFace({ mood, size, className }: { mood: JensenMood; size?: number; className?: string }) {
  return <Pixel svg={jensenSvg(mood, { size })} className={className} label={`Jensen, ${mood}`} />;
}
