---
'@jerryshim/builder': minor
---

변경: 선언 파일 생성을 rollup-plugin-dts만으로 수행합니다 (tsc --emitDeclarationOnly는 더 이상 사용하지 않음).

    • 이제 각 엔트리당 단일 번들 .d.ts만 생성됩니다.
    • 추가적인 개별 .d.ts 파일과 .d.ts.map은 기본적으로 생성되지 않습니다.
