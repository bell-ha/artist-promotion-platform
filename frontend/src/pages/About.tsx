import SimpleHeader from "../components/SimpleHeader";

export default function About() {
  return (
    <>
      <SimpleHeader />
      <main className="min-h-screen bg-white text-gray-800 pt-[64px]">
      <div className="max-w-3xl mx-auto px-6 py-20 space-y-14">

        {/* 회사소개 */}
        <section className="space-y-4">
          <h1 className="text-2xl font-bold">회사소개</h1>
          <p className="leading-relaxed">
            SEIHI는 스튜디오세하(StudioSeiHa)에서 운영하는 아티스트 전문 포트폴리오 플랫폼입니다.
          </p>
          <p className="leading-relaxed">
            저희는 음악 제작과 다양한 창작 프로젝트를 통해 아티스트와 가까이 호흡해온
            크리에이티브 스튜디오입니다. 실제 창작 현장을 경험해왔기에 아티스트의 고민과 현실을
            누구보다 깊이 이해하고 있습니다.
          </p>
          <p className="leading-relaxed">
            많은 아티스트들은 뛰어난 실력과 경력을 가지고 있음에도 이를 효과적으로 정리하고
            보여줄 공간이 부족해 자신의 가치가 충분히 전달되지 못하는 경우가 많습니다. SEIHI는
            이러한 문제를 해결하고, 아티스트가 더 많은 기회를 만날 수 있도록 기획된 서비스입니다.
          </p>
        </section>

        {/* 아티스트의 가치를 높이는 플랫폼 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">아티스트의 가치를 높이는 플랫폼</h2>
          <p className="leading-relaxed">
            SEIHI는 작업물, 경력, 공연 영상, 활동 이력 등을 하나의 전문적인 페이지에 체계적으로
            정리하여 아티스트의 실력과 전문성이 올바르게 전달될 수 있도록 돕습니다.
          </p>
          <p className="leading-relaxed">또한 사용자 편의를 위해 다음과 같은 기능을 제공합니다.</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 pl-2">
            <li>개인 맞춤형 프로필 링크 제공</li>
            <li>QR 코드 자동 생성 및 간편 공유</li>
            <li>모바일 최적화 지원</li>
            <li>직관적이고 세련된 UI/UX 디자인</li>
          </ul>
          <p className="leading-relaxed">
            이를 통해 공연장, 명함, SNS, 제안서 등 다양한 환경에서 자신을 더욱 전문적으로 소개할 수 있습니다.
          </p>
        </section>

        {/* 창작자를 이해하는 사람들이 만든 서비스 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">창작자를 이해하는 사람들이 만든 서비스</h2>
          <p className="leading-relaxed">SEIHI는 단순한 프로필 제작 서비스가 아닙니다.</p>
          <p className="leading-relaxed">
            창작자의 노력과 결과물이 정당하게 평가받을 수 있도록 돕는 성장 플랫폼입니다.
          </p>
          <p className="leading-relaxed">
            아티스트를 가장 가까이에서 이해해온 사람들이 만든 서비스로서, SEIHI는 아티스트의
            현재를 기록하고 더 큰 미래의 기회로 연결합니다.
          </p>
        </section>

        {/* 사업자 정보 */}
        <section className="border-t pt-10 space-y-2 text-sm text-gray-500">
          <p>상호명 : 스튜디오세하(StudioSeiHa)</p>
          <p>운영서비스명 : SEIHI</p>
          <p>대표자 : 박세영</p>
          <p>사업자등록번호 : 779-11-02814</p>
          <p>주소 : 충청남도 천안시 원성동 505-14 202호</p>
          <p className="pt-2">고객센터 전화 : 010-6507-4456</p>
          <p>이메일 : studioseiha@gmail.com</p>
          <p>CS 운영시간 : 평일 09:00 ~ 18:00</p>
        </section>

      </div>
    </main>
    </>
  );
}
