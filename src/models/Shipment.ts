import mongoose from "mongoose";

const statusEnum = ["created", "shipped", "in_transit", "delivered", "received"];

const shipmentSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    trackingNumber: { type: String },
    carrier: { type: String },
    vendor: { type: String },
    purchaseOrderNumber: { type: String },
    destinationStoreId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    status: { type: String, enum: statusEnum, default: "created" },
    dateReceived: { type: Date },
    receivedById: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    notes: { type: String },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

shipmentSchema.index({ companyId: 1 });
shipmentSchema.index({ status: 1 });
export default mongoose.models.Shipment || mongoose.model("Shipment", shipmentSchema);
