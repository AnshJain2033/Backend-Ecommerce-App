import userModel from '../models/userModel.js'
import { comparePassword, hashPassword } from '../helpers/authHelper.js'
import JWT from 'jsonwebtoken'
import orderModel from '../models/orderModel.js'
export const registerController = async (req, res) => {
    try {

        const { name, email, Address, phoneNumber, password, answer, role } = req.body
        if (!name) {
            return res.send({ message: 'Name is required' })
        }
        if (!email) {
            return res.send({ message: 'Email is required' })
        }
        if (!Address) {
            return res.send({ message: 'Address is required' })
        }
        if (!phoneNumber) {
            return res.send({ message: 'phone Number is required' })
        }
        if (!answer) {
            return res.send({ message: 'Answer is required' })
        }
        if (!password) {
            return res.send({ message: 'password is required' })
        }

        //check for existing user
        const existingUser = await userModel.findOne({ email: email })

        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: 'Already a user Please Login'
            })
        }
        //register the user
        const hashedPassword = await hashPassword(password)
        //save the user
        const user = await new userModel({ name, email, Address, phoneNumber, password: hashedPassword, answer, role }).save()
        //send the response
        res.status(200).send({
            success: true,
            message: 'User is Registerd successfully',
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'sorry error occured',
            error
        })
    }

}


//POST LOGIN CONTROLLER
export const loginController = async (req, res) => {
    try {
        //DESTRUCTURED FROM BODY
        const { email, password } = req.body
        //validation
        if (!email || !password) {
            return res.status(404).send({
                success: false,
                message: 'Invalid Email or password'
            })
        }
        //check for user
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Email is not registred"
            })
        }
        //check match
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(200).send({
                success: false,
                message: 'Invalid password'
            })
        }
        //TOKEN
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "2h"
        })
        res.status(200).send({
            success: true,
            message: "login is succesfull",
            user: {
                name: user.name,
                email: user.email,
                Address: user.Address,
                phoneNumber: user.phoneNumber,
                role: user.role
            },
            token
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in login",
            error
        })
    }
}


//Forgot Password controller||POST
export const forgotPasswordController = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body;
        //check
        if (!email) { res.status(400).send({ message: "Email is required" }) }
        if (!answer) { res.status(400).send({ message: "Answer is required" }) }
        if (!newPassword) { res.status(400).send({ message: "New Password is required" }) }
        //Validation of user
        const user = await userModel.findOne({ email, answer })
        if (!user) {
            res.status(404).send({
                success: false,
                message: "Wrong Email or Answer"
            })
        }

        const hashed = await hashPassword(newPassword)
        await userModel.findByIdAndUpdate(user._id, { password: hashed })
        res.status(200).send({
            success: true,
            message: "Password Reset succesfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error
        })

    }

}
export const testController = (req, res) => {
    return res.send({
        success: true,
        message: "Token is working"
    })
}
//update Profile controller
export const updateProfileController = async (req, res) => {
    try {
        const { name, email, phoneNumber, Address, password } = req.body
        const user = await userModel.findById(req.user._id)
        if (password && password.length < 6) {
            return res.json({ error: 'Password is Required and of more than 6 characters' })
        }
        const hashedPassword = password ? await hashPassword(password) : undefined


        const updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
            name: name || user.name,
            phoneNumber: phoneNumber || user.phoneNumber,
            Address: Address || user.Address,
            password: hashedPassword || user.password
        }, { new: true })
        res.status(200).send({
            success: true,
            message: 'Profile Updated Succesfully',
            updatedUser
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error in Updating the profile',
            error
        })
    }
}

//Get ordered Products By single User
export const getOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({ buyer: req.user._id })
            .populate('products', '-photo').populate('buyer', 'name')
        res.json(orders)
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Fetching orders',
            error
        })
    }
}
//Get ordered Products by all users to the admin
export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({})
            .populate('products', '-photo').populate('buyer', 'name').sort({ createdAt: '-1' })
        res.json(orders)
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Fetching orders',
            error
        })
    }
}

// controller to set order status
export const orderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params
        const { status } = req.body
        const orders = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true })
        res.json(orders)
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error In Setting Order Status',
            error
        })
    }
}