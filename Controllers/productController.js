import slugify from "slugify"
import productModel from "../models/productModel.js"
import fs from 'fs'
import categoryModel from "../models/categoryModel.js"
import braintree from "braintree"
import mongoose from "mongoose"
import orderModel from "../models/orderModel.js"
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import userModel from "../models/userModel.js"
import ejs from 'ejs'

dotenv.config()
//payment gateway
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});



export const createProductController = async (req, res) => {
  try {
    const { name, slug, description, quantity, price, category, shipping } = req.fields
    const { photo } = req.files

    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: 'Name is Required' })
      case !category:
        return res.status(500).send({ error: 'Category is Required' })

      case !quantity:
        return res.status(500).send({ error: 'Quantity is Required' })
      case !description:
        return res.status(500).send({ error: 'Description is Required' })
      case !price:
        return res.status(500).send({ error: 'Price is Required' })
      case !photo && photo.size() > 1000000:
        return res.status(500).send({ error: 'Photo is Required and Should be less than 1MB' })
    }
    const products = await new productModel({ ...req.fields, slug: slugify(name) })
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path)
      products.photo.contentType = photo.type
    }
    await products.save()
    res.status(201).send({
      message: 'Product Created Succesfully',
      success: true,
      products
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Error in creating the Product",
      error
    })
  }
}
//Get allproducts Controller
export const getProductsController = async (req, res) => {
  try {
    //only calling product details without photo to reduce request time and load
    const products = await productModel.find({}).select("-photo").limit(12).sort({ createdAt: -1 }).populate('category')
    res.status(200).send({
      success: true,
      totalCount: products.length,
      message: 'Getting All products Succesfully',
      products
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Error in Getting Products",
      error
    })
  }
}
//get single product controller
export const getSingleProductController = async (req, res) => {
  try {

    const product = await productModel.findOne({ slug: req.params.slug }).select('-photo').populate('category')
    res.status(200).send({
      success: true,
      message: 'Single product fetched Successfully',
      product
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: 'Error in Getting single product',
      error
    })
  }
}
//Get photo of a single product
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select('photo')
    if (product.photo.data) {
      res.set('Content-type', product.photo.contentType)
      return res.status(200).send(product.photo.data)
    }
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: 'Error in getting Image',
      error
    })
  }
}
//delete single product
export const productDeleteController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select('-photo')
    res.status(200).send({
      success: true,
      message: 'Product Deleted Successfully',
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: 'Error in Deleting Product',
      error
    })
  }
}
//update product controller
export const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, quantity, price, category, shipping } = req.fields
    const { photo } = req.files

    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: 'Name is Required' })
      case !category:
        return res.status(500).send({ error: 'Category is Required' })

      case !quantity:
        return res.status(500).send({ error: 'Quantity is Required' })
      case !description:
        return res.status(500).send({ error: 'Description is Required' })
      case !price:
        return res.status(500).send({ error: 'Price is Required' })
      // case !photo || photo.size() > 1000000:
      //   return res.status(500).send({ error: 'Photo is Required and Should be less than 1MB' })
    }
    const products = await productModel.findByIdAndUpdate(req.params.pid, { ...req.fields, slug: slugify(name) }, { new: true })
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path)
      products.photo.contentType = photo.type
    }
    await products.save()
    res.status(201).send({
      message: 'Product updated Succesfully',
      success: true,
      products
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Error in updating the Product",
      error
    })
  }
}
// Filter Controller
export const filterController = async (req, res) => {
  try {
    let args = {}
    const { checked, radio } = req.body
    if (checked.length > 0) args.category = checked
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] }
    const products = await productModel.find(args)
    res.status(200).send({
      success: true,
      products
    })

  } catch (error) {
    console.log(error)
    res.status(400).send({
      success: false,
      message: 'Error in Filtering',
      error
    })
  }
}
//Get count of total Number of products
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount()
    res.status(200).send({
      success: true,
      total
    })
  } catch (error) {
    console.log(error)
    res.status(400).send({
      message: 'Error in Getting Product Count',
      success: false,
      error
    })
  }
}
//Product per page
export const productListController = async (req, res) => {
  try {
    const perpage = 3
    const page = req.body.page
    const products = await productModel
      .find({})
      .select('-photo')
      .skip((page - 1) * perpage)
      .limit(perpage)
      .sort({ createdAt: -1 })
    res.status(200).send({
      success: true,
      products
    })
  } catch (error) {
    console.log(error)
    res.status(400).send({
      success: false,
      message: 'Error in fetching further Products',
      error
    })
  }
}

