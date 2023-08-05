import express from 'express'
import { forgotPasswordController, getAllOrdersController, getOrdersController, orderStatusController, registerController, testController, updateProfileController } from "../Controllers/authController.js"
import { loginController } from '../Controllers/authController.js'
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js'

const router = express.Router()

//Register 
router.post('/register', registerController)
//LOGIN/post
router.post('/login', loginController)
router.get('/test', requireSignIn, isAdmin, testController)
//forgot password
router.post('/forgot-password', forgotPasswordController)
//protected User  routes
router.get('/user-auth', requireSignIn, (req, res) => {
    res.status(200).send({ ok: true })
})
//protected Admin routes
router.get('/admin-auth', requireSignIn, isAdmin, (req, res) => {
    res.status(200).send({ ok: true })
})
// update profile controller
router.put('/update-profile', requireSignIn, updateProfileController)
//get all orders of a user
router.get('/orders', requireSignIn, getOrdersController)
//display all orders to admin
router.get('/all-orders', requireSignIn, isAdmin, getAllOrdersController)
//order status controller
router.put('/order-status/:orderId', requireSignIn, isAdmin, orderStatusController)
export default router