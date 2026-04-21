import SimpleHeader from "../components/SimpleHeader";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function Privacy() {
  return (
    <>
      <SimpleHeader />
      <main className="min-h-screen bg-white text-gray-800 pt-[64px]">
      <div className="max-w-3xl mx-auto px-6 py-20 space-y-10">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">개인정보처리방침</h1>
          <p className="text-sm leading-relaxed text-gray-600">
            스튜디오세하(StudioSeiHa)(이하 "회사")는 회사가 운영하는 SEIHI(www.seihi.co.kr, 이하 "서비스")를 이용하는
            이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을 준수합니다.
            회사는 본 개인정보처리방침을 통해 이용자의 개인정보가 어떠한 목적과 방식으로 이용되며,
            이를 보호하기 위해 어떠한 조치를 취하고 있는지 안내드립니다.
          </p>
        </div>

        <Section title="제1조 (개인정보의 처리목적)">
          <p className="text-sm text-gray-700">회사는 다음의 목적을 위해 개인정보를 처리합니다.</p>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold">1. 회원가입 및 계정관리</p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>회원 식별 및 본인 확인</li>
                <li>계정 생성 및 로그인 지원</li>
                <li>회원정보 관리 및 서비스 이용 안내</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">2. 서비스 제공</p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>아티스트 프로필 생성 및 관리</li>
                <li>포트폴리오 등록 및 공개 페이지 운영</li>
                <li>개인 링크 및 QR 코드 생성 기능 제공</li>
                <li>맞춤형 기능 및 콘텐츠 제공</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">3. 결제 및 구독관리</p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>유료서비스 결제 처리</li>
                <li>정기결제 관리</li>
                <li>결제 내역 확인 및 환불 처리</li>
                <li>세금계산서, 현금영수증 등 처리</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">4. 고객지원</p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>문의사항 접수 및 응대</li>
                <li>공지사항 전달</li>
                <li>민원 및 분쟁 처리</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">5. 서비스 개선 및 보안</p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>접속 통계 분석</li>
                <li>오류 확인 및 서비스 개선</li>
                <li>부정 이용 방지 및 보안 강화</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section title="제2조 (수집하는 개인정보 항목)">
          <p className="text-sm text-gray-700">회사는 서비스 제공을 위해 다음 정보를 수집할 수 있습니다.</p>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold">1. 회원가입 시</p>
              <p className="mt-1 text-gray-500">필수항목</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>이름 또는 닉네임</li>
                <li>이메일 주소</li>
                <li>비밀번호(암호화 저장)</li>
              </ul>
              <p className="mt-2 text-gray-500">선택항목</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>프로필 사진 / 연락처 / 소개글 / 활동 지역 / SNS 링크</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">2. 프로필 등록 시</p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>경력사항, 포트폴리오 이미지, 영상 링크, 음원 링크, 공연 이력, 직무 및 활동 정보</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">3. 결제 이용 시</p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>결제수단 정보, 결제 승인 정보, 거래번호, 결제 내역</li>
              </ul>
              <p className="mt-1 text-xs text-gray-400">※ 카드번호 등 민감 결제정보는 전자결제대행사(PG사)를 통해 처리되며 회사가 직접 저장하지 않습니다.</p>
            </div>
            <div>
              <p className="font-semibold">4. 자동수집 정보</p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>IP 주소, 쿠키, 브라우저 정보, 기기 정보, 접속 기록, 이용 로그</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section title="제3조 (개인정보의 보유 및 이용기간)">
          <p className="text-sm text-gray-700">회사는 개인정보 수집 및 이용 목적이 달성된 후 지체 없이 파기합니다. 다만 아래의 경우 일정 기간 보관할 수 있습니다.</p>
          <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-gray-700">
            <li>회원정보: 회원 탈퇴 시까지</li>
            <li>계약 또는 청약철회 기록: 5년</li>
            <li>대금결제 및 재화 공급 기록: 5년</li>
            <li>소비자 불만 및 분쟁처리 기록: 3년</li>
            <li>접속기록: 3개월</li>
          </ul>
        </Section>

        <Section title="제4조 (개인정보의 제3자 제공)">
          <p className="text-sm text-gray-700">회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 다음의 경우 예외로 합니다.</p>
          <ol className="list-decimal list-inside ml-2 space-y-1 text-sm text-gray-700">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령에 따라 제출 의무가 있는 경우</li>
            <li>서비스 제공을 위해 필요한 경우</li>
          </ol>
        </Section>

        <Section title="제5조 (개인정보 처리 위탁)">
          <p className="text-sm text-gray-700">회사는 원활한 서비스 제공을 위해 일부 업무를 외부 업체에 위탁할 수 있습니다.</p>
          <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-gray-700">
            <li>전자결제 처리: 포트원, PG사</li>
            <li>이메일 발송: 메일 서비스 제공업체</li>
            <li>서버 및 클라우드 운영: 호스팅KR 또는 클라우드 서비스사</li>
          </ul>
          <p className="text-sm text-gray-500">위탁업체 변경 시 본 방침을 통해 안내합니다.</p>
        </Section>

        <Section title="제6조 (개인정보의 파기)">
          <p className="text-sm text-gray-700">회사는 보유기간 종료 또는 처리 목적 달성 시 개인정보를 지체 없이 파기합니다.</p>
          <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-gray-700">
            <li>전자파일: 복구 불가능한 방식으로 삭제</li>
            <li>종이문서: 분쇄 또는 소각</li>
          </ul>
        </Section>

        <Section title="제7조 (이용자의 권리)">
          <p className="text-sm text-gray-700">이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-gray-700">
            <li>개인정보 열람 요청</li>
            <li>개인정보 수정 요청</li>
            <li>개인정보 삭제 요청</li>
            <li>처리정지 요청</li>
            <li>동의 철회 요청</li>
          </ul>
          <p className="text-sm text-gray-500">요청은 이메일을 통해 접수할 수 있습니다.</p>
        </Section>

        <Section title="제8조 (쿠키의 사용)">
          <p className="text-sm text-gray-700">
            회사는 이용자 편의 제공 및 서비스 개선을 위해 쿠키를 사용할 수 있습니다.
            이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.
          </p>
        </Section>

        <Section title="제9조 (개인정보 보호책임자)">
          <p className="text-sm text-gray-700">개인정보 보호 관련 문의사항은 아래로 연락해주시기 바랍니다.</p>
          <div className="text-sm text-gray-700 space-y-1">
            <p>상호명: StudioSeiHa</p>
            <p>서비스명: SEIHI</p>
            <p>이메일: studioseiha@gmail.com</p>
          </div>
        </Section>

        <Section title="제10조 (개인정보처리방침 변경)">
          <p className="text-sm text-gray-700">
            본 개인정보처리방침은 관련 법령 또는 서비스 운영정책 변경에 따라 수정될 수 있으며,
            변경 시 서비스 내 공지사항을 통해 안내합니다.
          </p>
        </Section>

        <div className="border-t pt-6 text-sm text-gray-500">
          <p>본 개인정보처리방침은 2026년 4월 21일부터 시행합니다.</p>
        </div>
      </div>
    </main>
    </>
  );
}
