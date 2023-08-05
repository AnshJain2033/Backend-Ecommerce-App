import express from 'express';
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { categoryController, createCategoryController, deleteCategoryController, singleCategoryController, updateCategoryController } from '../Controllers/createCategoryController.js';


const router = express.Router();

//route for category
router.post('/create-category', requireSignIn, isAdmin, createCategoryController)
//changed from post--->put
router.put('/update-category/:id', requireSignIn, isAdmin, updateCategoryController)
router.get('/get-category', categoryController)
router.get('/single-category/:slug', singleCategoryController)
router.delete('/delete-category/:id', requireSignIn, isAdmin, deleteCategoryController)
export default router