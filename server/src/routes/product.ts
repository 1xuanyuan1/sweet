import express from 'express';
import { 
    getStyles, createStyle, updateStyle, deleteStyle,
    getRecipes, createRecipe, updateRecipe, deleteRecipe,
    getAllProducts
} from '../controllers/productController';
import { authenticate, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/all', getAllProducts); // For homepage

router.get('/styles', getStyles);
router.post('/styles', authenticate, isAdmin, createStyle);
router.put('/styles/:id', authenticate, isAdmin, updateStyle);
router.delete('/styles/:id', authenticate, isAdmin, deleteStyle);

router.get('/recipes', getRecipes);
router.post('/recipes', authenticate, isAdmin, createRecipe);
router.put('/recipes/:id', authenticate, isAdmin, updateRecipe);
router.delete('/recipes/:id', authenticate, isAdmin, deleteRecipe);

export default router;
