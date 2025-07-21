import express from 'express'
const router = express.Router()

import { fetchChats, saveChats, updateMetadata, getUserMetadata, updateUserGroups } from '../controller/controllerFn.js'


//FETCH THE cHATS FROM THE DB
router.get('/chatRoom', fetchChats)

// SENDING THE CHATS TO THE DB
router.post("/messageSave",saveChats)

// Support both GET and POST for updateMetadata
router.get('/LoginForm', updateMetadata)     // Support GET with query params
router.post('/LoginForm', updateMetadata)    // Support POST with request body

// Get user metadata by email or ID
router.get('/getUserMetadata', getUserMetadata)
router.post('/getUserMetadata', getUserMetadata)

// Update user groups
router.post('/updateUserGroups', updateUserGroups)

// make an api to update [append]users grp_In data 



export default router  