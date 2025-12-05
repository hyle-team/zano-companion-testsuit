import "./app.css";

import { ZanoCompanionProvider } from "./companion";
import { Counter } from "./Counter";
import ZanoLogo from "./zano.svg";

export const App = () => {
  return (
    <ZanoCompanionProvider>
      <div id="screen">
        <div id="header">
          <img src={ZanoLogo} className="logo" alt="Zano logo" />
          <span>Zano Companion Test Suits</span>
        </div>
        <div id="content">
          <Counter />
        </div>
      </div>
    </ZanoCompanionProvider>
  );
};

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `
// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
