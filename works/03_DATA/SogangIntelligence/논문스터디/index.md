---
title: Paper Study — RAPO · VISTA · NapMem
title_ko: 논문 스터디
subtitle: Prompt optimization for text-to-video, and active memory for agents
slug: si-paper-study
year: 2026
role: Presenter
summary: 텍스트-비디오 생성의 프롬프트 최적화(RAPO, VISTA)와 장기 기억을 능동적으로 탐색하는 에이전트(NapMem) 논문 발표.
order: 1
links:
  - Slides PDF — RAPO · VISTA |
  - Slides PDF — NapMem |
---

## RAPO · VISTA

**Beyond Simple Prompts: RAG와 피드백 루프를 통한 Text-to-Video 고도화.** 짧고 추상적인 사용자 프롬프트와 비디오 생성 모델 사이의 의미 격차를 줄이는 두 방법을 비교했습니다.

- **RAPO** (생성 전) — 관계 그래프에서 '모델이 잘 아는 표현'을 찾아 프롬프트를 재구성합니다. LaVie의 다중 객체 점수가 37.71% → 64.86%로 올랐고, 프롬프트 길이가 학습 데이터 분포에 가까울 때 성능이 가장 높았습니다.
- **VISTA** (생성 후) — 만든 영상을 직접 보고 시각·음향·문맥 비평으로 프롬프트를 고쳐 다시 생성합니다. 반복할수록 승률이 꾸준히 오르고, 평가자의 66.4%가 VISTA 결과를 선호했습니다.

두 방법은 개입 시점, 학습 필요 여부, 적용 대상, 비용이 서로 달라 수치를 직접 비교할 수는 없습니다. RAPO는 학습 데이터를 알아야 하고, VISTA는 반복 1회에 영상 약 28개를 만들 만큼 비용이 크며 판정 모델에 따라 승률이 크게 흔들린다는 한계를 함께 정리했습니다.

## NapMem

**From Passive Retrieval to Active Memory Navigation.** 사용자 기록을 원본 대화 → 기억 기록 → 주제 트랙 → 사용자 프로필의 4단계 '기억 피라미드'로 구조화하고, 에이전트가 이를 능동적으로 탐색하며 답을 다듬는 방법입니다. 실제 개인화 요구를 다 반영하지 못하는 벤치마크, 잊혀질 권리 같은 프라이버시 대응, 모델 크기에 따른 검증 부족을 한계로 짚었습니다.
