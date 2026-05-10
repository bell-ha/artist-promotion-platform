import type { Template1Data } from "../types/template1";

export const dummyTemplate1: Template1Data = {
  username: "ham-taeyoung",

  name_section: {
    name: "함태영",
    english_name: "Ham Taeyoung",
    tagline: "Music Producer / Artist",
    description1: "장면에 최적화된 사운드를 설계합니다",
    description2:
      "새로운 경험을 느끼는 것이 가장 중요하다고 생각합니다.\n소리 뿐만 아니라 시각적으로 융합되어 새로운 경험을 느끼는 것을 지향합니다.\n한 장면을 인식하여 그때의 분위기가 생각나는 것 처럼 모든 음악이 그때의 분위기와 장면을 생각나게 만드는 음악을 합니다.",
    thumbnail_url: "/src/assets/images/template1_thumbnail.png",
  },

  album_section: {
    cards: [
      {
        type: "youtube",
        order: 0,
        link: "https://youtu.be/Y8JFxS1HlDo?si=A4er9toO9-6EzWYA",
        project_title: "FEATURED WORK 01",
        project_subtitle: "대한민국 테마 동요 프로젝트",
        album_name: "Album name",
        composer: "Composer / Arranger",
        category_desc: "Indie",
        year: 2026,
        description:
          "대한민국을 주제로 한 아동용 동요 제작 프로젝트.\n쉬운 멜로디와 안정적인 템포를 기반으로, 전통 악기 활용 버전을 포함한 다변화 편곡 진행.",
      },
      {
        type: "soundcloud",
        order: 1,
        link: "https://soundcloud.com/ipkpjurlpgj1/mp3",
        project_title: "DISCOGRAPHY · PROJECT HISTORY 01",
        project_subtitle: "참여 앨범",
        album_name: "Album name",
        composer: "Composer / Arranger",
        category_desc: "Indie",
        year: 2023,
        description:
          "대한민국을 주제로 한 아동용 동요 제작 프로젝트.\n쉬운 멜로디와 안정적인 템포를 기반으로, 전통 악기 활용 버전을 포함한 다변화 편곡 진행.",
      },
      {
        type: "image",
        order: 2,
        image_url:
          "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80",
        hyperlink: "https://music.example.com/album",
        project_title: "DISCOGRAPHY · PROJECT HISTORY 02",
        project_subtitle: "참여앨범",
        album_name: "Album name",
        composer: "Composer / Arranger",
        category_desc: "Indie",
        year: 2022,
        description:
          "대한민국을 주제로 한 아동용 동요 제작 프로젝트.\n쉬운 멜로디와 안정적인 템포를 기반으로, 전통 악기 활용 버전을 포함한 다변화 편곡 진행.",
      },
      {
        type: "no_image",
        order: 3,
        project_title: "DISCOGRAPHY · PROJECT HISTORY 03",
        project_subtitle: "",
        album_name: "Ambient Composition",
        composer: "Solo Composer / Arranger",
        category_desc: "",
        year: 2021,
        description:
          "Max/MSP를 활용한 사운드 디자인 기반의 앰비언트 음악 제작 및 발매",
      },
    ],
  },

  text_sections: [
    {
      order: 0,
      title: "Collaboration · Clients",
      description:
        "다양한 아티스트 및 제작사와의 음악 활동 및 협업 경험을 안내해드립니다.",
      cards: [
        {
          order: 0,
          title: "㈜배움 Baeum Co., Ltd.",
          detail: "",
          body_items: [
            { order: 0, title: "Project", content: "Children's Song Production Series" },
            { order: 1, title: "Role", content: "Composer / Arranger" },
            { order: 2, title: "Credits", content: "전곡 작사, 작곡, 편곡 (총 30 Tracks)" },
            {
              order: 3,
              title: "Note",
              content:
                "어린이 음악 교육 콘텐츠 제작. 다양한 장르의 동요와 학습 음악을 제작하여 교육 효과를 극대화했습니다.",
            },
          ],
        },
      ],
    },
    {
      order: 1,
      title: "Media · Press",
      description: "",
      cards: [
        {
          order: 0,
          title: "Interview — Hybrid Composition Approach",
          detail: "",
          body_items: [
            { order: 0, title: "Outlet", content: "Music Insight Korea" },
            { order: 1, title: "Date", content: "2021" },
            {
              order: 2,
              title: "Link",
              content: "https://musicinsight.com/interview/ham-taeyoung",
            },
          ],
        },
      ],
    },
    {
      order: 2,
      title: "Technical · Production Info",
      description: "",
      cards: [
        {
          order: 0,
          title: "DAW / Suite",
          detail: "",
          body_items: [
            { order: 0, title: "", content: "Logic Pro, Ableton Live, Pro Tools" },
          ],
        },
        {
          order: 1,
          title: "Game Integration",
          detail: "",
          body_items: [{ order: 0, title: "", content: "UNITY" }],
        },
        {
          order: 2,
          title: "Game Integration",
          detail: "",
          body_items: [{ order: 0, title: "", content: "Unreal" }],
        },
      ],
    },
  ],

  contact_section: {
    phone1: "010-0000-0000",
    phone2: "02-000-0000",
    email1: "info@hamtaeyoung.com",
    email2: "work@hamtaeyoung.com",
    instagram_url: "https://www.instagram.com/ham_taeyoung",
    youtube_url: "https://www.youtube.com/@hamtaeyoung",
    extra_description: "About me!",
  },
};
