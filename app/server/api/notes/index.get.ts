export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event) // бросает 401, если не залогинен
    const notes = db.prepare('SELECT * FROM notes WHERE user_id = ?').all(session.user.id)
    return notes.map(parseNoteRow) // JSON.parse на todos, приведение типов
})