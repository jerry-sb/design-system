---
'@jerryshim-ui/flow-dom': minor
---

- **요약**: 싱글톤 인스턴스 레지스트리와 브라우저 글로벌 접근을 추가했습니다.
- **변경 사항**
  - `instances`, `getInstances` 싱글톤 유틸을 새로 내보냅니다.
  - `@jerryshim-ui/flow-dom/global` 서브 경로를 통해 `window.JerryInstances`를 설정합니다.
  - 심볼(`Symbol.for('@jerryshim-ui/flow-dom')`) 기반 저장소를 사용하여 HMR/멀티 번들 환경에서도 단일 레지스트리를 보장합니다.
- **마이그레이션**: 없음. 기존 API는 그대로 작동합니다.
- **참고**: README에 사용법과 타입 보강 예시를 추가했습니다.
