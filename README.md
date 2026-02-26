🍏 Apple’s Liquid Glass Button

Implemented in HTML and TSX

This repository contains three versions of the Liquid Glass Button.

📁 1️⃣ glassButtonBabel

This folder contains the Liquid Glass Button implemented using:

HTML

CSS

Babel (converts modern JavaScript to older versions)

▶ How to Run

Clone the repository

Navigate to the folder

Run the HTML file directly in your browser

📁 2️⃣ GlassButtonBabel.tsx

This is the React + TypeScript (TSX) component version of glassButtonBabel.

▶ How to Use

Create a React or Next.js app with TypeScript

Create a folder named components

Create a file named GlassButtonBabel.tsx

Paste the GlassButtonBabel.tsx code into the file

Import it inside App.tsx

💻 Example Usage
import { GlassButtonBabel } from './GlassButtonBabel';

export default function App() {
  return (
    <>
      <GlassButtonBabel size={16} mode="bubble" />
      <GlassButtonBabel size={20} mode="bubble" />
      <GlassButtonBabel size={24} mode="bubble" />
      <GlassButtonBabel size={36} mode="bubble" />
      <GlassButtonBabel size={36} mode="bubble" />
      <GlassButtonBabel mode="dock" />
      <GlassButtonBabel mode="pill" />
    </>
  );
}
📁 3️⃣ Index2_Another_type.html

Another variation of the Liquid Glass button.

▶ How to Use

Clone the repository

Run the Index2_Another_type.html file

🎖 Credits

Original credit for GlassButtonBabel goes to:
https://frontendmasters.com/blog/liquid-glass-on-the-web/
