export type Stat      = { value: string; label: string }
export type Milestone = { year: string; title: string; desc: string }
export type AboutValue = { title: string; description: string }

export type AboutContent = {
  hero_headline: string
  hero_desc1:    string
  hero_desc2:    string
  stats:         Stat[]
  story_title:   string
  story_desc1:   string
  story_desc2:   string
  milestones:    Milestone[]
  values:        AboutValue[]
  boutique_title: string
  boutique_desc:  string
  boutique_items: string[]
}

export const DEFAULT_ABOUT: AboutContent = {
  hero_headline: "ทีมผู้เชี่ยวชาญ TikTok Shop GMV Max โดยเฉพาะ",
  hero_desc1:    "NP Create เกิดจากความเชื่อที่ว่า — การยิงแอด TikTok Shop ให้ได้ผลจริงต้องการความเชี่ยวชาญเฉพาะทาง ไม่ใช่แค่เปิด campaign ตามคู่มือ",
  hero_desc2:    "เราเริ่มต้นจากการทดลอง ล้มเหลว และเรียนรู้กับระบบ GMV Max มาตั้งแต่ยุคแรก จนค้นพบ formula ที่ทำให้แบรนด์กว่า 500 ราย เติบโตอย่างมีนัยสำคัญ",
  stats: [
    { value: "500+",  label: "แบรนด์ที่ดูแล" },
    { value: "800M+", label: "GMV รวม (บาท)" },
    { value: "3 ปี",  label: "ประสบการณ์ TikTok Shop" },
    { value: "10x",   label: "Growth เฉลี่ย" },
  ],
  story_title: "จากการทดลอง สู่ผลลัพธ์ที่พิสูจน์แล้ว",
  story_desc1: "ในยุคที่ TikTok Shop เพิ่งเริ่มต้นในไทย เราเริ่มทดลองยิงแอดในแบบที่ยังไม่มีคู่มือ ใช้เวลากว่า 2 ปีในการทำความเข้าใจ algorithm ของ GMV Max อย่างลึกซึ้ง",
  story_desc2: "ทุกครั้งที่ campaign ล้มเหลว เราเรียนรู้ว่าอะไรไม่ work ทุกครั้งที่สำเร็จ เราบันทึกว่าอะไร work ผลลัพธ์ที่ได้คือ framework ที่ทดสอบมาแล้วกับมากกว่า 500 แบรนด์ ในหลากหลาย category",
  milestones: [
    { year: "2022", title: "จุดเริ่มต้น", desc: "เริ่มทดลองยิงแอด TikTok Shop ในยุคที่ยังไม่มีใครทำ" },
    { year: "2023", title: "GMV Max",    desc: "เป็นหนึ่งในทีมแรกๆ ที่ใช้ GMV Max และค้นพบ formula ที่ work" },
    { year: "2024", title: "800 ล้าน",  desc: "สะสม GMV ทะลุ 800 ล้านบาท ดูแลมาแล้วมากกว่า 500 แบรนด์" },
    { year: "2025", title: "NP Create", desc: "เปิดเป็น agency อย่างเป็นทางการ รับดูแลแบรนด์คัดสรร" },
  ],
  values: [
    { title: "เน้นผลลัพธ์จริง",     description: "ทุกการตัดสินใจมาจากข้อมูล ไม่ใช่ความรู้สึก เราวัดความสำเร็จด้วยยอดขายจริงของลูกค้า" },
    { title: "โปร่งใสทุกขั้นตอน",   description: "ให้ access dashboard โฆษณาตรง รายงานทุกสัปดาห์ ไม่มีตัวเลขสวยหรูที่ไม่ตรงความจริง" },
    { title: "ดูแลเหมือนธุรกิจตัวเอง", description: "เราโฟกัสแบรนด์ที่รับดูแลอย่างจำกัด เพื่อให้ทุกแบรนด์ได้รับความใส่ใจอย่างเต็มที่" },
    { title: "เชี่ยวชาญเฉพาะทาง",  description: "ไม่กระจายทำหลาย platform เราโฟกัสเฉพาะ TikTok Shop GMV Max ซึ่งทำให้ผลลัพธ์ดีกว่าเอเจนซีทั่วไป" },
  ],
  boutique_title: "คุณภาพ > ปริมาณ",
  boutique_desc:  "เราเลือกที่จะดูแลแบรนด์ในจำนวนจำกัด เพราะเชื่อว่าทุกแบรนด์ที่รับดูแล สมควรได้รับความใส่ใจและ strategy ที่ออกแบบมาเฉพาะ ไม่ใช่ template สำเร็จรูป",
  boutique_items: [
    "ไม่ outsource งานให้ freelance",
    "ทีมงานประจำดูแลตรง",
    "รับสล็อตจำกัดต่อเดือน",
    "Strategy ที่ custom ทุกแบรนด์",
  ],
}

export function mergeAboutContent(override: Record<string, unknown>): AboutContent {
  return { ...DEFAULT_ABOUT, ...(override as Partial<AboutContent>) }
}
