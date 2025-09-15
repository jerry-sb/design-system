# @jerryshim/builder

## 0.4.0

### Minor Changes

- 45a6725: ### 변경 요약
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

## 0.3.0

### Minor Changes

- 775093e: 변경: 선언 파일 생성을 rollup-plugin-dts만으로 수행합니다 (tsc --emitDeclarationOnly는 더 이상 사용하지 않음).

      • 이제 각 엔트리당 단일 번들 .d.ts만 생성됩니다.
      • 추가적인 개별 .d.ts 파일과 .d.ts.map은 기본적으로 생성되지 않습니다.

## 0.2.2

### Patch Changes

- dd7cfc3: eslint rule 수정 및 log -> info로 전부 변경

## 0.2.1

### Patch Changes

- 422a895: CI/CD 워크플로 수정: changesets version/publish 단계 정리

## 0.2.0

### Minor Changes

- 2ed7595: - 커스텀 빌더 `jerry-build` 초기 릴리스: Rollup 기반 번들링, TS/JS/CSS 빌드 지원, CLI 제공.
  - 테마 빌더 `jerry-theme-build` 초기 릴리스: Tailwind v4 토큰 파서, 테마 생성/동기화 명령 제공.
  - 모노레포 빌드/린트 구성 정리 및 퍼블리시 설정 추가.
