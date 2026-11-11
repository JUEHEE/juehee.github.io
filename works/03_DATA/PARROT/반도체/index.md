---
title: Semiconductor PVD Rate Prediction
title_ko: 반도체 PVD 증착률 예측
subtitle: EDA & modeling plan for Mo sputter deposition
slug: parrot-pvd
year: 2026
role: Lead & planning
tools: Python, Colab
summary: Sandia National Laboratories의 Mo 스퍼터링 공정 데이터(27개 레시피)로 증착률 예측을 준비한 탐색적 데이터 분석과 모델 설계.
status: In progress
order: 3
hero: false
links:
  - Colab | https://colab.research.google.com/drive/1FUxdruC-vSyxcWiMcfL8QqKtcWTDaX20
  - Notion | https://app.notion.com/p/PRIME-PARROT-PVD-3d00b009e7bd810280ddeed21969d6a8
  - EDA report PDF | Mo PVD EDA 보고서.pdf
---

## Overview

마그네트론 스퍼터링으로 Mo(몰리브덴) 박막을 증착할 때, Power와 Ar Pressure 조건에 따라 증착률이 어떻게 달라지는지 예측하는 것이 목표입니다. Sandia의 공개 데이터(100/500/750 W, 2~23 mTorr, 27개 레시피 × 웨이퍼 3장)를 사전에 합의한 체크리스트와 증착 메커니즘을 기준으로 분석했습니다.

![Power·Pressure에 따른 Thickness, Resistivity, Stress 변화](fig-trends.jpg)

## Data quality

- 사전에 정의한 정상 경향 기준 17개 중 **16개를 충족**했습니다.
- Stoney 식을 거꾸로 풀어 Curvature·Thickness·Stress 기록이 서로 맞는지 행마다 점검했고, 입력 오류 후보는 지우거나 고치지 않고 표시만 해 두었습니다.
- 웨이퍼 3장은 같은 런에서 함께 증착되어 두께를 공유하므로, 분석 단위는 81행이 아니라 **27개 레시피**로 고정했습니다.

## Findings

- 증착률은 설정 Power보다 **실측 Power(V×I)**에 더 비례했습니다.
- Pressure의 효과는 Power에 따라 모양이 달랐습니다 (100·500 W는 14 mTorr 이후 둔화, 750 W는 23 mTorr까지 증가) → Power × Pressure 상호작용.
- 고압에서는 비저항이 10~37배까지 커져, 증착률이 높다고 무조건 좋은 조건은 아니었습니다.

![Power별 Pressure–Deposition Rate 추이](fig-rate.jpg "medium left")

![Power × Pressure 히트맵과 상호작용 그래프](fig-heatmap.jpg)

## Modeling plan

입력은 Power와 Pressure로 제한하고(전압·전류는 실험 후에야 아는 값이라 제외), 교차항이나 log + 2차항 모델을 우선 검토합니다. 레시피 단위 Leave-One-Out과 Power 하나를 통째로 빼는 검증으로 보간·외삽 성능을 따로 평가하고, 서강대 나노팹센터 장비(≤200 W) 조건에 맞춰 보수적으로 예측합니다.
