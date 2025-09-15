---
'@jerryshim/builder': minor
---

### 변경 요약

- **(브레이킹)** `emitDtsMultiple` 시그니처 변경  
  `emitDtsMultiple(entries, distDir, tsconfigPath)` →  
  `emitDtsMultiple(entries, distDir, tsconfigPath, isExternal)`
- `rollup()`에 `external: isExternal` 적용, `rollup-plugin-dts`에 `respectExternal: true` 적용  
  → 외부/워크스페이스 의존성 타입은 **인라인하지 않고** `import('…')` 참조로 유지
- `compilerOptions.preserveSymlinks: true`, `skipLibCheck: true` 추가  
  → pnpm/모노레포 환경에서 심볼릭 링크 경로 안정성 및 빌드 속도 개선
- 결과: 더 작고 안정적인 `.d.ts` 번들(순환/중복 타입 인라인 이슈 감소)

### 왜 이렇게 바뀌었나

- 선언 번들에서 외부 타입을 인라인할 때 발생하던 경로/순환 참조 문제를 완화
- 타입 의존성의 책임을 소비자 쪽(deps/peerDeps)에 명확히 위임
