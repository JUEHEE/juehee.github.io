---
title: Romance Under the Same Moon
title_ko: AI 음악 — 반달 재해석
subtitle: Bringing a Korean children's song to a global audience with generative AI
slug: ai-music
year: 2026
role: Planning, English lyrics, AI music production (individual)
tools: Suno, UVR (Ultimate Vocal Remover), Kits.ai, Mureka
summary: 글로벌 프로듀서가 되어 한국 동요를 세계에 전하는 과제로, 윤극영의 「반달」(1924)을 영어 가사의 R&B 발라드로 다시 만들고 영화 장면에 입혀 연애 콘텐츠 BGM으로 선보였습니다.
order: 2
cover: https://youtu.be/4xHfgSIi5nk
# 맨 위에 유튜브 영상이 크게 나오고 바로 재생됩니다
info:
  - Course | 디지털방송론
  - Brief | 글로벌 프로듀서가 되어 한국 동요를 세계에 전하기
links:
  - YouTube | https://youtu.be/4xHfgSIi5nk
---

> Though we're under the same moon, I'm still lost without you

## Overview

![프로젝트 개요 — 기획 의도와 핵심 목표](slide-02.jpg "side small")

디지털방송론 수업의 과제는 **글로벌 프로듀서가 되어 한국 동요를 세계에 전하는 것**이었습니다. 저는 윤극영의 「반달」(1924)을 골라, 원곡의 서정은 지키면서 해외 시청자도 공감할 수 있는 연애 리얼리티 프로그램의 BGM으로 다시 만들었습니다.

- 원곡의 문화적 가치를 지킬 것
- 해외 시장을 겨냥해 가사를 의역하고 장르를 바꿀 것
- 실무에서 쓸 수 있는 AI 음악 제작 과정을 만들 것

## Direction

![음악 제작 방향성 — 장르, 분위기, 구조](slide-03.jpg "side right small")

- **목표** — 연애 리얼리티 프로그램에 실제로 넣을 수 있는 BGM
- **장르와 분위기** — Lo-fi Piano + Ambient R&B. 밤, 고요함, 거리감, 여운
- **구조** — Intro → Verse → Hook → Outro (고요 → 회상 → 감정 상승 → 여운)

완성한 곡은 영화 「브레이크 업: 이별 후애」(The Break-Up, 2006)의 이별 장면에 입혔습니다. 곡이 실제 연애 콘텐츠 위에서 감정선을 어떻게 받쳐 주는지 직접 확인해 보기 위해서였습니다.

## Lyrics

![최종 프롬프트 — 영어 가사와 스타일](slide-07.jpg "side small")

가사는 그대로 번역하지 않고, 이별 뒤의 그리움으로 의역했습니다. 하얀 쪽배는 혼자 탄 배(*a boat for one*)가 되고, 계수나무는 그 자리에 남아 기다리는 나무(*a tree left behind*)가 되고, 서쪽 나라로 가는 길은 함께 가던 길(*just like we used to go*)이 됩니다. 마지막에는 같은 달 아래 있어도 길을 잃은 마음으로 끝납니다.

스타일 프롬프트에는 Emotional R&B Ballad, Minimalist Piano Solo, Cinematic Ambient, No Drums, Soft Breathing Vocal처럼 밤의 고요함과 여운을 만드는 말들을 골라 넣었습니다.

## Problem

![기술적 한계와 시도 과정](slide-05.jpg "side right small")

Suno와 Mureka는 감정의 분위기는 잘 맞췄지만, 원곡의 핵심 멜로디를 지키지 못하고 추상적인 소리로 바꿔 버렸습니다. AI가 스스로 곡을 만드는 과정에서 BGM에 꼭 필요한 긴장과 이완의 구조도 무너졌습니다.

- **Suno 에이전트로 직접 생성** → 멜로디 구조가 해체되어 실패
- **Kits.ai 보컬 합성** → 목소리에 이질감이 생겨 실패
- **UVR로 보컬과 반주 분리** → 돌아갈 길을 찾아 성공

## Insight

![핵심 인사이트 — 보컬 처리와 해결 방안](slide-06.jpg "side small")

멜로디가 가장 심하게 무너진 것은 AI가 원곡의 보컬을 직접 '커버'하려 할 때였습니다. 그래서 순서를 바꿨습니다. UVR로 원곡의 반주를 먼저 분리해 멜로디의 뼈대를 붙잡아 두고, AI에게는 그 위에 얹을 감정의 질감만 만들도록 했습니다. 그러자 「반달」의 멜로디를 알아볼 수 있게 남기면서도, 기획한 R&B · Ambient의 분위기를 함께 낼 수 있었습니다.

## Outcome

![최종 결과 및 기획 일치도](slide-08.jpg "side right small")

- **멜로디** — 「반달」의 원형을 알아볼 수 있게 남김
- **장르** — 기획한 R&B · Ambient 질감 구현
- **쓰임** — 연애 콘텐츠의 감정을 받쳐 주는 BGM으로 바로 쓸 수 있는 곡

## How I made it

1. 원곡 고르기 — 해외에 전할 한국 동요로 「반달」을 고르고, 연애 리얼리티 BGM이라는 쓰임을 정함
2. 방향 정하기 — 장르, 분위기, 곡의 구조를 먼저 설계
3. 영어 가사 쓰기 — 원곡의 이미지를 이별 뒤의 그리움으로 의역
4. 생성해 보기 — Suno, Mureka, Kits.ai로 여러 번 생성하며 어디서 무너지는지 확인
5. 반주 분리 — UVR로 원곡의 반주를 분리해 멜로디를 지킴
6. 질감 입히기 — 가사와 스타일 프롬프트로 감정의 질감을 만들어 완성
7. 영상에 입히기 — 영화 장면에 곡을 입혀 실제 BGM처럼 편집하고 유튜브에 공개

## Learnings

처음에는 AI에게 맡기면 곡이 나올 줄 알았습니다. 하지만 AI는 분위기는 금방 맞춰도, 백 년 가까이 불려 온 「반달」의 멜로디는 쉽게 지워 버렸습니다. 원곡을 지키는 일은 결국 사람이 기준을 정하고, 도구를 나눠 쓰며 지켜 내야 하는 일이었습니다.

글로벌 프로듀서라는 역할을 맡아 보니, 다른 나라에 우리 노래를 전한다는 것은 가사를 번역하는 일이 아니라 정서를 옮기는 일이었습니다. 은하수와 쪽배를 이별 뒤의 그리움으로 바꾸면서, 낯선 사람도 같은 달 아래에서 공감할 수 있는 이야기를 찾으려 했습니다.

여러 번 실패하면서 도구마다 잘하는 일과 못하는 일을 구분하게 되었고, 그 사이를 이어 붙일 방법을 찾아가는 과정이 가장 재미있었습니다.
