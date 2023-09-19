import Categories from "../Models/CategoriesModel.js";

//-------PUBLIC CONTROLLERS-------
const getCategories = async (req, res, next) => {
  try {
    const categories = await Categories.find({});
    res.json(categories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//-------ADMIN CONTROLLERS-------
const createCategory = async (req, res, next) => {
  try {
    const { title } = req.body;
    const category = new Categories({
      title,
    });
    const createdCategory = await category.save();
    res.status(200).json(createdCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Categories.findById(req.params.id);
    if (category) {
      category.title = req.body.title || category.title;
      const updatedCategory = await category.save();
      res.status(200).json(updatedCategory);
    } else {
      res.status(404);
      throw new Error({ message: "Categories not found" });
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Categories.findById(req.params.id);
    if (category) {
      await category.deleteOne();
      res.json({ message: "Category removed!" });
    } else {
      res.status(404);
      throw new Error({ message: "Category not found!!!" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { getCategories, createCategory, updateCategory, deleteCategory };
