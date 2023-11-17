import {Request, Response, NextFunction} from 'express'

export async function show(req: Request, res: Response, next: NextFunction) {
    res.render('example')
}
