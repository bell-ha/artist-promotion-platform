import type { Template2Data } from "../types/template2";

export const dummyTemplate2: Template2Data = {
  username: "hyup-g",

  name_section: {
    name: "지협",
    english_name: "Hyup_G",
    tagline: "Guitarist / Session Guitarist",
    description1: "찰나의 순간에 솔직함과 순수함을 담아내는 손 끝의 진심.",
    description2:
      "기타리스트 지협입니다. 재즈적인 어법을 기반으로 록사운드 중심의 퓨전 재즈, 힙합 재즈를 주로 연주하며 활동 중에 있습니다. Jazz Pocket이라는 팀을 주축으로 활동 중에 있으며, 그 외 뮤지컬과 같은 라이브 세션도 도맡아 하고 있습니다. 엠비언스 사운드, 단순히 화성적인 어법이 아닌 악기가 지닌 물리적인 소리의 잠재력을 항상 염두에 두며 순간의 진심들을 연주에 담아내고자 하고 있습니다.",
    thumbnail_url: "/src/assets/images/template2_thumbnail.png",
    activity_area: "천안",
  },

  album_section: {
    cards: [
      {
        type: "youtube",
        order: 0,
        link: "https://youtu.be/Y8JFxS1HlDo?si=A4er9toO9-6EzWYA",
        project_title: "PERFORMANCE ARCHIVE 01",
        project_subtitle: "",
        album_name: "2023단마루",
        composer: "홍대 KT&G 상상마당",
        category_desc: "Indie",
        year: 2023,
        description: " https://www.youtube.com/watch?v=XnzA_zMbbXg",
      },
      {
        type: "youtube",
        order: 1,
        link: "https://youtu.be/Y8JFxS1HlDo?si=A4er9toO9-6EzWYA",
        project_title: "PERFORMANCE ARCHIVE 02",
        project_subtitle: "",
        album_name: "Jazz Pocket",
        composer: "합정 Hermit",
        category_desc: "Indie",
        year: 2025,
        description: " https://www.youtube.com/watch?v=1SzfhKzIRZs",
      },
      {
        type: "image",
        order: 2,
        image_url:
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80",
        hyperlink: "",
        project_title: "DISCOGRAPHY / SESSION WORK 01",
        project_subtitle: "",
        album_name: "겨울약속",
        composer: "이해솔",
        category_desc: "Indie",
        year: 2023,
        description: "세션참여,수록곡 전곡 참여,녹음 프로젝트등 앨범설명",
      },
      {
        type: "soundcloud",
        order: 3,
        link: "https://soundcloud.com/ipkpjurlpgj1/mp3",
        project_title: "DISCOGRAPHY / SESSION WORK 02",
        project_subtitle: "",
        album_name: "우울한 노래",
        composer: "온새",
        category_desc: "Indie",
        year: 2026,
        description: "세션참여,수록곡 전곡 참여,녹음 프로젝트등 앨범설명",
      },
      {
        type: "no_image",
        order: 4,
        project_title: "DISCOGRAPHY / SESSION WORK 03",
        project_subtitle: "",
        album_name: "장마도 끝이 날 테니",
        composer: "JazzMin",
        category_desc: "Indie",
        year: 2022,
        description: "세션참여,수록곡 전곡 참여,녹음 프로젝트등 앨범설명",
      },
    ],
  },

  text_sections: [
    {
      order: 0,
      title: "Band Activity",
      description: "여러 밴드 프로젝트에 참여하며 다양한 무대와 작업을 경험해왔습니다.",
      cards: [
        { order: 0, title: "Jazz Pocket", detail: "", body_items: [] },
        { order: 1, title: "New Bros", detail: "", body_items: [] },
        { order: 2, title: "Selective Artist Project", detail: "", body_items: [] },
        { order: 3, title: "리듬소망사랑", detail: "", body_items: [] },
      ],
    },
    {
      order: 1,
      title: "Technical · Production Info",
      description: "",
      cards: [
        {
          order: 0,
          title: "Main Guitar",
          detail: "",
          body_items: [
            { order: 0, title: "", content: "Fender Custom Shop 1967 Partscaster (Custom Built)" },
            { order: 1, title: "", content: "Suhr Modern" },
            { order: 2, title: "", content: "Gibson ES-336 '63 Reissue" },
            { order: 3, title: "", content: "Elferink Jesse Van Ruller Archtop" },
          ],
        },
        {
          order: 1,
          title: "Amp",
          detail: "",
          body_items: [
            { order: 0, title: "", content: "(Selected Tube / Digital Amp Setup)" },
            { order: 1, title: "", content: "Pedalboard (as of 2026.02)" },
            { order: 2, title: "", content: "Origin Effects Cali76 MK2" },
            { order: 3, title: "", content: "Jackson Audio Amp Mode" },
            { order: 4, title: "", content: "Klon KTR" },
            { order: 5, title: "", content: "Electronic Audio Experiments Halberd" },
            { order: 6, title: "", content: "Proco Rat '85 White Face Reissue" },
            { order: 7, title: "", content: "MXR MC401 Boost" },
            { order: 8, title: "", content: "Lehle Mono Volume S" },
            { order: 9, title: "", content: "GFI System Synesthesia + Triple Switch" },
            { order: 10, title: "", content: "Source Audio Nemesis Delay ADT" },
            { order: 11, title: "", content: "Strymon Bluesky V2" },
          ],
        },
        {
          order: 2,
          title: "Control System",
          detail: "",
          body_items: [
            { order: 0, title: "", content: "Disaster Area Designs DMC Micro Gen4" },
          ],
        },
        {
          order: 3,
          title: "Recording Environment",
          detail: "",
          body_items: [
            { order: 0, title: "", content: "Professional Studio / Hybrid Setup" },
          ],
        },
        {
          order: 4,
          title: "DAW (as of 2026.02)",
          detail: "",
          body_items: [
            { order: 0, title: "", content: "Cubase 12" },
          ],
        },
        {
          order: 5,
          title: "Power Supply",
          detail: "",
          body_items: [
            { order: 0, title: "", content: "Voodoo Lab Pedal Power 3 Plus" },
            { order: 1, title: "", content: "Pedaltrain Classic 2" },
          ],
        },
        {
          order: 6,
          title: "Audio Interface",
          detail: "",
          body_items: [
            { order: 0, title: "", content: "Focusrite Scarlett Solo 3rd Gen" },
          ],
        },
      ],
    },
  ],

  image_sections: [
    {
      order: 0,
      title: "",
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
