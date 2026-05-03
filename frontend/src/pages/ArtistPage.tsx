/**
 * ArtistPage.tsx — /artist/:username 동적 라우터
 *
 * 흐름:
 *   1. username 파라미터로 GET /profile/:username API 호출 (추후 연동)
 *   2. 응답의 active_template 필드로 Template1 / Template2 분기
 *   3. 현재는 더미데이터 + username으로 분기 (개발용)
 *
 * API 연동 시 이 파일만 수정하면 됨.
 */

import { useParams } from "react-router-dom";
import ArtistTemplate1 from "./ArtistTemplate1";
import ArtistTemplate2 from "./ArtistTemplate2";
import { dummyTemplate1 } from "../data/dummyTemplate1";
import { dummyTemplate2 } from "../data/dummyTemplate2";

// ── TODO: API 연동 후 이 부분을 실제 fetch로 교체 ─
//  const { data, isLoading } = useQuery(["artist", username], () =>
//    fetch(`/api/profile/${username}`).then(r => r.json())
//  );

export default function ArtistPage() {
  const { username } = useParams<{ username: string }>();

  // 개발용: username으로 템플릿 분기
  // 실제 연동 시 → API 응답의 active_template 필드 사용
  if (username === dummyTemplate2.username) {
    return <ArtistTemplate2 data={dummyTemplate2} />;
  }

  // 기본값: Template 1
  return <ArtistTemplate1 data={dummyTemplate1} />;
}
