import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../lib/api";
import { useAuthGuard } from "../hooks/useAuthGuard";

type PlanId = "free" | "standard" | "premium";

interface PlanDef {
  id: PlanId;
  name: string;
  priceLabel: string;
  perMonth: string;
  desc: string;
  features: string[];
  highlighted?: boolean;
}

const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "무료",
    perMonth: "",
    desc: "시작하는 아티스트를 위한 기본 플랜",
    features: [
      "포트폴리오 페이지 1개",
      "카드 최대 10개",
      "기본 템플릿 1종",
      "기본 프로필 URL",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    priceLabel: "₩5,900",
    perMonth: "/ 월",
    desc: "활발히 활동하는 아티스트를 위한 플랜",
    features: [
      "포트폴리오 페이지 3개",
      "카드 무제한",
      "모든 템플릿",
      "방문자 통계",
      "기본 프로필 URL",
    ],
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    priceLabel: "₩19,900",
    perMonth: "/ 월",
    desc: "프로 아티스트를 위한 최상위 플랜",
    features: [
      "Standard의 모든 기능",
      "포트폴리오 페이지 무제한",
      "검색 결과 상단 노출",
      "커스텀 프로필 URL",
      "월별 상세 리포트",
      "1:1 이메일 지원",
    ],
  },
];

const PLAN_ORDER: PlanId[] = ["free", "standard", "premium"];

