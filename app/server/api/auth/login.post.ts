import bcrypt from 'bcrypt'
import db from '~/server/utils/db'

export default defineEventHandler(async (event) => {
    const { email, password } = await readBody(event)

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined
    if (!user) {
        throw createError({ statusCode: 401, message: 'Неверный email или пароль' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
        throw createError({ statusCode: 401, message: 'Неверный email или пароль' })
    }

    await setUserSession(event, { user: { id: user.id, email: user.email } })
    return { id: user.id, email: user.email }
})