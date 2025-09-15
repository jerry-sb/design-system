# @jerryshim/theme-builder

## 1.0.0

### Major Changes

- 4f355ac: feat(theme): reverse-theme 지원 추가 및 매핑 동작 업데이트

  변경 사항
  - color @utility는 더이상 제공하지 않습니다. colors-only로 변수 생성만 적용합니다.
  - reverse-theme 옵션을 추가했습니다.
    - `r-` 접두사 테마 변수(`--jerry-r-...`)와 인라인 별칭(`--color-theme-r-...`)이 생성됩니다.
    - base/alpha 각각 독립적으로 설정 가능합니다.
  - 일반 테마 매핑은 해당 변형에 `theme: true` 일 때만 생성되도록 변경했습니다.
    - 이전에는 `theme` 없이도 기본 매핑이 생성되었지만, 이제는 명시적으로 설정해야 합니다.
  - `mono` 팔레트는 기존과 동일하게 alpha 전용이며, reverse-theme도 alpha에만 적용됩니다.
  - 문서(README)를 업데이트했습니다.
    - `var_prefix`/`theme_prefix` 소개, 네이밍/접두사 규칙, theme vs reverse 차이, 예시 추가.

  마이그레이션 가이드
  - 기존 설정에서 기본 매핑이 필요하다면 각 변형( base/alpha )에 `theme: true` 를 추가하세요.
    - 예: `{ colorName: 'green', base: { option: 'all', p3: true, theme: true }, alpha: { option: 'all', p3: true, theme: true } }`
  - 반전 매핑이 필요하면 `'reverse-theme': true` 를 추가하세요.
    - 예: `{ colorName: 'blue', base: { option: 'all', p3: true, 'reverse-theme': true } }`
  - `mono` 는 base가 없고 alpha만 허용됩니다.

  참고
  - theme 변수 접두사: `--jerry-` (reverse: `--jerry-r-`)
  - 인라인 별칭 접두사: `--color-theme-` (reverse: `--color-theme-r-`)

## 0.3.0

### Minor Changes

- 5a74290: radix color black, white를 활용한 mono 관련 tailwind css 변수 및 유틸 추가

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
