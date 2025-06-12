import JwtTypes from 'hono/utils/jwt/types'

type jwtPayload = JwtTypes.JWTPayload & {
    id: string 
    iat: number // Issued at
}   

type prisma = 