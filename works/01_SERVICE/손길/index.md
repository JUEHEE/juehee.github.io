---
title: Sonkil
title_ko: 손길
subtitle: Sign language–based remote financial counseling AI
slug: sonkil
year: 2026
period: 2026-1
role: Team lead (planning, data preprocessing, web)
team: 4
tools: MediaPipe, Transformer Encoder, GPT-4o-mini, RAG
summary: 청각장애인이 통역사 없이 수어로 금융 상담을 받을 수 있는 비대면 AI 상담 서비스. 서강대 해커톤 장려상.
featured: true
order: 1
# 맨 위에 영상이 바로 나오도록 큰 대표 이미지(cover.jpg)는 숨깁니다. cover.jpg는 목록·큐브에 쓰여요.
hero: false
info:
  - Course | 빅데이터종합설계 (서강대 AI중심대학사업단)
links:
  - GitHub | https://github.com/mynamepia/Real_Time_Korean_Sign_Language_Translation_System_For_Financail_Counseling
---

![서비스 시연 — 수어로 금융 상담하기](손길 시연 최종 영상.mp4)

## Problem

국내 약 40만 명의 청각장애인은 금융 서비스를 이용할 때 수어통역사와 동행하거나 필담에 의존해야 합니다. 이 과정에서 민감한 자산 정보가 제3자에게 노출되고, 사전 예약과 영업점 방문이라는 시간·공간의 제약 때문에 금융 접근권이 실질적으로 침해되고 있습니다.

## Approach

웹캠 앞에서 수어를 하면 실시간으로 인식해 자연어 문장으로 바꿔 주는 파이프라인을 만들었습니다.

1. **손동작 인식** — MediaPipe로 양손·얼굴·상체 랜드마크 55개(110차원)를 추출
2. **단어 예측** — 최대 80프레임 시퀀스를 Transformer Encoder로 학습해 수어 단어를 분류
3. **문장 생성** — GPT-4o-mini로 단어 시퀀스를 자연스러운 한국어 문장으로 변환 (예: 항상 + 운전 + 천천히 → "항상 천천히 운전하세요.")

데이터는 AI Hub 한국수어 데이터(단어·문장 수어 영상, 2~4초, 5개 촬영 방향)를 사용했습니다.

![기술 검증 — 실시간 수어 인식](손길 시연 영상.mp4 "medium left")

![학술 연구 포스터](손길 학술 연구포스터.png "medium right")

## Outcome

수어 인식 → 단어 예측 → 문장 생성으로 이어지는 금융 상담용 수어-한국어 번역을 구현했습니다. 서강대 해커톤 장려상을 받았습니다.

[작성 필요] 정확도 수치 (포스터의 Test Accuracy 값 확인 후)

## Role

팀장으로서 기획, 데이터 전처리, 웹 구현을 맡았습니다. [작성 필요] 구체적으로 한 일

## Next

- 서비스 화면과 수어 인식 기술을 하나의 서비스로 연결하기
- 스마트글래스의 카메라와 디스플레이로 수어를 인식하고, 상담원의 답변을 AR 자막으로 띄우는 웨어러블 상담으로 확장하기
- 다양한 각도와 복잡한 배경에서도 안정적으로 인식하도록 데이터 증강과 모델 경량화 연구

## Learnings

[작성 필요]