//product Search ||Get Product
export const searchController = async (req, res) => {
  try {
    const { keyword } = req.params
    const result = await productModel.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ]
    }).select('-photo')
    res.json(result)

  } catch (error) {
    console.log(error)
    res.status(400).send({
      success: false,
      message: 'Error In searching the Products',
      error
    })
  }
}

// get related products ||GET
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params
    const product = await productModel.find({
      category: cid,
      _id: { $ne: pid },
    }).select('-photo')
      .limit(3)
      .populate("category")
    res.status(200).send({
      message: "Related Products Fetched Successfully",
      success: true,
      product
    })
  } catch (error) {
    console.log(error)
    res.status(400).send({
      message: 'Error in fetching related products',
      success: false,
      error
    })
  }
}


//Product Category Controller || GET product by category
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug })
    const products = await productModel.find({
      category: category
    }).populate('category').select('-photo')
    res.status(200).send({
      success: true,
      message: 'Fetched All products of this category',
      products,
      category
    })
  } catch (error) {
    console.log(error)
    res.status(400).send({
      success: false,
      message: 'Error in getting Product of this category',
      error
    })
  }
}
//-----------------------------------------------------------------------------------------------------------
// Payment Gateway Part
//token from braintree
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err)
      }
      else {
        res.send(response)
      }
    })
  } catch (error) {
    console.log(error)
  }
}
//payments controller
export const braintreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body
    let total = 0;
    cart.map((i) => { total += i.price })
    let newTransaction = gateway.transaction.sale({
      amount: total,
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true,
      }
    });
    const result = await newTransaction;
 
      if (result.success) {
        const order =  await new orderModel({
          products: cart,
          payment: result,
          buyer: req.user._id
        }).save()
       
        let oid = order._id;
        res.json({ ok: true, cid: req.user._id, oid: order._id })
      } else {
        res.status(500).send(error)
      }
    
    
  } catch (error) {
    console.log(error)
  }


}
export const generateEmailController = async (req, res) => {
  try {
    const { cid, oid } = req.params
    let myemail = process.env.EMAIL
    let mypassword = process.env.APP_PASS
    var recipient = await userModel.findById(cid)
    var recipient_email = recipient?.email
    var products = await orderModel.findById(oid).select('products').select('payment')
    // console.log(products)
    // console.log(recipient)
    var allProducts = [...products.products]
    const product = await productModel.find({ _id: { $in: allProducts } })
    // console.log(product)
    var orderedProducts = await productModel.findById()

    sendEmail({ recipient_email, recipient, products, mypassword, myemail, product })

      .then((response) => res.status(200).send(response.message))
      .catch((error) => res.status(500).send(error.message));


    res.status(201).send({
        success: true,
        myresponse
    })

  } catch (error) {
    console.log(error)
    res.status(400).send({
      success: false,
      message: 'Error In Sending Confirmation Mail',
      error
    })
  }
}





function sendEmail({ recipient_email, recipient, products, mypassword, myemail, product }) {

  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: myemail,
        pass: mypassword,
      },
    });
    let parameters = product
    let parameter1 = recipient
    let parameter2 = products

    const emailTemplate = fs.readFileSync('email2.ejs', 'utf-8');
    const renderedHTML = ejs.render(emailTemplate, { parameters, parameter1: recipient, parameter2: products });
    const mail_configs = {
      from: myemail,
      to: recipient_email,
      subject: `Purchase Confirmation Mail for OrderID: ${products._id}`,
      html: renderedHTML,
    };
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent succesfuly" });
    });
  });
}