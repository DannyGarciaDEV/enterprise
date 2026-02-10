import { connectDB } from "./db";
import Activity from "@/models/Activity";

type ActivityType =
  | "shipment_created"
  | "shipment_updated"
  | "shipment_received"
  | "employee_created"
  | "employee_updated"
  | "event_created"
  | "event_updated"
  | "store_created"
  | "store_updated"
  | "task_created"
  | "task_updated"
  | "task_completed";

export async function logActivity(
  companyId: string,
  type: ActivityType,
  title: string,
  userId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await connectDB();
    await Activity.create({
      companyId,
      type,
      title,
      userId: userId || undefined,
      metadata: metadata || undefined,
    });
  } catch (e) {
    console.error("Activity log failed:", e);
  }
}
