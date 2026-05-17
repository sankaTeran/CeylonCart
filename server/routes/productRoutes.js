import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { addProduct, changeStock, productById, productList } from '../controllers/productController.js';

const productRouter = express.Router();


productRouter.post('/add', upload.array('images'), authSeller, addProduct);//Add product 
productRouter.get('/list', productList);//Get all products
productRouter.get('/id/:id', productById);//Get single product 
productRouter.post('/stock', authSeller, changeStock);//Change Stock status

export default productRouter;