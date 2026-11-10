---
title: SGCC Website Renewal
title_ko: SGCC 웹사이트 리뉴얼
subtitle: Website renewal for Sogang Computer Club
slug: sgcc
year: 2025
period: 2025.03–2025.09
role: Front-end (all pages), UI/UX
tools: SvelteKit (Svelte 5), TypeScript, Tailwind CSS, Figma
summary: 1982년에 창립된 서강대 중앙 컴퓨터 동아리 SGCC의 공식 웹사이트 리뉴얼. 데스크톱·모바일 화면을 설계하고, 프론트엔드 페이지 구현을 맡았습니다.
order: 3
cover: cover.jpg
title_icon: character.png
info:
  - Team | 5명 (프론트엔드 담당)
  - Status | 2025.09 자체 도메인으로 배포 · 현재는 사이트 운영 종료
links:
  - GitHub | https://github.com/HansDavidKim/SGCC-front
---
## Overview

서강대학교 중앙 컴퓨터 동아리 SGCC의 공식 웹사이트를 새로 만들었습니다. 동아리 소개와 모집, 일정, 스터디, 활동 기록이 흩어져 있던 것을 하나의 사이트로 모으고, 처음 동아리를 알아보는 신입생도 휴대폰으로 편하게 둘러볼 수 있게 하는 것이 목표였습니다.

현재는 사이트 운영이 끝나 링크로는 볼 수 없어, 설계한 화면으로 대신 보여 드립니다.

## Desktop

![메인 — 동아리 소개, 소개 영상, 모집 안내](desktop-01-메인.jpg)
![About Us — 인사말](desktop-02-인사말.jpg)
![About Us — SNS](desktop-04-SNS.jpg)
![Notice — 동아리방 · 모집 안내](desktop-05-동아리방-모집안내.jpg)

![Notice — 일정 달력](desktop-06-달력.jpg)
![Community — 피드](desktop-07-피드.jpg)
![Community — 미디어관](desktop-08-미디어관.jpg)
![Community — 신입부원 모집](desktop-09-신입부원모집.jpg)

![404](desktop-12-404.jpg)
![로그인](desktop-10-로그인.jpg)
![회원가입](desktop-11-회원가입.jpg)

## Mobile

![메인 — 첫 화면부터 푸터까지, 메뉴](mobile-01-메인.jpg "wide")

![404 · 회원가입 · 로그인](mobile-10-계정.jpg "wide")

![About Us — 인사말](mobile-02-인사말.jpg)
![About Us — 활동 · 행사](mobile-03-활동.jpg)
![About Us — SNS](mobile-04-SNS.jpg)
![Notice — 동아리방](mobile-05-공지.jpg)

![Notice — 일정 달력](mobile-06-달력.jpg)
![Community — 피드](mobile-07-피드.jpg)
![Community — 미디어관](mobile-08-미디어관.jpg)
![Community — 신입부원 모집](mobile-09-모집.jpg)

## Pages

- **메인** — 동아리 사진 슬라이더, 소개 영상, "초보자들을 위한 사다리"·"협업과 소통의 창" 같은 동아리 소개
- **About Us** — 인사말, 활동, SNS(인스타그램·GitHub)
- **Notice** — 공지사항, 신입부원 모집, 일정 달력
- **Community** — 피드, 미디어관(마크다운으로 쓴 글을 페이지로 보여 줌)
- **Study · Library** — 스터디와 자료
- **로그인 · 회원가입**

## Front-end

프론트엔드 페이지 구현을 맡았습니다. SvelteKit(Svelte 5)과 TypeScript, Tailwind CSS로 데스크톱과 모바일을 함께 맞췄습니다.

- **반응형** — 데스크톱과 모바일의 화면 구성을 따로 설계하고, 같은 내용이 휴대폰에서는 다른 배치로 보이게 했습니다. 모바일에서는 메뉴를 열면 뒤 화면이 스크롤되지 않게 막고, 피드는 모바일 전용 카드로 바꿔 보여 줍니다.
- **일정 달력** — 동아리 일정을 달력에 띄우고, 여러 날에 걸친 일정을 이어서 보여 주며, 월·연도를 넘겨 볼 수 있게 했습니다.
- **공통 컴포넌트** — 헤더·내비게이션, 모바일 메뉴, 이미지 슬라이더, 페이지 제목, 피드 카드처럼 여러 페이지에서 쓰는 부분을 컴포넌트로 나눠 일관되게 만들었습니다.
- **동아리다운 분위기** — 검은 바탕에 네온 느낌의 글자, 서강대학교 전용 서체와 Pretendard를 함께 써서 컴퓨터 동아리의 분위기를 냈습니다.

2025년 9월 자체 도메인을 연결해 실제로 배포했습니다.
