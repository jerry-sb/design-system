# @jerryshim/builder

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
