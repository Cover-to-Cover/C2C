// constants/brand.ts
//
// The logo lives here so swapping the file is a one-line change instead of a
// hunt through every page that renders the header.
import type { DimensionValue } from "react-native";

export const LOGO = require("../assets/images/c2c_logo.png");

// The sizes below are CSS strings rather than numbers measured with
// useWindowDimensions, on purpose. The site is statically prerendered
// ("output": "static"), and during the prerender there is no window, so a
// measured viewport comes out as 0 and the logo is baked into the HTML at
// 0x0. React does not patch mismatched style attributes while hydrating, and
// the client's own first render already computes the right number, so nothing
// ever re-renders to correct the DOM: the logo stays invisible until a
// client-side navigation remounts it. Handing the arithmetic to the browser
// keeps the prerendered HTML correct and drops the layout shift too.
const css = (value: string) => value as unknown as DimensionValue;

// Landing page hero: square, and small enough on narrow or short viewports
// that the hero and the footer still fit without the page needing to scroll.
export const LOGO_HERO_SIZE = css("min(80vw, 50vh, 500px)");

// The clickable logo at the top of the About / Privacy / Support pages.
export const LOGO_HEADER_WIDTH = css("min(70vw, 480px)");
