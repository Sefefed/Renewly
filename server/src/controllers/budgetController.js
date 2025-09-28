import Budget from "../models/budgetModel.js";

export const getBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({ user: req.user._id });

    if (!budget) {
      // Create default budget if none exists
      budget = await Budget.create({
        user: req.user._id,
        monthlyLimit: 500,
        currency: "USD",
        categoryLimits: {
          entertainment: 100,
          utilities: 150,
          rent: 0,
          insurance: 100,
          phone: 80,
          internet: 100,
          other: 50,
        },
      });
    }

    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};
