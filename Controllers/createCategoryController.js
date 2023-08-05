import categoryModel from '../models/categoryModel.js'
import slugify from 'slugify'
import userModel from '../models/userModel.js'
export const createCategoryController = async (req, res) => {
    try {
        const { name } = req.body
        //validation
        if (!name) {
            return res.status(401).send({ message: 'Name is required' })
        }
        const existingCategory = await categoryModel.findOne({ name })
        if (existingCategory) {
            res.status(200).send({
                message: 'Category Already Exists'
            })
        }
        const category = await new categoryModel({ name, slug: slugify(name) }).save()
        res.status(201).send({
            success: true,
            message: 'New Category is created',
            category
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Category',
            error
        })
    }
}
//update category controller
export const updateCategoryController = async (req, res) => {
    try {
        const { name } = req.body
        const { id } = req.params
        const category = await categoryModel.findByIdAndUpdate(
            id,
            { name, slug: slugify(name) },
            { new: true }
        )
        res.status(200).send({
            success: true,
            message: 'Category Updated Succesfully',
            category
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: 'Error while updating Category',
            success: false,
            error
        })
    }
}
//get All categories
export const categoryController = async (req, res) => {
    try {
        const category = await categoryModel.find({})
        res.status(200).send({
            success: true,
            message: "All Category List",
            category
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error while getting all categories',
            error
        })
    }
}
// get single category ||GET
export const singleCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug })
        res.status(200).send({
            success: true,
            message: 'Got the requested Category Successfully',
            category
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in getting this Category',
            error
        })
    }
}
// delete single category ||DELETE
export const deleteCategoryController = async (req, res) => {
    try {
        const { id } = req.params
        await categoryModel.findByIdAndDelete(id)
        res.status(200).send({
            success: true,
            message: 'Category Deleted Succesfully',

        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in deleting category",
            error
        })
    }
}