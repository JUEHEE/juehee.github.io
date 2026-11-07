---
title: Popular Article Prediction
title_ko: ML 프로젝트 — 인기 있는 기사 예측
subtitle: Gradient boosting ensemble on online news data
slug: parrot-ml
year: 2026
period: 2026-1
role: Data modeling, presentation
team: 4
tools: LightGBM, XGBoost, CatBoost, Optuna
summary: 온라인 기사 2만 3천여 건의 키워드·콘텐츠 구조·감성 정보로 인기 기사를 예측한 머신러닝 프로젝트. 세 부스팅 모델의 가중치 앙상블로 OOF PR-AUC 0.3320.
order: 6
info:
  - Result | Weighted ensemble OOF PR-AUC 0.3320
links:
  - Slides PDF | ML 프로젝트 발표자료.pdf
---

## Data

학습 데이터 23,644건, 피처 58개. 인기 기사 비율이 16.8%뿐인 불균형 이진 분류 문제라 PR-AUC로 평가했습니다. 일부 변수의 비정상 값(-1)은 지우지 않고 0으로 바꿔 데이터 손실을 줄였습니다.

![데이터 개요 — 요일·카테고리별 인기 비율과 상관관계](slide-data.jpg "medium right")

## Features

원본 피처 그대로 쓰지 않고 29개를 새로 만들었습니다. 성능 기여가 낮은 파생 변수는 다시 뺐습니다.

- **콘텐츠 구조** — 글 길이 대비 이미지 수(img_per_word), 링크 밀도
- **감성과 키워드** — 키워드 인기 × 주관성(kw_sentiment), 긍정·부정 비율
- **품질과 다양성** — 고유 단어 비율, 키워드 품질

## Modeling

LightGBM, XGBoost, CatBoost를 각각 Optuna로 하이퍼파라미터를 탐색한 뒤(3-Fold), 최적 값으로 5-Fold 학습했습니다. 세 모델의 예측을 단순 평균, 가중치 최적화, 스태킹으로 합쳐 비교했고 **가중치 앙상블**을 최종으로 선택했습니다.

- LightGBM 0.3222 / XGBoost 0.3271 / CatBoost 0.3303
- 단순 평균 0.3305 / 스태킹 0.3301 / **가중치 앙상블 0.3320**

![세 모델 성능 비교](slide-models.jpg "medium left")
![앙상블 방식 비교](slide-ensemble.jpg)

## Insights

세 모델의 피처 중요도에서 공통으로 키워드 인기도, 콘텐츠 구조, 감성, 저자의 과거 인기 패턴이 중요하게 나타났습니다. 인기 기사는 고품질 키워드를 쓰고, 이미지·영상을 함께 쓰고, 400~800단어의 중간 길이이고, 주말에 게시되며, 감성의 방향보다 강도가 강한 경향을 보였습니다.

![피처 중요도](slide-importance.jpg)
![인기 기사와 관련 있어 보이는 패턴](slide-patterns.jpg)

> 좋은 피처 × 올바른 튜닝 × 다양한 모델 = 앙상블 시너지

## Limitations

긴 튜닝 시간은 3-Fold와 Early Stopping으로 줄이고, 과적합은 Early Stopping과 정규화로 막았습니다. 다음 단계로 중요도 낮은 피처를 줄이고 새로운 모델을 추가해 볼 수 있습니다.
