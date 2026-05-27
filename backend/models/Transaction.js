const mongoose = require("mongoose");

const CATEGORIES = ["food", "transport", "shopping", "bills", "entertain", "health", "other"];

const transactionSchema = new mongoose.Schema(
  {
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    merchant:        { type: String, required: true, trim: true },
    description:     { type: String, default: "", trim: true },
    amount:          { type: Number, required: true }, // kuruş (cents)
    category:        { type: String, enum: CATEGORIES, default: "other" },
    categorySource:  { type: String, enum: ["ai", "user"], default: "user" },
    aiConfidence:    { type: Number, default: null },
    date:            { type: Date, default: Date.now },
    note:            { type: String, default: "" },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
