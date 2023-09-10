import type { Config } from "tailwindcss";
import Forms from "@tailwindcss/forms";
export default {
  content: [],
  safelist: [
    "grid",
    {
      pattern: /grid-cols-.+/,
    },
    {
      pattern: /grid-rows-.+/,
    },
    {
      pattern: /col-span-.+/,
    },
    {
      pattern: /gap-x-.+/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [Forms],
} satisfies Config;
