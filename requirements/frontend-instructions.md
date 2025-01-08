# Project Overview
Use this guide to build a web app where users can give a text prompt to generate emoji images using model hosted on Replicate. 

# Features Requirements
- We will use Next.js, Shadcn, Lucid, Supabase, Clerk
- Create a form where users can input a text prompt
- When the user submits the form, the app will generate an emoji image based on the prompt
- Display the generated emoji image on the screen
- Use a model hosted on Replicate to generate the emoji image
- Use a library like lucid or lucid-ai to generate the emoji image
- Have a nice UI/UX & animation when the emoji is blank or generating
- Display all the generated emoji images in a grid
- When hovering over an emoji image, an icon button for download should appear and another icon button for like should appear

# Relevant docs
## how to use Replicate emoji generator model
- Set your Replicate API token in the .env file
- running the model:
```javascript
import Replicate from "replicate";
const replicate = new Replicate();

const input = {
    prompt: "A TOK emoji of a man",
    apply_watermark: false
};

const output = await replicate.run("fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e", { input });

import { writeFile } from "node:fs/promises";
for (const [index, item] of Object.entries(output)) {
  await writeFile(`output_${index}.png`, item);
}
```

# Current file structure
EMOJI-GENERATOR-CURSOR
├── emoji-maker
│   └── .next
├── app
│   ├── fonts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── components/ui
│       ├── button.tsx
│       ├── hover-card.tsx
│       └── input.tsx
├── lib
│   └── utils.ts
├── node_modules
├── requirements
│   └── frontend-instructions.md
├── .eslintrc.json
├── .gitignore
├── components.json
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── tsconfig.json
└── .gitattributes

# Rules
- All new components should go in /components and be named like example-component.tsx unless otherwise specified
- All new pages go in /app
