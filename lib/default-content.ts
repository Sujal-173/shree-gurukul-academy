import type { SiteContent } from "@/lib/types";

export const defaultContent: SiteContent = {
  navigation: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Academics", href: "/academics" },
    { label: "Admissions", href: "/admission" },
    { label: "Facilities", href: "/facilities" },
    { label: "Notice Board", href: "/notices" },
    { label: "Gallery", href: "/gallery" },
    { label: "Vision & Mission", href: "/vision" },
    { label: "Contact", href: "/contact" },
  ],
  footer: {
    description:
      "Nurturing learning, curiosity, confidence and respect. Let’s work together to support each child’s next step.",
    quickLinksTitle: "Quick Links",
    informationLinksTitle: "Information",
    contactTitle: "Contact Details",
    quickLinks: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Academics", href: "/academics" },
      { label: "Admissions", href: "/admission" },
      { label: "Facilities", href: "/facilities" },
    ],
    informationLinks: [
      { label: "Notice Board", href: "/notices" },
      { label: "Photo Gallery", href: "/gallery" },
      { label: "Vision & Mission", href: "/vision" },
      { label: "School Disclosure", href: "/disclosure" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  brand: {
    name: "Shri Gurukul Academy",
    shortName: "Gurukul Academy",
    subtitle: "NEW LEPA",
    tagline: "Learning with values. Growing with confidence.",
    gradeRange: "Classes 1–10",
    phone: "7247371421",
    email: "gurukulacedmynewlepa@gmail.com",
    whatsapp: "917247371421",
    address: "New Lepa, Kasrawad, Khargone, Madhya Pradesh 451228",
    instagram: "https://www.instagram.com/shri_gurukul_academy_new_lepa/",
    logoUrl: "/images/crest.svg",
    mapQuery:
      "Shri Gurukul Academy New Lepa, New Lepa, Kasrawad, Khargone, Madhya Pradesh 451228",
    enquiryLabel: "Enquiry Now",
    enquiryHref: "/admission#enquiry",
  },
  home: {
    hero: [
      {
        eyebrow: "SHRI GURUKUL ACADEMY · NEW LEPA",
        title: "A strong foundation",
        highlight: "for a brighter future.",
        subtitle:
          "An encouraging place for students to learn, ask questions, build good habits and discover what they can become.",
        image: "/images/campus-illustration.png",
        alt: "Illustrative school campus with green trees and a welcoming entrance; replace with an official academy photograph.",
        primaryLabel: "Enquire for Admission",
        primaryHref: "/admission#enquiry",
        secondaryLabel: "Discover Our Academy",
        secondaryHref: "/about",
      },
      {
        eyebrow: "CLASSES 1–10",
        title: "Curiosity leads",
        highlight: "to discovery.",
        subtitle:
          "Build strong learning habits through thoughtful teaching, practice, questions and shared experiences.",
        image: "/images/learning-together.webp",
        alt: "Illustrative scene of school students learning together around a table.",
        primaryLabel: "Explore Academics",
        primaryHref: "/academics",
        secondaryLabel: "Get in Touch",
        secondaryHref: "/contact",
      },
      {
        eyebrow: "LEARNING BY EXPLORING",
        title: "Understand more.",
        highlight: "Imagine further.",
        subtitle:
          "Encourage students to observe, experiment, express ideas and approach challenges with an open mind.",
        image: "/images/creative-arts.webp",
        alt: "Illustrative image of students making a colorful classroom arts-and-crafts project.",
        primaryLabel: "Our Approach",
        primaryHref: "/vision",
        secondaryLabel: "School Life",
        secondaryHref: "/school-life",
      },
      {
        eyebrow: "CONFIDENCE · TEAMWORK · RESPECT",
        title: "Every child has",
        highlight: "room to grow.",
        subtitle:
          "Learning is also about cooperation, resilience, creativity and the confidence to try again.",
        image: "/images/school-assembly.webp",
        alt: "Illustrative outdoor school assembly with students gathered together.",
        primaryLabel: "Explore School Life",
        primaryHref: "/school-life",
        secondaryLabel: "View Gallery",
        secondaryHref: "/gallery",
      },
    ],
    heroCaptionTitle: "Learning. Values. Growth.",
    heroCaptionSubtitle: "Every step matters.",
    heroLocationLabel: "NEW LEPA · MADHYA PRADESH",
    quickLinks: [
      {
        label: "Admissions",
        description: "Ask about the admission process",
        href: "/admission#enquiry",
        icon: "graduation-cap",
      },
      {
        label: "Notice Board",
        description: "Announcements and updates",
        href: "/notices",
        icon: "bell",
      },
      {
        label: "Photo Gallery",
        description: "Explore school-life visuals",
        href: "/gallery",
        icon: "images",
      },
      {
        label: "Contact Us",
        description: "Speak with the school office",
        href: "/contact",
        icon: "map-pin",
      },
    ],
    introEyebrow: "ABOUT OUR ACADEMY",
    introTitle: "Learning that goes beyond the classroom.",
    introBody:
      "Shri Gurukul Academy New Lepa serves families in Lepa, Kasrawad, Khargone, with classes listed from 1 to 10. Contact the school directly to confirm current curriculum, admission availability, fees, timings and facilities.",
    introPoints:
      "Learning with purpose\nValues and respect\nClasses 1–10\nFamily partnership",
    introButtonLabel: "More About Our Academy",
    introButtonHref: "/about",
    introImage: "/images/library-reading.webp",
    introAlt:
      "Illustrative students reading books together in a school library.",
    highlightsEyebrow: "OUR APPROACH",
    highlightsTitle: "A foundation for lifelong learning",
    highlightsSubtitle:
      "A school experience should help children build knowledge, confidence and the skills to keep learning.",
    highlights: [
      {
        eyebrow: "01 · LEARNING",
        title: "Academic growth",
        description:
          "Build understanding step by step through practice, questions, and clear learning goals.",
        image: "/images/classroom-teaching.webp",
        alt: "Illustrative teacher guiding a classroom lesson",
        tag: "LEARN",
      },
      {
        eyebrow: "02 · EXPLORATION",
        title: "Learning by doing",
        description:
          "Make room for observation, experimentation, creativity, and explaining ideas in your own words.",
        image: "/images/science-activity.webp",
        alt: "Illustrative classroom science activity",
        tag: "EXPLORE",
      },
      {
        eyebrow: "03 · WELL-BEING",
        title: "Teamwork & confidence",
        description:
          "Encourage fair play, cooperation, effort, and respect for each other.",
        image: "/images/sports-activity.webp",
        alt: "Illustrative students playing football",
        tag: "GROW",
      },
    ],
    valuesEyebrow: "VALUES THAT GUIDE US",
    valuesTitle: "Good values. Strong foundations.",
    valuesSubtitle: "Small daily choices help build the habits that last.",
    values: [
      {
        title: "Respect",
        description:
          "Listen with care and treat classmates, teachers and community members thoughtfully.",
      },
      {
        title: "Curiosity",
        description:
          "Ask questions, look for evidence and keep an open mind when learning something new.",
      },
      {
        title: "Consistency",
        description:
          "Practice regularly, take responsibility and learn from mistakes.",
      },
      {
        title: "Cooperation",
        description:
          "Share ideas, support others and understand the value of working together.",
      },
    ],
    stats: [
      { value: "1–10", label: "Classes supported" },
      { value: "Every day", label: "A chance to learn" },
      { value: "One team", label: "School and family" },
      { value: "Every child", label: "Matters here" },
    ],
    leadersEyebrow: "SCHOOL & FAMILY",
    leadersTitle: "A partnership in every child’s growth",
    leadersSubtitle:
      "Families are encouraged to stay connected with the academy and discuss each learner’s progress directly with the school team.",
    leaders: [
      {
        role: "Message from the Director",
        name: "",
        designation: "School Management",
        message:
          "Our aim is to build a supportive learning environment where children develop understanding, self-discipline, confidence and respect. Please contact the school office for an official message from the management.",
        portrait: "",
        alt: "",
      },
      {
        role: "Message from the Principal",
        name: "",
        designation: "Academic Leadership",
        message:
          "Each child learns in their own way. Regular practice, encouragement and communication between school and family can help students build a steady foundation for the years ahead. Contact the school for the current academic guidance.",
        portrait: "",
        alt: "",
      },
    ],
    noticesEyebrow: "NOTICE & UPDATES",
    noticesTitle: "Important Announcements",
    noticesSubtitle:
      "School announcements will be published here by the administration.",
    notices: [
      {
        id: "welcome-enquiries",
        category: "Admissions",
        title: "Contact the school for admission enquiries",
        date: "",
        description:
          "Call or send an enquiry to confirm current availability, required documents and the admission process for Classes 1–10.",
        active: true,
      },
      {
        id: "school-updates",
        category: "School Update",
        title: "Check this page for school announcements",
        date: "",
        description:
          "The school administration can publish notices and important dates through the website admin panel.",
        active: true,
      },
    ],
    ctaEyebrow: "YOUR CHILD’S NEXT CHAPTER",
    ctaTitle: "Let’s discuss your child’s next step.",
    ctaBody:
      "Contact Shri Gurukul Academy New Lepa for current admission information and school details.",
    ctaLabel: "Talk to the School",
    ctaSecondaryLabel: "Contact School Office",
    ctaSecondaryHref: "/contact",
  },
  pages: {
    about: {
      title: "About Our Academy",
      subtitle:
        "School information for families in New Lepa, Kasrawad and Khargone.",
      heading: "Shri Gurukul Academy New Lepa",
      body: "Shri Gurukul Academy is located in New Lepa, Kasrawad, Khargone district, Madhya Pradesh. The school information provided for this website lists Classes 1–10. Families can contact the academy to confirm current admission availability, curriculum, fees, timings, facilities and official documents.",
      sectionTitle: "Information for school families",
      sectionSubtitle:
        "A clear starting point for learning about the academy and contacting the school.",
      commitmentEyebrow: "OUR COMMITMENT",
      commitmentTitle: "Get current information directly from the school.",
      commitmentBody:
        "Admission availability, fees, curriculum and school arrangements may change. Please contact the academy for current details before making a decision.",
      commitmentPoints:
        "Classes 1–10 listed\nNew Lepa, Kasrawad\nAsk about current admissions",
      image: "/images/campus-illustration.png",
      imageAlt:
        "Illustrative school campus; replace with a current photograph of the academy.",
      sections: [
        {
          title: "School in New Lepa",
          description:
            "Shri Gurukul Academy is based in New Lepa, Kasrawad, in Khargone district of Madhya Pradesh. Contact the school to confirm the current address and directions before visiting.",
        },
        {
          title: "Classes and learning",
          description:
            "The school information supplied for this website lists Classes 1–10. Ask the academy about current class availability, curriculum, medium of instruction and assessment details.",
        },
        {
          title: "Contact the academy",
          description:
            "Parents and guardians can contact the school office with questions about admissions, fees, timings, facilities and official school documents.",
        },
      ],
    },
    academics: {
      title: "Academics",
      subtitle:
        "A learning journey designed around the needs of students at different stages.",
      calendarEyebrow: "PLANNING & PREPARATION",
      calendarTitle: "Academic dates and learning expectations",
      calendarDescription:
        "Contact the school for the latest calendar, curriculum information, assessment schedule and book list.",
      calendarButtonLabel: "View Calendar",
      levelsEyebrow: "LEARNING JOURNEY",
      levelsTitle: "Classes & learning stages",
      levelsSubtitle:
        "Three broad stages describe common learning priorities. Ask the school about the current curriculum and subjects.",
      learningTitle: "Our learning approach",
      learningSubtitle:
        "An effective learning routine is built through regular effort and feedback.",
      heading: "Building understanding, one step at a time",
      body: "The academy offers classes from 1 to 10. Contact the school office for the current syllabus, medium of instruction, assessment pattern, book list and academic calendar. The grade-stage descriptions below are general summaries and can be edited by the administration.",
      image: "/images/library-reading.webp",
      imageAlt: "Illustrative students reading together in a library",
      levels: [
        {
          range: "Classes 1–5",
          title: "Primary years",
          description:
            "Focus on reading, writing, numeracy, communication, curiosity and foundational study habits.",
        },
        {
          range: "Classes 6–8",
          title: "Middle years",
          description:
            "Strengthen subject understanding, independent study, collaboration, research and problem-solving.",
        },
        {
          range: "Classes 9–10",
          title: "Secondary years",
          description:
            "Develop deeper subject knowledge, consistent revision, exam readiness and responsible learning routines.",
        },
      ],
      sections: [
        {
          title: "Clear learning goals",
          description:
            "Help students understand what they are learning, why it matters and how to practise it.",
        },
        {
          title: "Regular practice",
          description:
            "Build confidence through review, feedback and steady preparation.",
        },
        {
          title: "Family communication",
          description:
            "Parents can ask the school for updates on progress, assessments and academic expectations.",
        },
      ],
    },
    admissions: {
      title: "Admissions",
      subtitle:
        "Speak with the school to confirm availability and understand the current process.",
      stepsEyebrow: "YOUR NEXT STEPS",
      stepsTitle: "A simple enquiry-to-admission journey",
      stepsSubtitle:
        "Confirm each step, availability and requirements with the school office.",
      eligibilityEyebrow: "BE PREPARED",
      eligibilityTitle: "Documents & eligibility",
      eligibilityBody:
        "Required documents and age/class criteria are set by the school. Please request the current official list before visiting or applying.",
      eligibilityPoints:
        "Ask for the current admission form.\nConfirm the class and seat availability.\nCheck the official document and fee list.\nAsk about school timings and next steps.",
      contactEyebrow: "QUESTIONS?",
      contactTitle: "Talk with the school team",
      contactBody:
        "Call the academy before making a journey if you need to confirm hours, dates, eligibility or required documents.",
      faqEyebrow: "COMMON QUESTIONS",
      faqTitle: "Admissions FAQs",
      faqSubtitle:
        "For details specific to your child, contact the school office.",
      formEyebrow: "ADMISSION ENQUIRY",
      formTitle: "Tell us a little about your child",
      formBody: "Submit the form and the school team can follow up with you.",
      heading: "Start a conversation with our school office",
      body: "Submit an enquiry and the school team can follow up using the contact details you provide. Class availability, fees, eligibility, documents and dates must be confirmed directly with the academy before applying.",
      image: "/images/campus-illustration.png",
      imageAlt: "Illustrative school campus image",
      steps: [
        {
          number: "01",
          title: "Make an enquiry",
          description:
            "Share the student’s class of interest and ask about current availability.",
        },
        {
          number: "02",
          title: "Confirm requirements",
          description:
            "Ask the school for the application form, current fees, age guidance and document list.",
        },
        {
          number: "03",
          title: "Visit or speak with the school",
          description:
            "Arrange the next step with the school office and clarify any questions.",
        },
        {
          number: "04",
          title: "Complete the process",
          description:
            "Submit the documents and information requested by the academy.",
        },
      ],
      faqs: [
        {
          question: "Which classes does the academy offer?",
          answer:
            "The school information supplied for this website confirms Classes 1–10. Please contact the school to confirm current seat availability by class.",
        },
        {
          question: "What documents are required?",
          answer:
            "Document requirements can vary by student and class. Contact the school office for its current official list.",
        },
        {
          question: "What are the fees and admission dates?",
          answer:
            "Fees, dates and availability are not published as verified information here. Please contact the school directly.",
        },
      ],
    },
    facilities: {
      title: "School Facilities",
      subtitle:
        "The everyday experiences that help students learn and develop confidence.",
      sectionsTitle: "Experiences that help learning grow",
      sectionsSubtitle:
        "The school administration should update this page to reflect facilities and activities currently available on campus.",
      imageDisclaimer:
        "Images on this page are illustrative placeholders, not verified photographs of academy facilities. Please confirm all facility descriptions before publishing.",
      heading: "Space to think, practise and participate",
      body: "Use this page to explore the learning environment and activities offered by the academy. The images on this first version are illustrative, not photographs verified as belonging to the school. The administration should replace descriptions and imagery with accurate current campus information.",
      image: "/images/campus-illustration.png",
      imageAlt: "Illustrative school campus",
      sections: [
        {
          title: "Classroom learning",
          description:
            "A supportive classroom experience encourages students to listen, ask questions and practise new skills.",
          image: "/images/learning-together.webp",
          alt: "Illustrative classroom collaboration",
        },
        {
          title: "Practical exploration",
          description:
            "Hands-on learning, where offered, can help learners connect concepts with observation and discovery.",
          image: "/images/science-activity.webp",
          alt: "Illustrative science activity",
        },
        {
          title: "Movement and teamwork",
          description:
            "Play and physical activity can encourage cooperation, perseverance and healthy habits.",
          image: "/images/sports-activity.webp",
          alt: "Illustrative outdoor school sports",
        },
      ],
    },
    notices: {
      title: "Notice Board",
      subtitle:
        "Announcements and updates published by the school administration.",
      heading: "Important announcements",
      body: "Official notices, dates and circulars will appear here when published by the academy. Please confirm time-sensitive information directly with the school office.",
      notices: [
        {
          id: "admission",
          category: "Admissions",
          title: "Contact the school for current admission details",
          date: "",
          description:
            "Confirm class availability, fees, dates and required documents with the school office.",
          active: true,
        },
      ],
    },
    gallery: {
      title: "Photo Gallery",
      subtitle: "A visual window into learning, participation and school life.",
      galleryEyebrow: "A VISUAL STORY",
      galleryDisclaimer:
        "These are AI-generated illustrative images created for the design prototype. They are not actual photographs of Shri Gurukul Academy. Replace them with approved school photographs before launch.",
      heading: "Moments from a learning journey",
      body: "Browse scenes of learning and school life. Select a category or open any image to view it larger.",
      image: "/images/learning-together.webp",
      imageAlt: "Illustrative students learning together",
      sections: [
        {
          title: "Reading together",
          description: "Illustrative scene for the school learning gallery.",
          image: "/images/library-reading.webp",
          alt: "Illustrative students reading in a library",
          tag: "Classrooms",
        },
        {
          title: "Creative projects",
          description: "Illustrative scene for student creativity.",
          image: "/images/creative-arts.webp",
          alt: "Illustrative school arts-and-crafts activity",
          tag: "Activities",
        },
        {
          title: "Morning assembly",
          description: "Illustrative scene for school community life.",
          image: "/images/school-assembly.webp",
          alt: "Illustrative school assembly",
          tag: "Events",
        },
        {
          title: "Teamwork and sport",
          description: "Illustrative scene for activities and sport.",
          image: "/images/sports-activity.webp",
          alt: "Illustrative students playing football",
          tag: "Sports",
        },
      ],
    },
    vision: {
      title: "Vision & Values",
      subtitle:
        "The principles that can guide a positive learning environment.",
      visionFeatureEyebrow: "OUR FOUNDATION",
      visionDisclaimer:
        "These statements are proposed website copy, not attributed to school leadership. The school should replace them with its approved vision and mission statements.",
      valuesSectionTitle: "Values we want to practise",
      valuesSectionSubtitle:
        "A set of principles that can guide daily choices and relationships.",
      heading: "Nurturing thought, character and confidence",
      body: "The statement below is proposed website copy, not a quotation from school leadership. The school can edit it to match its officially adopted vision and mission.",
      sections: [
        {
          title: "Our vision",
          description:
            "To help learners build knowledge, confidence and consideration for others, preparing them to approach future opportunities with curiosity and responsibility.",
        },
        {
          title: "Our mission",
          description:
            "To support steady academic development through purposeful teaching, regular practice, positive guidance and partnership with families.",
        },
        {
          title: "Integrity first",
          description:
            "Encourage honesty, accountability and respect in everyday choices.",
        },
        {
          title: "Kindness and empathy",
          description:
            "Create space to listen, cooperate and care for the learning community.",
        },
        {
          title: "Persistence",
          description:
            "Treat mistakes as opportunities to practise, reflect and improve.",
        },
      ],
    },
    contact: {
      title: "Contact Us",
      subtitle:
        "Reach out for questions about admissions, school information or general enquiries.",
      contactInfoEyebrow: "WE’RE HERE TO HELP",
      contactFormEyebrow: "SEND A MESSAGE",
      contactFormTitle: "Send us a message",
      contactFormDescription:
        "Have a question? Fill in the details below and the school team can get back to you.",
      mapEyebrow: "FIND THE SCHOOL",
      mapTitle: "Visit or contact us",
      heading: "Get in touch with the school",
      body: "Use the official school phone number or email below. The enquiry form sends your message to the school website backend and stores it in the database when the service is configured.",
      sections: [
        {
          title: "School address",
          description: "New Lepa, Kasrawad, Khargone, Madhya Pradesh 451228",
        },
        { title: "Phone / WhatsApp", description: "7247371421" },
        { title: "Email", description: "gurukulacedmynewlepa@gmail.com" },
      ],
    },
    disclosure: {
      title: "School Information & Disclosure",
      subtitle:
        "Important documents and official information shared by the school.",
      documentEyebrow: "SCHOOL RECORDS",
      documentTitle: "Published documents",
      documentDescription:
        "Only documents uploaded or linked by the school administration appear here.",
      documentsEmptyText:
        "No school documents have been published yet. Please contact the office for current approved records.",
      recordsTitle: "About school records",
      recordsSubtitle:
        "The administration should keep published information accurate and current.",
      heading: "Verified information, available in one place",
      body: "No board affiliation, recognition certificate, fee schedule or statutory claim is asserted on this page. The administration can upload current approved documents and enter their descriptions through the website CMS.",
      documents: [],
      sections: [
        {
          title: "Official school information",
          description:
            "The school administration should publish only current, approved records and should review these documents regularly.",
        },
        {
          title: "Document access",
          description:
            "If a document is not listed, contact the school office to request the current official copy.",
        },
      ],
    },
    calendar: {
      title: "School Calendar",
      subtitle:
        "Official academic schedules, holidays, examinations and school activities.",
      calendarBlockEyebrow: "OFFICIAL PLANNER",
      calendarBlockTitle: "School Academic Calendar & Planners",
      calendarBlockDescription:
        "The school administration publishes confirmed calendars, holidays, examinations and activity schedules here. Select a planner tab to view the official document.",
      calendarSession: "Academic session",
      calendarPostedBy: "Principal Office",
      calendarEmptyText:
        "No official planners have been published yet. Please check back or contact the school office for the current schedule.",
      heading: "Plan ahead with school updates",
      body: "Only school-approved academic schedules and planner images should be published here. Contact the school office to confirm urgent schedule changes.",
      calendarPlanners: [],
      sections: [],
    },
    schoolLife: {
      title: "School Life",
      subtitle:
        "Learning includes classroom practice, participation, creativity and play.",
      sectionsTitle: "Learn. Explore. Take part.",
      sectionsSubtitle:
        "Replace these illustrative examples with verified school activities and photographs.",
      schoolLifeDisclaimer:
        "The images are generated illustrations and do not document actual academy events. Upload approved images and edit descriptions in the admin panel before launch.",
      heading: "Growing beyond the textbook",
      body: "School life includes the experiences through which students practise working with others, communicating ideas and building confidence. Details of actual clubs, events and facilities should be confirmed by the academy before publication.",
      sections: [
        {
          title: "Create together",
          description: "Encourage collaboration and creative expression.",
          image: "/images/creative-arts.webp",
          alt: "Illustrative students creating an arts-and-crafts project",
        },
        {
          title: "Community and respect",
          description: "Build positive routines and a sense of belonging.",
          image: "/images/school-assembly.webp",
          alt: "Illustrative school community assembly",
        },
        {
          title: "Play as a team",
          description:
            "Build cooperation, effort and respect through physical activity.",
          image: "/images/sports-activity.webp",
          alt: "Illustrative school sport",
        },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      subtitle:
        "How information submitted through this school website should be handled.",
      privacySectionsTitle: "Privacy principles",
      privacySectionsSubtitle:
        "Review this policy with the school and hosting providers before launching publicly.",
      privacyImplementationNote:
        "This is a starter privacy notice, not legal advice. The school must verify it against its actual data handling, retention practices, technology providers and applicable law.",
      heading: "Your information matters",
      body: "The website may collect the details you submit through contact and admission enquiry forms, such as a parent or guardian name, phone number, email address, student's class of interest and your message. The information is intended to help the school respond to your enquiry. Do not submit sensitive personal documents through a general enquiry form. Configure hosting, database retention and email providers according to applicable privacy obligations before public launch.",
      sections: [
        {
          title: "Use of submitted information",
          description:
            "Enquiry information is stored in the school website database when configured and may be sent to the school's designated contact email if email delivery is configured.",
        },
        {
          title: "Access and retention",
          description:
            "Access to submitted messages is restricted to authenticated administrators. The school should define and follow a retention and deletion schedule.",
        },
        {
          title: "Contact",
          description:
            "For questions about an enquiry, contact gurukulacedmynewlepa@gmail.com.",
        },
      ],
    },
  },
  seo: {
    title: "Shri Gurukul Academy New Lepa | Classes 1–10",
    description:
      "Shri Gurukul Academy New Lepa serves Classes 1–10 in New Lepa, Kasrawad, Khargone, Madhya Pradesh. Find school information and contact the academy about admissions.",
    keywords: [
      "Shri Gurukul Academy New Lepa",
      "school in New Lepa",
      "school in Kasrawad Khargone",
      "Classes 1 to 10 in Khargone",
      "school admission New Lepa",
    ],
    socialImage: "/images/campus-illustration.png",
  },
};
