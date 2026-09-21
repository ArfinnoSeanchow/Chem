# Dependency Fix — v3.0.1

The previous package manifest allowed npm to resolve React 19.3.x while `@react-three/fiber@9.7.x` requires `react >=19 <19.3`. That caused `ERESOLVE` during `npm install`.

This build pins React and React DOM to **19.2.8**, which satisfies the Fiber peer range while preserving the existing React Three Fiber / Three.js UI stack.

## Fresh install

Delete any old dependency state first:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm cache verify
npm install
npm run build
npm run test
```

Do not use `--force` or `--legacy-peer-deps`; the dependency tree is intended to resolve normally.
