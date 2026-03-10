import type { Passage } from "../exercises";

import { short1 } from "./short1";
import { short2 } from "./short2";
import { short3 } from "./short3";
import { short4 } from "./short4";
import { short5 } from "./short5";
import { medshort1 } from "./medshort1";
import { medshort2 } from "./medshort2";
import { medshort3 } from "./medshort3";
import { medshort4 } from "./medshort4";
import { medshort5 } from "./medshort5";
import { medium1 } from "./medium1";
import { medium2 } from "./medium2";
import { medium3 } from "./medium3";
import { medium4 } from "./medium4";
import { medium5 } from "./medium5";
import { medlong1 } from "./medlong1";
import { medlong2 } from "./medlong2";

export const newPassages: Passage[] = [
  ...short1,
  ...short2,
  ...short3,
  ...short4,
  ...short5,
  ...medshort1,
  ...medshort2,
  ...medshort3,
  ...medshort4,
  ...medshort5,
  ...medium1,
  ...medium2,
  ...medium3,
  ...medium4,
  ...medium5,
  ...medlong1,
  ...medlong2,
];
