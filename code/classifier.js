const ALLOWED_CHAT_IDS = [123456789, 987654321]; // first: tutor ID, second: the builder (not needed if you are both the builder and the tutor)
const chatId = $('Telegram Trigger').first().json.message.chat.id;
const authorized = ALLOWED_CHAT_IDS.includes(chatId);

const item = $input.first().json;

const raw =
  item.content?.parts?.[0]?.text ??
  item.message?.text ??
  (typeof item.content === "string" ? item.content : null) ??
  item.text ??
  "";

const text = String(raw).replace(/\s+/g, " ").trim();

const CMD = /^(add|new\s+student|student|log(?:\s+lesson(?:\s+for)?)?)\b\s*[:：,，\-]?\s*(.*)$/i;
const m = text.match(CMD);

const LEVEL_MAP = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  "intermediate-advanced": "Intermediate-Advanced",
  "intermediate advanced": "Intermediate-Advanced",
  kid: "Kid",
  a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2",
};

const splitParts = s => s.split(/[,，]/).map(p => p.trim()).filter(Boolean);

let action = "unknown";
let studentName = "";
let lessonNotes = "General Lesson";
let level = "Beginner";
let price = 10;
let monthlyClasses = 4;
let reason = "";

if (!authorized) {
  reason = "unauthorized";
} else if (!text) {
  reason = "empty";
} else if (!m) {
  reason = "no_command";
} else {
  const keyword = m[1].toLowerCase();
  const body = m[2].trim();

  if (keyword.startsWith("log")) {
    action = "log_lesson";
    const sep = body.match(/^(.+?)\s*[:：,，\-]\s*(.+)$/);
    if (sep) {
      studentName = sep[1];
      lessonNotes = sep[2].trim() || "General Lesson";
    } else {
      studentName = body;
    }
  } else {
    action = "add_student";
    const parts = splitParts(body);
    studentName = parts[0] || "";

    for (const p of parts.slice(1)) {
      const key = p.toLowerCase().replace(/\s+/g, " ");

      if (LEVEL_MAP[key]) {
        level = LEVEL_MAP[key];
      } else if (/[$€]|usd|dollars?/i.test(p)) {
        const n = parseFloat(p.replace(/[^0-9.]/g, ""));
        if (!isNaN(n)) price = n;
      } else if (/\d/.test(p)) {
        const n = parseInt(p.replace(/[^0-9]/g, ""), 10);
        if (!isNaN(n)) monthlyClasses = n;
      }
    }
  }
}

studentName = studentName.replace(/^[\s:：,，\-]+|[\s:：,，\-]+$/g, "").trim();

const valid =
  authorized &&
  action !== "unknown" &&
  studentName.length > 0 &&
  studentName.length <= 40 &&
  (action !== "log_lesson" || lessonNotes.length > 0);

if (!valid && !reason) {
  reason = studentName ? "name_too_long" : "no_name";
}

return [{
  json: {
    valid,
    reason,
    action,
    studentName,
    level,
    price,
    monthlyClasses,
    lessonNotes,
    rawText: text,
  }
}];
