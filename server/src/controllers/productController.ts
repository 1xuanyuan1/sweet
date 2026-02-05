import { Request, Response } from 'express';
import Style from '../models/Style';
import Recipe from '../models/Recipe';

// Styles
export const getStyles = async (req: Request, res: Response) => {
    try {
        const styles = await Style.find().sort({ createdAt: -1 });
        res.json(styles);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching styles' });
    }
};

export const createStyle = async (req: Request, res: Response) => {
    try {
        const style = new Style(req.body);
        await style.save();
        res.status(201).json(style);
    } catch (error) {
        res.status(400).json({ error: 'Error creating style' });
    }
};

export const updateStyle = async (req: Request, res: Response) => {
    try {
        const style = await Style.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(style);
    } catch (error) {
        res.status(500).json({ error: 'Error updating style' });
    }
};

export const deleteStyle = async (req: Request, res: Response) => {
    try {
        await Style.findByIdAndDelete(req.params.id);
        res.json({ message: 'Style deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting style' });
    }
};

// Recipes
export const getRecipes = async (req: Request, res: Response) => {
    try {
        const recipes = await Recipe.find().sort({ createdAt: -1 });
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching recipes' });
    }
};

export const createRecipe = async (req: Request, res: Response) => {
    try {
        const recipe = new Recipe(req.body);
        await recipe.save();
        res.status(201).json(recipe);
    } catch (error) {
        res.status(400).json({ error: 'Error creating recipe' });
    }
};

export const updateRecipe = async (req: Request, res: Response) => {
    try {
        const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(recipe);
    } catch (error) {
        res.status(500).json({ error: 'Error updating recipe' });
    }
};

export const deleteRecipe = async (req: Request, res: Response) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        res.json({ message: 'Recipe deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting recipe' });
    }
};

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const [styles, recipes] = await Promise.all([
            Style.find().sort({ createdAt: -1 }),
            Recipe.find().sort({ createdAt: -1 })
        ]);
        res.json({ styles, recipes });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
};
