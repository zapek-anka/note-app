import bcrypt from 'bcrypt'
import db from '~/server/utils/db'

export default defineEventHandler(async (event) => {
    const { email, password } = await readBody(event)

    if (!email || !password || password.length < 8) {
        throw createError({ statusCode: 400, message: 'Некорректные данные' })
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) {
        throw createError({ statusCode: 409, message: 'Пользователь уже существует' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const userId = crypto.randomUUID()

    db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)')
        .run(userId, email, passwordHash, Date.now())

    await setUserSession(event, { user: { id: userId, email } })

    return { id: userId, email }
})