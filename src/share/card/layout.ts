import { CardBuilder } from "./builder";
import { estimateMeasure } from "./fit";
import { STYLE_LAYOUTS } from "./styles";
import { CARD_DIMENSIONS, type CardData, type CardLayout, type CardSize, type Measure } from "./types";

/** Pure: positions every draw operation for the card. Pass the canvas measure for exact fitting. */
export function layoutCard(data: CardData, size: CardSize, measure: Measure = estimateMeasure): CardLayout {
  const { width, height } = CARD_DIMENSIONS[size];
  const builder = new CardBuilder(width, height, data, measure);
  STYLE_LAYOUTS[data.style](builder);
  return { width, height, ops: builder.ops };
}
