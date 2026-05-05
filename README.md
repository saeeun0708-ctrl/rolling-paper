# 🌸 롤링페이퍼

> 소중한 분께 꽃처럼 피어나는 마음을 모아 선물하는 모바일 웹 서비스

## 📖 프로젝트 소개

여러 사람이 함께 마음을 담은 메시지를 작성하면, 아름다운 수채화 풀숲에 꽃으로 피어납니다. 가정의 달, 어버이날, 스승의날, 생일 등 특별한 날에 소중한 분께 선물하세요.

### 주요 기능
- 🌿 주최자가 방을 만들고 참여자를 초대
- ✏️ 참여자가 꽃 모양을 선택하고 메시지 작성 (이름·수정·삭제 가능)
- 🎁 주최자가 롤링페이퍼를 포장해 열람 링크 발급
- 🌸 받는 분이 풀숲 뷰에서 꽃을 클릭해 메시지 확인
- 📥 이미지(PNG)로 영구 보관
- ⏱️ 90일 후 자동 삭제

---

## 🚀 로컬 실행 방법

### 1. 사전 요구사항
- Node.js 18+ 
- npm 또는 yarn
- Supabase 계정 (무료 플랜 가능)

### 2. 저장소 클론 & 의존성 설치
```bash
git clone https://github.com/saeeun0708-ctrl/rolling-paper.git
cd rolling-paper
npm install
```

### 3. 환경변수 설정
```bash
cp .env.example .env
```

`.env` 파일을 열고 아래 값을 채워넣습니다:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_KAKAO_KEY=your-kakao-js-key
VITE_CONTACT_EMAIL=your-email@example.com
```

### 4. Supabase 데이터베이스 설정
[Supabase Dashboard](https://supabase.com) → SQL Editor에서 아래 마이그레이션 파일을 순서대로 실행:
1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_fix_messages_select.sql`
3. `supabase/migrations/003_host_rpcs.sql`

### 5. 개발 서버 실행
```bash
npm run dev
```
→ http://localhost:5173 에서 확인

---

## ☁️ Vercel 배포 방법

### 방법 1: GitHub 연동 자동 배포 (권장)

1. **GitHub에 코드 올리기**
   - GitHub에서 새 저장소(repository) 생성
   - 코드를 push

2. **Vercel 계정 만들기**
   - [vercel.com](https://vercel.com)에 접속
   - "Sign Up" → GitHub으로 회원가입

3. **프로젝트 연결**
   - Vercel 대시보드 → "Add New Project"
   - GitHub 저장소 선택 → "Import"

4. **환경변수 입력**
   - "Environment Variables" 섹션에서 4개 입력:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_KAKAO_KEY`
     - `VITE_CONTACT_EMAIL`

5. **Deploy 버튼 클릭**
   - 자동으로 빌드 & 배포 완료
   - 이후 main 브랜치에 push할 때마다 자동 재배포

### 방법 2: Vercel CLI 배포
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 카카오 공유 도메인 등록
Vercel 배포 후 [Kakao Developers](https://developers.kakao.com) → 내 앱 → 플랫폼 키 → JavaScript SDK 도메인에 배포 URL 추가

---

## 🌐 도메인 연결 방법

### .com / .co.kr 도메인 연결
1. 도메인 구매 (가비아, 후이즈, Namecheap 등)
2. Vercel 대시보드 → 프로젝트 → Settings → Domains
3. "Add Domain" → 도메인 입력
4. Vercel이 안내하는 DNS 레코드를 도메인 등록업체에 추가
   - CNAME: `www` → `cname.vercel-dns.com`
   - A 레코드: `@` → `76.76.19.19`
5. 5~30분 후 적용 완료

---

## ✏️ 비개발자가 자주 수정하는 것들

| 수정 내용 | 파일 위치 |
|-----------|-----------|
| 욕설 필터 단어 추가 | `src/lib/profanity.ts` |
| 문의 이메일 변경 | `.env`의 `VITE_CONTACT_EMAIL` |
| 이용약관 내용 수정 | `src/pages/Terms.tsx` |
| 개인정보처리방침 수정 | `src/pages/Privacy.tsx` |
| OG 이미지 교체 | `public/og-meadow.png` (1200×630px) |

---

## 🗄️ Supabase 자동 삭제 설정

만료된 롤링페이퍼를 매일 자동 삭제하려면:

1. Supabase Dashboard → Database → Extensions → `pg_cron` 활성화
2. SQL Editor에서 `supabase/migrations/004_auto_delete_cron.sql` 실행

이후 매일 새벽 3시(KST)에 90일이 지난 방이 자동 삭제됩니다.

---

## 🛠 기술 스택

- **프론트엔드**: Vite + React 18 + TypeScript + Tailwind CSS
- **애니메이션**: Framer Motion
- **백엔드**: Supabase (PostgreSQL + RLS)
- **배포**: Vercel
- **이미지 캡처**: html2canvas + dom-to-image
- **카카오 공유**: Kakao SDK

---

## 📋 출시 전 체크리스트

### 필수
- [ ] Supabase 환경변수 설정 완료
- [ ] Kakao SDK 도메인 등록 (배포 URL)
- [ ] 문의 이메일 설정 (`VITE_CONTACT_EMAIL`)
- [ ] 이용약관·개인정보처리방침 내용 확인
- [ ] Supabase pg_cron 자동삭제 설정

### 권장
- [ ] OG 이미지 실제 디자인으로 교체 (`public/og-meadow.png`, 1200×630px)
- [ ] 도메인 연결
- [ ] favicon 커스텀 디자인
- [ ] Supabase 프로젝트 지역 선택 (서울: ap-northeast-2)

---

## 📄 라이선스

개인/비상업 목적으로 자유롭게 사용 가능합니다.
