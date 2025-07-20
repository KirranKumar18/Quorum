import express from 'express'
const router = express.Router()

import { fetchChats ,saveChats, updateMetadata } from '../controller/controllerFn.js'


//FETCH THE cHATS FROM THE DB
router.get('/chatRoom', fetchChats)

// SENDING THE CHATS TO THE DB
router.post("/messageSave",saveChats)

router.get('/LoginForm', updateMetadata)     //    must happen only after sign up

// make an api to update [append]users grp_In data 



export default router  