import { ZodError, ZodType } from "zod"

export const validateBody = (schema) => {
    return (req, res, next) => {
        console.log(req.body);
        if (schema instanceof ZodType){
            try {
                schema.parse(req.body);
                next();
            } catch(error){
                console.error(error);
                if (error instanceof ZodError){
                    return res.status(400).send({
                        error: 'validation failed',
                        details: error.issues
                    })
                }
                return res.status(500).send({
                    error: 'Internal server error'
                })
            }
        }
    }
}

export const validateParams = (schema) => {
    return (req, res, next) => {
        if (schema instanceof ZodType){
            try {
                schema.parse(req.params);
                next();
            } catch(error){
                if (error instanceof ZodError){
                    return res.status(400).send({
                        error: 'invalid params',
                        details: error.issues
                    })
                }
                return res.status(500).send({
                    error: 'Internal server error'
                })
            }
        }
    }
}