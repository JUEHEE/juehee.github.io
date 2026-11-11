---
title: Wildfire Detection Drone
title_ko: 산불 감지 · 소화 페이로드 투하 드론
subtitle: PARROT × MECA AI & drone joint project
slug: parrot-drone
year: 2026
role: Lead & planning
tools: YOLOv8, FLAME dataset, Python
summary: 카메라 영상으로 화재를 탐지하고, 탐지 결과를 드론 제어와 연결해 화재 지점에 소화 페이로드를 투하하는 PARROT × MECA 연합 프로젝트.
status: In progress
order: 2
info:
  - Status | 진행 중
links:
  - GitHub | https://github.com/adeomise/AnomalyDetection
---

## Overview

**현재 진행 중인 프로젝트입니다.** 아래는 지금까지 진행한 내용이며, 결과가 나오는 대로 이어서 업데이트할 예정입니다.

영상 기반 화재 탐지 AI가 핵심인 드론 프로젝트입니다. 카메라 영상 → 화재 탐지 모델 → 바운딩 박스와 신뢰도 → 탐지 판단 → 드론 제어 → 소화 페이로드 투하로 이어지는 흐름을 설계했습니다.

## Process

1. 드론 항공 시점의 통제 소각 영상인 FLAME 데이터셋으로 객체 탐지용 데이터 구축
2. YOLO 형식 데이터셋 구성과 라벨 검수
3. YOLOv8m 기준 모델 학습 후 조별로 모델 개선 실험
4. 스마트폰 영상을 노트북으로 받아 프레임마다 화재를 탐지하는 실시간 추론 (FPS·추론 지연 측정)
5. 탐지 결과를 드론 제어와 연결해 실증

## Role

[작성 필요] 총괄·기획으로서 한 일
