import type { Template1Data } from "../types/template1";

export const dummyTemplate1: Template1Data = {
  username: "ham-taeyoung",

  name_section: {
    name: "함태영",
    english_name: "Ham Taeyoung",
    description1: "Music Producer / Artist",
    description2:
      "작곡가, 편곡가, 프로듀서로서 다양한 장르와 프로젝트에 참여해왔습니다. 음악을 통해 감동을 전달하고, 창의적인 협업을 추구합니다.",
    thumbnail_url: "/src/assets/images/template1_thumbnail.png",
  },

  album_section: {
    cards: [
      {
        type: "youtube",
        order: 0,
        link: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        project_title: "FEATURED WORK 01",
        project_subtitle: "대한민국 대마 동요 프로젝트",
        album_name: "Album name",
        composer: "Composer / Arranger",
        category_desc: "",
        year: 2024,
        description:
          "1980년대부터 활동을 시작하여 지금까지 수많은 히트곡을 만들어온 프로듀서. 이 작품은 어린이들을 위한 동요 프로젝트로, 밝고 따뜻한 멜로디로 구성되어 있습니다.",
      },
      {
        type: "soundcloud",
        order: 1,
        link: "https://soundcloud.com/ohyeahtv/ohi-away",
        project_title: "DISCOGRAPHY · PROJECT HISTORY 01",
        project_subtitle: "함태영",
        album_name: "Album name",
        composer: "Composer / Arranger",
        category_desc: "",
        year: 2023,
        description:
          "1990년대를 풍미했던 감성적인 발라드 모음집. 시대를 초월한 멜로디와 서정적인 가사가 인상적인 작품입니다.",
      },
      {
        type: "image",
        order: 2,
        image_url:
          "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80",
        hyperlink: "https://music.example.com/album",
        project_title: "DISCOGRAPHY · PROJECT HISTORY 02",
        project_subtitle: "함태영",
        album_name: "Kids Songs Philippines",
        composer: "Composer / Arranger",
        category_desc: "",
        year: 2022,
        description:
          "필리핀 어린이들을 위해 제작된 동요 앨범. 필리핀 전통 음악 요소와 현대적 감성을 결합한 작품입니다.",
      },
      {
        type: "no_image",
        order: 3,
        project_title: "DISCOGRAPHY · PROJECT HISTORY 03",
        project_subtitle: "Ambient Composition",
        album_name: "Ambient Composition",
        composer: "Solo Composer / Arranger",
        category_desc: "",
        year: 2021,
        description:
          "YouTube 콘텐츠를 위해 제작된 앰비언트 작품 모음. 자연의 소리와 전자음악을 융합하여 차분하고 몰입감 있는 분위기를 연출했습니다.",
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
