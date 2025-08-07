### 📦 `internal/` 하위 모듈 구성

| 모듈                           | 설명                       | 사용 예                                    |
| ------------------------------ | -------------------------- | ------------------------------------------ |
| `@design-system/eslint-config` | ESLint 공통 설정 프리셋    | `extends: "@jerry/eslint-config"`          |
| `@design-system/tsconfig`      | TypeScript base 설정       | `extends: "@jerry/tsconfig/tsconfig.json"` |
| `@design-system/builder`       | rollup 기반 빌드 설정 공유 | `require("@jerry/builder")`                |
