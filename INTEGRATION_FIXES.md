# Integration fixes for the existing Vite + React + TypeScript Redox app

The existing app uses Vite, so TypeScript should use bundler resolution rather than
Node16/NodeNext resolution.

Use this `tsconfig.json` shape:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

Do NOT convert Vite imports to `.js` just to satisfy TS2835.

For the existing app:

1. `main.tsx`
   - `./App.tsx` -> `./App`
   - `./context/ThemeContext.tsx` -> `./context/ThemeContext`

2. `latexHelper.ts`
   Make `equationToLatex` accept an optional equation:
   ```ts
   export function equationToLatex(equation: string | undefined): string {
     if (!equation) return "";
     // keep the existing implementation here
   }
   ```
   This removes the `string | undefined` errors in ExportModal and HalfReactionSteps.

3. `methodology.tsx`
   Do not place raw `$...$` LaTeX in normal JSX text. For example:
   `Penyeimbangan rasio H⁺ dan H₂O secara deterministik:`
   or render it through the app's actual LaTeX component.

4. Run:
   ```bash
   npx tsc --noEmit
   npm run build
   ```

The standalone engine in this archive has already been compiled and its regression suite
has been executed successfully.

Important: the archive does not contain the user's private UI/source tree because that
source tree was not uploaded in this conversation. It contains the validated redox engine
and the exact integration fixes for the 10 TypeScript errors shown in the terminal.
