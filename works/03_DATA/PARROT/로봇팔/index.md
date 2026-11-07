---
title: Robot Arm — SO-101 ACT
title_ko: 로봇팔 — 테이프를 집어 바구니에 넣기
subtitle: Imitation learning on a real robot with LeRobot
slug: parrot-robot-arm
year: 2026
role: [작성 필요]
tools: LeRobot, ACT, SO-101
summary: SO-101 로봇 팔로 시연을 녹화하고 LeRobot의 ACT 정책을 학습해, 실제 로봇이 노란 테이프를 집어 바구니에 넣도록 만든 프로젝트.
order: 5
info:
  - Result | 15개 시연으로 학습한 모델이 실물 로봇에서 성공
links:
  - GitHub | https://github.com/SunAhKim0430/so101-act-tape-basket
---

![학습에 쓴 시연 에피소드 — 시작 → 잡기 → 들어 올리기 → 놓기 → 복귀](example_episode.jpg)

## Overview

리더·팔로워 두 팔로 사람이 직접 시연을 녹화하고, 그 시연으로 ACT(Action Chunking with Transformers) 정책을 학습해 실제 로봇에서 실행하기까지의 전 과정을 진행했습니다.

## Setup

- 로봇: SO-101 팔로워 + 리더
- 카메라: 앞쪽 위에 고정한 USB 카메라 1대 (640×480, 30fps)
- 작업 문장: *Grab the yellow tape and put in the basket*
- 학습: ACT 기본 설정(ResNet18, VAE), A100 1장에서 50k step 약 35분

## Outcome

15개 시연으로 학습한 모델이 실제 로봇에서 작업에 성공했습니다. 30개 시연 모델은 녹화 도중 카메라가 한 번 움직여 두 가지 화면이 섞였고, 한 화면만 쓴 15개 모델이 실물 시험을 통과했습니다.

## Role

[작성 필요]
