import express, { Request, Response, Application } from 'express'
import dotenv from 'dotenv'

//For env File
dotenv.config()

const APP: Application = express()

APP.get('/', (req: Request, res: Response) => {
    res.send('Welcome bugg!')
})

export default APP
