import Bill from "../models/billModel.js";

export const createBill = async (req, res, next) => {
  try {
    const bill = await Bill.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};

export const getUserBills = async (req, res, next) => {
  try {
    const bills = await Bill.find({ user: req.user._id }).sort({ dueDate: 1 });

    res.status(200).json({ success: true, data: bills });
  } catch (error) {
    next(error);
  }
};

export const getBill = async (req, res, next) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!bill) {
      const error = new Error("Bill not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};

export const updateBill = async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!bill) {
      const error = new Error("Bill not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};

export const markBillPaid = async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        status: "paid",
        paidDate: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!bill) {
      const error = new Error("Bill not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};

export const deleteBill = async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!bill) {
      const error = new Error("Bill not found");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json({ success: true, message: "Bill deleted successfully" });
  } catch (error) {
    next(error);
  }
};
