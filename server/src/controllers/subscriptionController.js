import Subscription from "../models/subscriptionModel.js";
import { workflowClient } from "../config/upstash.js";
import { SERVER_URL, NODE_ENV } from "../config/env.js";
import { sendReminderEmail } from "../utils/send-email.js";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    // In development, send an email immediately without relying on Upstash callbacks reaching localhost.
    if (NODE_ENV !== "production") {
      const populated = await Subscription.findById(subscription.id).populate(
        "user",
        "name email"
      );
      await sendReminderEmail({
        to: populated.user.email,
        type: "1 days before reminder",
        subscription: populated,
      });
      return res.status(201).json({
        success: true,
        data: { subscription: populated, workflowRunId: null, emailed: true },
      });
    }

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    res
      .status(201)
      .json({ success: true, data: { subscription, workflowRunId } });
  } catch (e) {
    next(e);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found." });
    }

    res.status(200).json({ success: true, data: { id } });
  } catch (e) {
    next(e);
  }
};

export const sendTestReminder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findOne({
      _id: id,
      user: req.user._id,
    }).populate("user", "name email");

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found." });
    }

    if (!subscription.user?.email) {
      return res.status(400).json({
        success: false,
        message: "User email is required to send reminders.",
      });
    }

    await sendReminderEmail({
      to: subscription.user.email,
      type: "1 days before reminder",
      subscription,
    });

    res.status(200).json({
      success: true,
      data: {
        id: subscription.id,
        message: "Test reminder sent successfully.",
      },
    });
  } catch (e) {
    next(e);
  }
};
