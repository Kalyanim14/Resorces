🍏 Apple’s Liquid Glass Button

HTML + CSS + Babel + React (TSX) Implementation

This repository contains three different implementations of Apple-style Liquid Glass buttons for the web.

🎥 Preview


https://github.com/user-attachments/assets/f5bc8a20-21d0-4af0-b4b7-ee08e9b14f0c




If the video does not auto-play on GitHub, click the link above to view the preview.

📦 Implementations

1️⃣ glassButtonBabel

Liquid Glass Button implemented using:

HTML

CSS

JavaScript (Babel for backward compatibility)

▶ How to Run
git clone <your-repo-url>

Open the project folder

Run the HTML file directly in your browser

No build setup required.

2️⃣ GlassButtonBabel.tsx

TypeScript + React component version of the Liquid Glass button.

▶ Setup Instructions

Create a React or Next.js app with TypeScript:

npx create-react-app my-app --template typescript
# or
npx create-next-app@latest

Inside your project, create a folder:

/components

Create a file:

GlassButtonBabel.tsx

Paste the component code inside it.

Import and use it in App.tsx.

💻 Example Usage
import { GlassButtonBabel } from "./components/GlassButtonBabel";

export default function App() {
  return (
    <>
      <GlassButtonBabel size={16} mode="bubble" />
      <GlassButtonBabel size={20} mode="bubble" />
      <GlassButtonBabel size={24} mode="bubble" />
      <GlassButtonBabel size={36} mode="bubble" />
      <GlassButtonBabel mode="dock" />
      <GlassButtonBabel mode="pill" />
    </>
  );
}
3️⃣ Index2_Another_type.html

Another variation of the Liquid Glass button effect.

▶ How to Run

Clone the repository

Open Index2_Another_type.html in your browser

✨ Modes Available

bubble

dock

pill

Each mode provides a different liquid glass surface style.

🛠 Tech Used

HTML5

CSS3 (Glassmorphism + Blur Effects)

JavaScript

Babel

React

TypeScript

🎖 Credits

Original inspiration and credit for GlassButtonBabel:

Frontend Masters – Liquid Glass on the Web
https://frontendmasters.com/blog/liquid-glass-on-the-web/
