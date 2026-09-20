# Chemly Vercel Build Fix

The supplied Vercel log reports the build failing in:
`src/components/TextToLatexConverter.tsx`

Primary error:
`TS7026: JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists.`

Additional error:
`TS7006: Parameter 'e' implicitly has an 'any' type.`

## Required dependency check

Run:

```bash
npm install
npm install -D @types/react @types/react-dom
npm run build
```

## Required TypeScript setting

`tsconfig.json` uses:

```json
"jsx": "react-jsx"
```

## Event typing

For input elements use:

```tsx
(e: React.ChangeEvent<HTMLInputElement>)
```

For textarea elements use:

```tsx
(e: React.ChangeEvent<HTMLTextAreaElement>)
```

The uploaded material contains the Vercel deployment log, not the complete project source tree. Therefore this package contains the safe configuration fix and instructions, but it cannot honestly include a reconstructed `TextToLatexConverter.tsx` without the actual source file.
