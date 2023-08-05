import express from 'express'
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js'
import { braintreePaymentController, braintreeTokenController, createProductController, filterController, generateEmailController, getProductsController, getSingleProductController, productCategoryController, productCountController, productDeleteController, productListController, productPhotoController, relatedProductController, searchController, updateProductController } from '../Controllers/productController.js'
import formidable from 'express-formidable'
const router = express.Router()

//Use of Routes
router.post('/create-product', requireSignIn, isAdmin, formidable(), createProductController)
//get all products ||GET
router.get('/get-product', getProductsController)
//get single product||GET
router.get('/get-product/:slug', getSingleProductController)
//get photo of Single product
router.get('/product-photo/:pid', productPhotoController);
//delete single product[Earlier admin and sign in was not present]
router.delete('/delete-product/:pid', requireSignIn, isAdmin, productDeleteController)
//update product
router.put('/update-product/:pid', requireSignIn, isAdmin, formidable(), updateProductController)
//filter product
router.post('/product-filters', filterController)
//count total products
router.get('/product-count', productCountController)
//Get a specified page 
router.post('/product-list', productListController)
//search
router.get('/search/:keyword', searchController)
//related product controller
router.get('/related-product/:pid/:cid', relatedProductController)
//category wise Products
router.get('/product-category/:slug', productCategoryController)
//PAYMENT GATEWAY
//payment token from braintree
router.get('/braintree/token', braintreeTokenController)
//payments
router.post('/braintree/payment', requireSignIn, braintreePaymentController)
//Email Generater
router.post('/generatemail/:cid/:oid', requireSignIn, generateEmailController)
export default router