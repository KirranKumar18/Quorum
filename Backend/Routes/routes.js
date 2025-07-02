import express from 'express'
const router = express.Router()

import { fetchChats ,saveChats } from '../controller/controllerFn.js'


//FETCH THE cHATS FROM THE DB
router.get('/chatRoom', fetchChats)

// SENDING THE CHATS TO THE DB
router.post("/messageSave",saveChats)

export default router