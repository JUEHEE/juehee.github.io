---
title: Sseure-gaettong
title_ko: 쓰레개똥
subtitle: Where do I throw this?
slug: sseure-gaettong
year: 2026
period: 2026–
role: Planning, UI/UX, development
tools: React, Vite, TypeScript, Tailwind CSS, Leaflet, Supabase
summary: 산책 중 반려견 배변 봉투를 버릴 쓰레기통을 찾아 주는 위치 기반 모바일 웹.
status: In progress
featured: true
order: 2
cover: 쓰레개똥1.jpg
# 휴대폰 세로 화면이라 맨 위 큰 사진은 숨기고, 본문에 나란히 놓습니다.
hero: false
links:
  - Live app | https://sseure-gaettong.vercel.app
  - GitHub | https://github.com/JUEHEE/sseure-gaettong
---

> 개똥은 치웠는데, 어디다 버리지?

## Question

한 손엔 리드줄, 다른 손엔 배변 봉투. 산책 중인 보호자는 급하고, 화면을 오래 볼 수 없습니다. 지금 위치에서 가장 가까운, 실제로 버릴 수 있을 가능성이 높은 쓰레기통은 어디일까요?

![첫 화면](쓰레개똥1.jpg)
![지도와 서비스 지역](쓰레개똥2.jpg)
![가장 가까운 쓰레기통 추천](쓰레개똥3.jpg)
![쓰레기통 등록](쓰레개똥4.jpg)

## Process

푸른수목원(서울 구로구 항동) 주변 도보 20분 생활권(반경 약 1.5km)을 첫 서비스 지역으로 정하고, 현장조사로 쓰레기통 위치와 상태를 직접 기록하고 있습니다. 지역은 행정구역이 아니라 실제 산책 동선을 기준으로 정했습니다.

"배변 봉투를 버려도 되는 곳인지"는 현장 안내문이나 직접 확인한 근거가 있을 때만 표시하고, 그 전까지는 '확인 전'으로 둔다는 데이터 원칙을 세웠습니다. 일반 쓰레기통이라는 이유만으로 버려도 된다고 판단하지 않습니다.

## Outcome

현재 개발 중입니다.

- **지금까지 한 것** — 배포, 지도와 내 위치·서비스 지역 표시, 가장 가까운 추천 1곳 + 대안 2곳, 카카오맵 길찾기 연결, 사진과 현재 위치로 쓰레기통 등록(진행 중)
- **다음에 할 것** — 제보 기능, 현장조사 데이터 입력, 항동 아파트 단지 견주 대상 현장 테스트(게시판 QR로 모집)