export default function Upgrade() {
  useAuthGuard();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");
  const [loading, setLoading] = useState(true);
  const [confirmPlan, setConfirmPlan] = useState<PlanDef | null>(null);
  const [busy, setBusy] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    axios
      .get(`${BACKEND_URL}/payment/my-plan`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data as { plan: PlanId };
        setCurrentPlan(data.plan);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleAction = (plan: PlanDef) => {
    if (plan.id === currentPlan) return;
    setConfirmPlan(plan);
  };

  const handleConfirm = async () => {
    if (!confirmPlan) return;
    setBusy(true);
    try {
      if (confirmPlan.id === "free") {
        await axios.post(
          `${BACKEND_URL}/payment/cancel`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${BACKEND_URL}/payment/subscribe`,
          { plan: confirmPlan.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setCurrentPlan(confirmPlan.id);
      setConfirmPlan(null);
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert("오류: " + (err.response?.data?.detail || "다시 시도해주세요."));
    } finally {
      setBusy(false);
    }
  };

  const btnLabel = (plan: PlanDef) => {
    if (plan.id === currentPlan) return "현재 플랜";
    const curIdx = PLAN_ORDER.indexOf(currentPlan);
    const planIdx = PLAN_ORDER.indexOf(plan.id);
    return planIdx > curIdx ? "업그레이드" : "다운그레이드";
  };

  const isDowngrade = (plan: PlanDef) => {
    const curIdx = PLAN_ORDER.indexOf(currentPlan);
    const planIdx = PLAN_ORDER.indexOf(plan.id);
    return planIdx < curIdx;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50 text-[14px]">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* 상단 네비 */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-[10px]">
        <div className="max-w-[1200px] mx-auto px-5 h-[58px] flex items-center justify-between">
          <span
            className="font-black tracking-[.12em] text-[17px] cursor-pointer"
            onClick={() => navigate("/")}
          >
            SEIHI
          </span>
          <div className="flex gap-2">
            <button
              className="border border-white/18 bg-white/6 text-white px-[12px] py-[7px] rounded-[6px] cursor-pointer font-extrabold text-[12px] hover:bg-white/12 transition-colors"
              type="button"
              onClick={() => navigate("/mypage")}
            >
              MyPage
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-5 py-[60px]">
        {/* 타이틀 */}
        <div className="text-center mb-[50px]">
          <div className="inline-block text-[11px] font-extrabold tracking-[.22em] text-white/50 mb-[14px] uppercase">
            Subscription
          </div>
          <h1 className="text-[38px] max-md:text-[28px] font-black tracking-[-0.02em] mb-[12px]">
            플랜 업그레이드
          </h1>
          <p className="text-[15px] text-white/55 max-w-[440px] mx-auto leading-[1.7]">
            나의 음악을 더 많은 사람에게 알리세요.<br />
            언제든 플랜을 변경하거나 취소할 수 있어요.
          </p>
        </div>

        {/* 플랜 카드 */}
        <div className="grid grid-cols-3 max-md:grid-cols-1 gap-[16px]">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const downgrade = isDowngrade(plan);
            const label = btnLabel(plan);

            return (
              <div
                key={plan.id}
                className="relative rounded-[20px] p-[28px] flex flex-col"
                style={{
                  border: plan.highlighted
                    ? "1.5px solid rgba(255,255,255,0.35)"
                    : "1px solid rgba(255,255,255,0.10)",
                  background: plan.highlighted
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(255,255,255,0.03)",
                  boxShadow: plan.highlighted
                    ? "0 0 0 1px rgba(255,255,255,0.08), 0 24px 60px rgba(0,0,0,0.5)"
                    : "none",
                }}
              >
                {/* 추천 뱃지 */}
                {plan.highlighted && (
                  <div className="absolute -top-[13px] left-1/2 -translate-x-1/2">
                    <span className="bg-white text-black text-[10px] font-black px-[14px] py-[5px] rounded-full tracking-[.08em]">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* 현재 플랜 뱃지 */}
                {isCurrent && (
                  <div className="absolute top-[16px] right-[16px]">
                    <span className="bg-white/12 text-white/70 text-[10px] font-extrabold px-[10px] py-[4px] rounded-full">
                      현재 플랜
                    </span>
                  </div>
                )}

                {/* 플랜 이름 */}
                <div className="text-[13px] font-extrabold tracking-[.12em] text-white/60 mb-[8px] uppercase">
                  {plan.name}
                </div>

                {/* 가격 */}
                <div className="flex items-end gap-[4px] mb-[6px]">
                  <span className="text-[36px] font-black leading-[1] tracking-[-0.03em]">
                    {plan.priceLabel}
                  </span>
                  {plan.perMonth && (
                    <span className="text-[13px] text-white/45 pb-[3px] font-semibold">
                      {plan.perMonth}
                    </span>
                  )}
                </div>

                {/* 설명 */}
                <p className="text-[12px] text-white/45 leading-[1.6] mb-[24px]">
                  {plan.desc}
                </p>

                {/* 버튼 */}
                <button
                  type="button"
                  className="w-full py-[12px] rounded-[10px] font-black text-[13px] tracking-[.02em] transition-all mb-[24px]"
                  style={
                    isCurrent
                      ? { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", cursor: "default" }
                      : downgrade
                      ? { background: "transparent", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.6)", cursor: "pointer" }
                      : plan.highlighted
                      ? { background: "#fff", color: "#000", cursor: "pointer" }
                      : { background: "rgba(255,255,255,0.10)", color: "#fff", cursor: "pointer" }
                  }
                  disabled={isCurrent}
                  onClick={() => handleAction(plan)}
                >
                  {label}
                </button>

                {/* 기능 목록 */}
                <div className="flex flex-col gap-[10px] mt-auto">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-[9px]">
                      <span className="text-[13px] text-white/60 mt-[1px] flex-none">✓</span>
                      <span className="text-[12px] text-white/75 leading-[1.55]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 하단 안내 */}
        <p className="text-center text-[11px] text-white/30 mt-[40px] leading-[1.8]">
          구독은 매월 자동 갱신됩니다. 다음 결제일 이전에 언제든지 취소할 수 있습니다.<br />
          결제 관련 문의: support@studioseiha.com
        </p>
      </main>

      {/* 확인 모달 */}
      {confirmPlan && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.65)", backdropFilter: "blur(12px)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirmPlan(null); }}
        >
          <div
            className="w-[min(420px,94vw)] rounded-[20px] p-[32px]"
            style={{
              background: "rgba(22,22,22,0.98)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 내용 */}
            {isDowngrade(confirmPlan) ? (
              <>
                <div className="text-[11px] font-extrabold tracking-[.18em] text-white/45 mb-[10px]">DOWNGRADE</div>
                <h2 className="text-[22px] font-black mb-[8px]">{confirmPlan.name} 플랜으로 변경</h2>
                <p className="text-[13px] text-white/55 leading-[1.7] mb-[28px]">
                  {confirmPlan.id === "free"
                    ? "무료 플랜으로 변경하면 현재 구독이 즉시 취소됩니다."
                    : `${confirmPlan.name} 플랜으로 변경됩니다. 일부 기능이 제한될 수 있습니다.`}
                </p>
              </>
            ) : (
              <>
                <div className="text-[11px] font-extrabold tracking-[.18em] text-white/45 mb-[10px]">UPGRADE</div>
                <h2 className="text-[22px] font-black mb-[4px]">{confirmPlan.name} 플랜</h2>
                <div className="flex items-end gap-[4px] mb-[20px]">
                  <span className="text-[32px] font-black leading-[1]">{confirmPlan.priceLabel}</span>
                  {confirmPlan.perMonth && (
                    <span className="text-[13px] text-white/45 pb-[2px]">{confirmPlan.perMonth}</span>
                  )}
                </div>

                {/* Mock 카드 입력 (PortOne 심사용 — 실제 결제 미구현) */}
                <div className="mb-[20px] flex flex-col gap-[10px]">
                  <div>
                    <div className="text-[10px] font-extrabold text-white/45 mb-[6px] tracking-[.1em]">카드 번호</div>
                    <input
                      className="w-full rounded-[10px] px-[14px] py-[11px] text-[13px] outline-none"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
                      placeholder="0000 - 0000 - 0000 - 0000"
                      maxLength={19}
                    />
                  </div>
                  <div className="flex gap-[10px]">
                    <div className="flex-1">
                      <div className="text-[10px] font-extrabold text-white/45 mb-[6px] tracking-[.1em]">유효기간</div>
                      <input
                        className="w-full rounded-[10px] px-[14px] py-[11px] text-[13px] outline-none"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
                        placeholder="MM / YY"
                        maxLength={7}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-extrabold text-white/45 mb-[6px] tracking-[.1em]">CVC</div>
                      <input
                        className="w-full rounded-[10px] px-[14px] py-[11px] text-[13px] outline-none"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
                        placeholder="000"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-white/30 leading-[1.7] mb-[20px]">
                  구독은 매월 자동 갱신되며, 다음 결제일 이전에 언제든지 취소할 수 있습니다.<br />
                  결제는 포트원(PortOne)을 통해 안전하게 처리됩니다.
                </p>
              </>
            )}

            <div className="flex gap-[10px]">
              <button
                type="button"
                className="flex-1 py-[12px] rounded-[10px] font-black text-[13px] border border-white/16 text-white/60 hover:bg-white/6 transition-colors cursor-pointer"
                onClick={() => setConfirmPlan(null)}
                disabled={busy}
              >
                취소
              </button>
              <button
                type="button"
                className="flex-1 py-[12px] rounded-[10px] font-black text-[13px] transition-colors cursor-pointer disabled:opacity-50"
                style={
                  isDowngrade(confirmPlan)
                    ? { background: "rgba(255,255,255,0.10)", color: "#fff" }
                    : { background: "#fff", color: "#000" }
                }
                onClick={handleConfirm}
                disabled={busy}
              >
                {busy ? "처리 중..." : isDowngrade(confirmPlan) ? "변경하기" : "결제하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
