export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event)
    const id = getRouterParam(event, 'id')

    // проверка на принадлежность пользователю
    const result = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(id, session.user.id)

    if (result.changes === 0) {
        throw createError({ statusCode: 404, message: 'Заметка не найдена' })
    }
    
    return { success: true }
})