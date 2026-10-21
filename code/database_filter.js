const c = $('Classifier').first().json;
const norm = s => (s || "").toLowerCase().trim();
const target = norm(c.studentName);

const match = target
  ? $input.all().find(p => norm(p.json.name) === target)
  : null;

return [{
  json: {
    studentPageId: match ? match.json.id : null,
    studentName: c.studentName,
    lessonNotes: c.lessonNotes || ""
  }
}]
