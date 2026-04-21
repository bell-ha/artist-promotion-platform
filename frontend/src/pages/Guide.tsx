import SimpleHeader from "../components/SimpleHeader";

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">{num}. {title}</h2>
      {children}
    </section>
  );
}

export default function Guide() {
  return (
    <>
      <SimpleHeader />
      <main className="min-h-screen bg-white text-gray-800 pt-[64px]">
      <div className="max-w-3xl mx-auto px-6 py-20 space-y-12">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">서비스 이용안내</h1>
          <p className="text-sm leading-relaxed text-gray-600">
            SEIHI는 아티스트, 퍼포머, 창작자를 위한 전문 포트폴리오 플랫폼입니다.
            회원은 자신의 작업물과 경력을 체계적으로 정리하고, 전문적인 프로필 페이지를 통해
            더 많은 기회와 연결될 수 있습니다.
          </p>
        </div>

        <Section num="1" title="회원가입 및 계정 생성">
          <p className="text-sm text-gray-700">SEIHI 서비스는 회원가입 후 이용하실 수 있습니다.</p>
          <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-gray-700">
            <li>이메일 또는 제공되는 로그인 방식으로 가입 가능</li>
            <li>가입 후 개인 계정 생성</li>
            <li>마이페이지에서 정보 수정 가능</li>
          </ul>
          <p className="text-sm text-gray-500">회원은 정확한 정보를 입력하여야 하며, 타인의 정보를 도용할 수 없습니다.</p>
        </Section>

        <Section num="2" title="프로필 페이지 생성">
          <p className="text-sm text-gray-700">회원가입 후 자신만의 아티스트 프로필 페이지를 만들 수 있습니다.</p>
          <p className="text-sm text-gray-600">등록 가능한 정보 예시:</p>
          <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-gray-700">
            <li>프로필 사진</li>
            <li>소개 문구</li>
            <li>활동 분야 / 직무</li>
            <li>경력 사항</li>
            <li>프로젝트 이력</li>
            <li>공연 영상 링크</li>
            <li>음원 링크</li>
            <li>SNS 계정 링크</li>
          </ul>
          <p className="text-sm text-gray-500">작성된 프로필은 외부에 공유 가능한 전용 페이지로 제공됩니다.</p>
        </Section>

        <Section num="3" title="개인 링크 및 QR 코드 제공">
          <p className="text-sm text-gray-700">회원에게는 고유 프로필 링크와 QR 코드가 제공될 수 있습니다.</p>
          <p className="text-sm text-gray-600">활용 예시:</p>
          <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-gray-700">
            <li>공연장 및 행사 현장 소개</li>
            <li>명함 / 포스터 / 리플렛 삽입</li>
            <li>SNS 프로필 연결</li>
            <li>제안서 및 협업 문의 전달</li>
          </ul>
          <p className="text-sm text-gray-500">보다 쉽고 전문적으로 자신을 소개할 수 있습니다.</p>
        </Section>

        <Section num="4" title="구독 서비스 안내">
          <p className="text-sm text-gray-700">SEIHI는 일부 기능을 유료 구독 형태로 제공할 수 있습니다.</p>
          <p className="text-sm text-gray-600">예상 제공 기능:</p>
          <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-gray-700">
            <li>고급 프로필 디자인 기능</li>
            <li>추가 콘텐츠 업로드</li>
            <li>노출 강화 기능</li>
            <li>프리미엄 관리 기능</li>
            <li>향후 신규 기능 우선 제공</li>
          </ul>
          <p className="text-sm text-gray-500">요금제 및 혜택은 서비스 내 별도로 안내됩니다.</p>
        </Section>

        <Section num="5" title="결제 및 해지 안내">
          <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-gray-700">
            <li>구독 서비스는 월 단위 결제로 운영될 수 있습니다.</li>
            <li>정기결제 상품은 회원 동의 후 자동 갱신될 수 있습니다.</li>
            <li>언제든지 다음 결제일 이전 해지가 가능합니다.</li>
            <li>환불은 이용약관 및 환불정책에 따라 처리됩니다.</li>
          </ul>
        </Section>

        <Section num="6" title="콘텐츠 등록 유의사항">
          <p className="text-sm text-gray-700">회원은 본인이 권리를 보유한 콘텐츠만 등록하여야 합니다.</p>
          <p className="text-sm text-gray-600">등록 제한 예시:</p>
          <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-gray-700">
            <li>타인의 저작권 침해 자료</li>
            <li>무단 촬영 영상</li>
            <li>허위 경력 기재</li>
            <li>불법·유해 콘텐츠</li>
          </ul>
          <p className="text-sm text-gray-500">위반 시 콘텐츠 삭제 또는 이용 제한이 될 수 있습니다.</p>
        </Section>

        <Section num="7" title="서비스 이용 문의">
          <div className="text-sm text-gray-700 space-y-1">
            <p>상호명: StudioSeiHa</p>
            <p>서비스명: SEIHI</p>
            <p>이메일: studioseiha@gmail.com</p>
          </div>
        </Section>

        <Section num="8" title="앞으로의 서비스 확장">
          <p className="text-sm leading-relaxed text-gray-700">
            SEIHI는 단순한 프로필 서비스를 넘어, 향후 아티스트 간 네트워킹, 협업 매칭, 커뮤니티,
            프로젝트 연결 기능 등 창작자를 위한 다양한 서비스로 확장될 예정입니다.
          </p>
          <p className="text-sm font-medium text-gray-800">SEIHI는 아티스트의 가치를 더 높이는 플랫폼이 되겠습니다.</p>
        </Section>
      </div>
    </main>
    </>
  );
}
