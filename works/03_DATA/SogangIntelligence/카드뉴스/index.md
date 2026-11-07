---
title: More Agents, Better Results?
title_ko: AI 카드뉴스 생성 아키텍처 연구 (MAS)
subtitle: Why multi-agent LLM systems fail, and a card-news architecture
slug: si-mas
year: 2026
role: Research, presentation (individual)
summary: 멀티 에이전트 LLM이 복합 과제에서 실패하는 이유를 세 논문으로 분석하고, 이를 바탕으로 AI 카드뉴스 생성 아키텍처를 설계했습니다.
order: 2
links:
  - GitHub | https://github.com/jhCOR/CardNewsGenerator
  - Slides PDF |
---

> More agents, better results? Not necessarily. Better coordination, better results.

## Main claim

복합 과제에서 멀티 에이전트 시스템(MAS)의 성능은 에이전트 수를 늘린다고 보장되지 않습니다. **정보를 어떻게 넘기고, 작업을 어떻게 나누고, 결과를 어떻게 검증하느냐**가 성능을 좌우합니다.

## Papers

- **MAST (NeurIPS)** — 5개 MAS 프레임워크의 150개 이상 태스크를 추적해, 실패를 개별 모델의 성능이 아닌 시스템 수준의 협력 실패로 분류했습니다.
- **PMC (ACL)** — 복잡한 기획 과제를 계층적 하위 과제로 나눠 여러 제약 조건을 동시에 만족하는 비율을 높였습니다 (TravelPlanner 기준 42.68% vs GPT-4 2.92%).
- **Paper2Figure (CVPR)** — 생성 에이전트와 수정 에이전트의 역할을 분리하고 반복 수정해 정확도·미학·완성도를 함께 올렸습니다.

## Architecture

세 논문의 시사점을 카드뉴스 제작에 적용해, 실제로 생길 수 있는 네 가지 실패와 그 해결책을 설계했습니다.

- **자유 텍스트 오염** → 에이전트 사이의 핵심 정보는 자유 텍스트가 아니라 렌더링 값이 명시된 JSON Schema로 전달
- **제약 조건 교착** → 분량·톤앤매너·레이아웃 등 전담 하위 과제로 계층적 분해
- **맥락 파편화** → 생성과 분리된 독립 Reviewer 에이전트가 최종 결과물만 보고 검증
- **시각적 진동** → 수정 반복을 최대 3회로 제한하고, 수렴하지 않으면 안전한 기본 템플릿으로 되돌림
