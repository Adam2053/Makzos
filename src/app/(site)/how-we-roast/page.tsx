import { permanentRedirect } from "next/navigation";

/** How we roast is now part of the story page's flow (review notes): old links land on its section. */
export default function HowWeRoast() {
  permanentRedirect("/about#how-we-roast");
}
