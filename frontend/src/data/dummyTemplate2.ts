import type { Template2Data } from "../types/template2";

export const dummyTemplate2: Template2Data = {
  username: "hyup-g",

  name_section: {
    name: "지형",
    english_name: "Hyup_G",
    description1: "Guitarist / Session Guitarist",
    description2:
      "Jazz, Rock, Pop 등 다양한 장르에서 활동하는 세션 기타리스트. 다수의 공연 및 레코딩 세션 경험을 보유하고 있으며, 풍부한 음악적 표현력으로 아티스트들과 협업하고 있습니다.",
    thumbnail_url: "/src/assets/images/template2_thumbnail.png",
    activity_area: "서울 / Seoul",
  },

  album_section: {
    cards: [
      {
        type: "youtube",
        order: 0,
        link: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        project_title: "PERFORMANCE ARCHIVE 01",
        project_subtitle: "2023단마루",
        album_name: "2023단마루",
        composer: "팀플레이/기타 세션",
        year: 2023,
        description: "2023년 단마루 콘서트 공연 영상. 재즈와 팝의 경계를 넘나드는 세션 연주를 담았습니다.",
      },
      {
        type: "youtube",
        order: 1,
        link: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        project_title: "PERFORMANCE ARCHIVE 02",
        project_subtitle: "윤선향&김진욱 공연",
        album_name: "Jazz Pocket",
        composer: "팀플레이/기타 세션",
        year: 2023,
        description: "재즈 피아니스트 윤선향과 색소포니스트 김진욱의 합동 공연. 섬세한 기타 반주로 앙상블을 완성했습니다.",
      },
      {
        type: "image",
        order: 2,
        image_url:
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80",
        hyperlink: "https://music.example.com/gyeoul",
        project_title: "DISCOGRAPHY / SESSION WORK 01",
        project_subtitle: "솔로이스트",
        album_name: "겨울약속",
        composer: "기타",
        category_desc: "세션",
        year: 2023,
        description: "싱어송라이터 솔로이스트의 겨울 감성 싱글. 어쿠스틱 기타 세션으로 참여했습니다.",
      },
      {
        type: "soundcloud",
        order: 3,
        link: "https://soundcloud.com/ohyeahtv/ohi-away",
        project_title: "DISCOGRAPHY / SESSION WORK 02",
        project_subtitle: "조수",
        album_name: "우울한 노래",
        composer: "기타",
        category_desc: "세션",
        year: 2022,
        description: "인디 포크 밴드 조수의 우울한 노래. 일렉 기타 세션으로 참여하여 몽환적인 분위기를 연출했습니다.",
      },
      {
        type: "no_image",
        order: 4,
        project_title: "DISCOGRAPHY / SESSION WORK 03",
        project_subtitle: "JazzPM",
        album_name: "장마도 끝이 날 테니",
        composer: "기타",
        category_desc: "세션",
        year: 2022,
        description: "재즈 퓨전 밴드 JazzPM의 여름 앨범. 세련된 기타 보이싱으로 재즈 감성을 담았습니다.",
      },
    ],
  },

  text_sections: [
    {
      order: 0,
      title: "Band Activity",
      description:
        "현재 활동 중인 밴드 및 프로젝트 유닛 정보입니다.",
      cards: [
        {
          order: 0,
          title: "Jazz Pocket",
          detail: "",
          body_items: [],
        },
        {
          order: 1,
          title: "New Blues",
          detail: "",
          body_items: [],
        },
        {
          order: 2,
          title: "Selection Artist Project",
          detail: "",
          body_items: [],
        },
        {
          order: 3,
          title: "투&심금",
          detail: "",
          body_items: [],
        },
      ],
    },
  ],

  image_sections: [
    {
      order: 0,
      title: "Technical · Production Info",
      description: "",
      images: [
        {
          order: 0,
          image_url:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
        },
        {
          order: 1,
          image_url:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
        },
      ],
    },
  ],

  contact_section: {
    phone1: "010-0000-0000",
    email1: "info@hyupg.com",
    instagram_url: "https://www.instagram.com/hyup_g",
    youtube_url: "https://www.youtube.com/@hyupg",
    extra_description: "Work with ME!",
  },
};
