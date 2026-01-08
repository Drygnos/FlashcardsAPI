import { user } from "../db/schema.js";
import { request, response } from "express";
import { db } from "../db/database.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import {eq} from 'drizzle-orm';

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
export const register = async (req, res) => {
    try {
        const { email, name, lastName, password } = req.body

        const hashedPassword = await bcrypt.hash(password, 12)

        const [result] = await db
            .insert(user)
            .values({
                email,
                name,
                lastName,
                password: hashedPassword,
                admin: 0
        }).returning({
            idUser: user.idUser,
            email: user.email,
            name: user.name,
            lastName: user.lastName
        })
        const token = jwt.sign(
            { idUser: result.idUser }, 
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


/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [usr] = await db
            .select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1);
        if (!usr) {
            return res.status(401).json({
                error: "Email ou mot de passe incorrect"
            });
        }
        const passwordValid = await bcrypt.compare(password, usr.password);
        if (!passwordValid) {
            return res.status(401).json({
                error: "Email ou mot de passe incorrect"
            });
        }
        const token = jwt.sign(
            { idUser: usr.idUser },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.status(201).json({
            message: 'Login successfully',
            userData: {
                idUser: usr.idUser,
                email: usr.email,
            },
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to log in'
        })
    }
}