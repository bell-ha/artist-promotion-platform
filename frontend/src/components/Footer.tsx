export default function Footer() {
  return (
    <footer className="bg-[#0d1b2a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* 좌측: 회사 정보 */}
        <div className="space-y-4">
          <p className="text-xl font-bold">StudioSeiha</p>
          <nav className="flex flex-wrap gap-4 text-sm text-gray-300">
            <a href="/about" className="hover:text-white transition-colors">회사소개</a>
            <a href="/terms" className="hover:text-white transition-colors">이용약관</a>
            <a href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</a>
            <a href="/guide" className="hover:text-white transition-colors">이용안내</a>
          </nav>
          <div className="text-sm text-gray-400 space-y-1 pt-2">
            <p>상호명 : 스튜디오세하(StudioSeiHa)</p>
            <p>운영서비스명 : SEIHI</p>
            <p>대표자 : 박세영</p>
            <p>사업자등록번호 : 779-11-02814</p>
            <p>주소 : 충청남도 천안시 원성동 505-14 202호</p>
          </div>
        </div>

        {/* 중앙: 고객센터 */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-base font-semibold">고객센터</p>
            <p className="text-sm text-gray-400">전화 : 010-6507-4456</p>
            <p className="text-sm text-gray-400">이메일 : studioseiha@gmail.com</p>
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold">CS 운영시간</p>
            <p className="text-sm text-gray-400">평일 09:00 ~ 18:00</p>
          </div>
        </div>

        {/* 우측: 계좌정보 */}
        <div className="space-y-2">
          <p className="text-base font-semibold">계좌정보</p>
          <p className="text-sm text-gray-400">은행 : 국민은행</p>
          <p className="text-sm text-gray-400">계좌번호 : 475401-04-251973</p>
          <p className="text-sm text-gray-400">예금주 : 박세영(스튜디오세하)</p>
        </div>

      </div>

      {/* 하단 카피라이트 */}
      <div className="border-t border-white/10 py-4 text-center text-sm text-gray-500">
        © 2026 StudioSeiha. All Rights Reserved.
      </div>
    </footer>
  );
}
