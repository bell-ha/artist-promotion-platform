import SimpleHeader from "../components/SimpleHeader";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function Terms() {
  return (
    <>
      <SimpleHeader />
      <main className="min-h-screen bg-white text-gray-800 pt-[64px]">
      <div className="max-w-3xl mx-auto px-6 py-20 space-y-12">
        <h1 className="text-2xl font-bold">이용약관</h1>

        {/* 제1장 총칙 */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold border-b pb-2">제1장 총칙</h2>

          <Section title="제1조 (목적)">
            <p className="leading-relaxed text-sm">
              본 약관(이하 "약관")은 스튜디오세하(StudioSeiHa)(이하 "회사")가 운영하는 SEIHI(www.seihi.co.kr, 이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항 등 제반 사항을 규정함을 목적으로 합니다.
            </p>
          </Section>

          <Section title="제2조 (약관의 효력 및 변경)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>본 약관은 서비스 내 게시하거나 기타의 방법으로 공지하고, 회원이 이에 동의함으로써 효력이 발생합니다.</li>
              <li>회사는 관련 법령을 위반하지 않는 범위 내에서 본 약관을 개정할 수 있습니다.</li>
              <li>회사가 약관을 개정하는 경우 시행일 및 개정사유를 명시하여 시행일 7일 전부터 공지합니다. 다만, 회원에게 불리한 내용의 변경은 30일 전에 공지합니다.</li>
              <li>변경된 약관에 동의하지 않는 회원은 서비스 이용을 중단하고 회원탈퇴를 요청할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제3조 (용어의 정의)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>SEIHI(세이하이): 회사가 운영하는 아티스트 전문 포트폴리오 플랫폼 서비스를 의미합니다.</li>
              <li>회원: 본 약관에 동의하고 회사에 가입하여 서비스를 이용하는 자를 말합니다.</li>
              <li>계정: 회원 식별 및 서비스 이용을 위하여 회원이 등록한 이메일 또는 로그인 정보를 말합니다.</li>
              <li>콘텐츠: 회원이 서비스에 등록한 이미지, 영상, 음원, 텍스트, 링크, 경력사항 등 모든 자료를 의미합니다.</li>
              <li>유료서비스: 회사가 별도의 이용요금을 받고 제공하는 구독형 또는 부가 서비스를 말합니다.</li>
            </ol>
          </Section>
        </div>

        {/* 제2장 회원가입 및 이용 */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold border-b pb-2">제2장 회원가입 및 이용</h2>

          <Section title="제4조 (회원가입)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>이용자는 회사가 정한 절차에 따라 회원가입을 신청할 수 있습니다.</li>
              <li>회사는 다음 각 호의 경우 회원가입을 제한하거나 승낙하지 않을 수 있습니다.
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>허위 정보를 기재한 경우</li>
                  <li>타인의 정보를 도용한 경우</li>
                  <li>관련 법령을 위반할 목적으로 가입한 경우</li>
                  <li>서비스 운영에 현저한 지장을 초래하는 경우</li>
                </ul>
              </li>
            </ol>
          </Section>

          <Section title="제5조 (회원정보 관리)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회원은 본인의 계정정보를 정확하게 관리하여야 합니다.</li>
              <li>계정의 도용, 무단 사용 등으로 발생한 손해에 대한 책임은 회원에게 있습니다. 단, 회사의 귀책사유가 있는 경우는 예외로 합니다.</li>
              <li>회원정보 변경 시 회원은 즉시 수정하여야 합니다.</li>
            </ol>
          </Section>

          <Section title="제6조 (회원 탈퇴)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회원은 언제든지 탈퇴를 요청할 수 있으며, 회사는 관련 절차에 따라 처리합니다.</li>
              <li>탈퇴 시 관련 법령 및 개인정보처리방침에 따라 일부 정보는 일정 기간 보관될 수 있습니다.</li>
            </ol>
          </Section>
        </div>

        {/* 제3장 서비스 내용 */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold border-b pb-2">제3장 서비스 내용</h2>

          <Section title="제7조 (서비스 내용)">
            <p className="text-sm text-gray-700">회사는 회원에게 다음 서비스를 제공합니다.</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>아티스트 프로필 생성 및 관리</li>
              <li>포트폴리오 등록(영상, 이미지, 음원, 경력 등)</li>
              <li>개인 맞춤형 페이지 링크 및 QR코드 제공</li>
              <li>유료 구독형 프리미엄 기능</li>
              <li>기타 회사가 정하는 서비스</li>
            </ol>
          </Section>

          <Section title="제8조 (서비스 변경 및 중단)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회사는 운영상, 기술상 필요에 따라 서비스 내용을 변경할 수 있습니다.</li>
              <li>시스템 점검, 장애, 천재지변 등의 사유가 발생한 경우 서비스 제공을 일시 중단할 수 있습니다.</li>
            </ol>
          </Section>
        </div>

        {/* 제4장 유료서비스 및 결제 */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold border-b pb-2">제4장 유료서비스 및 결제</h2>

          <Section title="제9조 (유료서비스)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회사는 서비스의 일부 기능을 유료 구독형 서비스 또는 개별 결제형 서비스로 제공할 수 있습니다.</li>
              <li>유료서비스의 이용요금, 제공 기능, 이용기간 및 혜택은 서비스 내 별도로 안내합니다.</li>
              <li>회사는 운영정책에 따라 유료서비스의 구성 및 요금을 변경할 수 있으며, 변경 시 사전에 공지합니다.</li>
            </ol>
          </Section>

          <Section title="제10조 (결제수단 및 결제방식)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회원은 회사가 제공하는 결제수단(신용카드, 간편결제, 계좌이체 등)을 통해 유료서비스를 결제할 수 있습니다.</li>
              <li>결제는 회사와 제휴된 전자결제대행사(PG사)를 통해 처리될 수 있습니다.</li>
              <li>회원은 결제 정보의 정확성을 유지하여야 하며, 허위 또는 무단 결제에 대한 책임은 회원에게 있습니다.</li>
            </ol>
          </Section>

          <Section title="제11조 (정기결제 및 자동갱신)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>월 구독형 서비스는 회원의 동의 하에 매월 자동으로 결제 및 갱신될 수 있습니다.</li>
              <li>정기결제일은 최초 결제일을 기준으로 동일한 날짜에 청구될 수 있습니다.</li>
              <li>결제일이 존재하지 않는 월의 경우 회사 정책에 따라 말일 또는 인접 영업일에 청구될 수 있습니다.</li>
              <li>회원은 다음 결제 예정일 이전 언제든지 정기결제를 해지할 수 있으며, 해지 시 다음 결제일부터 자동결제가 중단됩니다.</li>
              <li>이미 결제 완료된 이용기간은 해당 기간 종료일까지 이용 가능합니다.</li>
            </ol>
          </Section>

          <Section title="제12조 (결제 실패 및 서비스 제한)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>카드 한도 초과, 유효기간 만료, 잔액 부족 등의 사유로 결제가 실패할 수 있습니다.</li>
              <li>결제 실패 시 회사는 재결제를 시도하거나 회원에게 결제수단 변경을 요청할 수 있습니다.</li>
              <li>일정 기간 결제가 정상 처리되지 않을 경우 유료서비스 이용이 제한될 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제13조 (환불정책)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회원은 결제 후 서비스 이용을 시작하지 않은 경우 관련 법령에 따라 환불을 요청할 수 있습니다.</li>
              <li>디지털 서비스 특성상 유료 기능 사용, 콘텐츠 노출, 프로필 활성화 등 서비스 이용이 개시된 경우 환불 금액은 이용 내역에 따라 제한될 수 있습니다.</li>
              <li>정기결제 상품은 결제 완료 후 현재 이용기간에 대한 중도 환불이 제한될 수 있으며, 다음 결제일부터 해지 적용됩니다.</li>
              <li>회사의 귀책사유로 서비스를 정상 제공하지 못한 경우 남은 기간에 대한 환불 또는 이에 상응하는 보상을 제공할 수 있습니다.</li>
              <li>환불 승인 시 결제수단 취소 또는 회원 명의 계좌 환불 방식으로 처리되며, 처리 기간은 결제사 정책에 따라 달라질 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제14조 (청약철회 및 예외)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회원은 관련 법령이 정하는 범위 내에서 청약철회를 요청할 수 있습니다.</li>
              <li>다음 각 호의 경우 청약철회 또는 환불이 제한될 수 있습니다.
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>회원의 사용 또는 일부 소비로 서비스 가치가 현저히 감소한 경우</li>
                  <li>즉시 사용 가능한 디지털 콘텐츠 제공이 시작된 경우</li>
                  <li>회원 책임 사유로 데이터가 훼손되거나 삭제된 경우</li>
                  <li>별도 고지 후 제공된 할인·프로모션 상품인 경우</li>
                </ul>
              </li>
            </ol>
          </Section>
        </div>

        {/* 제5장 콘텐츠 및 지식재산권 */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold border-b pb-2">제5장 콘텐츠 및 지식재산권</h2>

          <Section title="제15조 (회원 콘텐츠의 권리)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회원이 서비스에 등록한 이미지, 영상, 음원, 텍스트, 링크, 포트폴리오 자료 등 콘텐츠의 저작권 및 소유권은 회원 또는 정당한 권리자에게 있습니다.</li>
              <li>회사는 회원의 콘텐츠에 대한 소유권을 주장하지 않습니다.</li>
              <li>회원은 본인이 등록한 콘텐츠에 대해 적법한 권리를 보유하고 있어야 합니다.</li>
            </ol>
          </Section>

          <Section title="제16조 (콘텐츠 사용허락)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회원은 서비스 운영을 위하여 회사가 다음 범위 내에서 콘텐츠를 사용할 수 있도록 비독점적 이용권을 부여합니다.
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>프로필 페이지 내 게시 및 노출</li>
                  <li>검색 결과, 추천 영역 노출</li>
                  <li>서비스 소개, 기능 홍보 화면 내 표시</li>
                  <li>플랫폼 운영에 필요한 저장, 복제, 전송, 썸네일 생성</li>
                </ul>
              </li>
              <li>회사는 회원의 별도 동의 없이 콘텐츠를 외부 상업 광고 목적으로 판매하거나 제3자에게 양도하지 않습니다.</li>
            </ol>
          </Section>

          <Section title="제17조 (회원의 책임)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회원은 타인의 저작권, 초상권, 상표권, 퍼블리시티권 등을 침해하는 콘텐츠를 등록하여서는 안 됩니다.</li>
              <li>회원 콘텐츠로 인해 민형사상 분쟁이 발생하는 경우 책임은 해당 회원에게 있습니다.</li>
              <li>회사는 권리 침해 신고가 접수되거나 법적 문제가 우려되는 경우 해당 콘텐츠를 임시 차단 또는 삭제할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제18조 (콘텐츠 삭제 및 계정 종료)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회원은 언제든지 본인이 등록한 콘텐츠를 수정 또는 삭제할 수 있습니다.</li>
              <li>회원 탈퇴 시 회원 콘텐츠는 즉시 삭제되거나 관련 법령 및 백업 정책에 따라 일정 기간 보관 후 삭제될 수 있습니다.</li>
              <li>공개 페이지 링크 및 QR코드는 계정 종료 후 비활성화될 수 있습니다.</li>
            </ol>
          </Section>
        </div>

        {/* 제6장 이용제한 및 책임 */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold border-b pb-2">제6장 이용제한 및 책임</h2>

          <Section title="제19조 (이용제한)">
            <p className="text-sm text-gray-700">회사는 회원이 다음 각 호의 어느 하나에 해당하는 경우 사전 통지 후 서비스 이용을 제한하거나 계정을 정지·해지할 수 있습니다. 다만 긴급한 경우 사후 통지할 수 있습니다.</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>본 약관 또는 관련 법령을 위반한 경우</li>
              <li>타인의 개인정보, 계정, 결제수단 등을 도용한 경우</li>
              <li>허위 정보 등록 또는 부정한 방법으로 서비스를 이용한 경우</li>
              <li>타인의 저작권, 초상권, 상표권 등 권리를 침해한 경우</li>
              <li>음란물, 불법정보, 허위사실, 악성코드 등 부적절한 콘텐츠를 등록한 경우</li>
              <li>서비스 운영을 방해하거나 시스템에 과도한 부하를 주는 행위를 한 경우</li>
              <li>결제 대금 연체, 부정결제, 환불 악용 등 거래 질서를 해치는 경우</li>
              <li>기타 회사가 정상적인 서비스 운영이 어렵다고 합리적으로 판단한 경우</li>
            </ol>
          </Section>

          <Section title="제20조 (이용제한 절차)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회사는 경고, 일부 기능 제한, 일시 정지, 영구 이용정지 등의 단계로 조치할 수 있습니다.</li>
              <li>회원은 이용제한 조치에 대해 회사가 정한 절차에 따라 이의를 제기할 수 있습니다.</li>
              <li>회사는 이의신청이 정당하다고 판단되는 경우 지체 없이 제한 조치를 해제할 수 있습니다.</li>
            </ol>
          </Section>
        </div>

        {/* 제7장 면책 및 책임제한 */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold border-b pb-2">제7장 면책 및 책임제한</h2>

          <Section title="제21조 (면책)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회사는 천재지변, 전쟁, 정전, 통신망 장애, 서버 장애, 해킹, 제3자 서비스 장애 등 불가항력적 사유로 인한 서비스 중단에 대하여 책임을 지지 않습니다.</li>
              <li>회사는 회원의 귀책사유로 인한 서비스 이용 장애 또는 손해에 대하여 책임을 지지 않습니다.</li>
              <li>회사는 회원이 서비스에 게시하거나 전송한 정보, 자료, 콘텐츠의 정확성·신뢰성·적법성에 대하여 보증하지 않습니다.</li>
              <li>회사는 회원 상호 간 또는 회원과 제3자 간에 서비스를 매개로 발생한 거래, 협업, 계약, 분쟁 등에 직접 개입하지 않으며 이에 대한 책임을 지지 않습니다.</li>
              <li>회사는 무료로 제공되는 서비스와 관련하여 관련 법령에 특별한 규정이 없는 한 책임을 지지 않습니다.</li>
            </ol>
          </Section>

          <Section title="제22조 (손해배상)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회사 또는 회원이 본 약관을 위반하여 상대방에게 손해를 발생시킨 경우 귀책 있는 당사자는 그 손해를 배상하여야 합니다.</li>
              <li>회사의 책임이 인정되는 경우에도 특별손해, 간접손해, 기대이익 손실 등에 대해서는 회사의 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.</li>
            </ol>
          </Section>
        </div>

        {/* 제8장 분쟁해결 및 관할법원 */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold border-b pb-2">제8장 분쟁해결 및 관할법원</h2>

          <Section title="제23조 (분쟁해결)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>회사는 회원이 제기하는 정당한 의견이나 불만을 성실히 검토하고 합리적인 기간 내 처리하도록 노력합니다.</li>
              <li>회원은 서비스 이용과 관련한 문의, 불만, 피해구제를 회사 고객지원 채널을 통해 신청할 수 있습니다.</li>
              <li>회사와 회원은 분쟁 발생 시 원만한 해결을 위해 상호 협의합니다.</li>
            </ol>
          </Section>

          <Section title="제24조 (준거법 및 관할법원)">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
              <li>본 약관의 해석 및 회사와 회원 간 분쟁에는 대한민국 법률을 적용합니다.</li>
              <li>회사와 회원 간 발생한 소송은 민사소송법 등 관계 법령에 따르며, 별도 규정이 없는 경우 회사 본점 소재지 관할 법원을 1심 관할법원으로 합니다.</li>
            </ol>
          </Section>
        </div>

        {/* 제9장 문의처 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">제9장 문의처</h2>
          <Section title="제25조 (고객지원 및 문의)">
            <div className="text-sm text-gray-700 space-y-1">
              <p>상호명: StudioSeiHa</p>
              <p>서비스명: SEIHI</p>
              <p>대표 이메일: studioseiha@gmail.com</p>
              <p>운영 웹사이트: www.seihi.co.kr</p>
              <p className="pt-2">고객 문의, 환불 요청, 신고 접수 등은 이메일 또는 서비스 내 고객지원 채널을 통해 접수할 수 있습니다.</p>
            </div>
          </Section>
        </div>

        {/* 부칙 */}
        <div className="border-t pt-6 text-sm text-gray-500">
          <p>본 약관은 2026년 4월 21일부터 시행합니다.</p>
        </div>
      </div>
    </main>
    </>
  );
}
