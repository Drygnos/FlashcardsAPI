import { usersTable } from "../db/schema.js";
import { request, response } from "express";
import { db } from "../db/database.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config'

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
export const register = async (req, res) => {
    try {
        const { email, username, password } = req.body

        const hashedPassword = await bcrypt.hash(password, 12)

        const [result] = await db
            .insert(usersTable)
            .values({
                email,
                username,
                password: hashedPassword
        }).returning({
            id: usersTable.id,
            email: usersTable.email,
            username: usersTable.username
        })

        const token = jwt.sign(
            {
                userId: result.id
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '24h'}
        )

        res.status(201).json({
            message: "User created",
            user: result,
            token
        })

    } catch (error){
        console.error(error)
        res.status(500).json({
            error: "Failed to register",
        })
    }
}
