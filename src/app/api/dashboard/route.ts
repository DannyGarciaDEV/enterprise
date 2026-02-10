import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import Employee from "@/models/Employee";
import Shipment from "@/models/Shipment";
import Store from "@/models/Store";
import Event from "@/models/Event";
import SentEmail from "@/models/SentEmail";
import Activity from "@/models/Activity";
import Task from "@/models/Task";

export async function GET(req: NextRequest) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  const companyId = auth!.companyId;
  try {
    await connectDB();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const myEmployee = await Employee.findOne({ companyId, email: auth!.email }).select("_id").lean();
    const myEmployeeId = myEmployee?._id;

    const [employeeCount, activeShipments, stores, upcomingEvents, recentShipments, emailsThisMonth, recentActivity, myTasks] = await Promise.all([
      Employee.countDocuments({ companyId, status: "active" }),
      Shipment.countDocuments({ companyId, status: { $in: ["created", "shipped", "in_transit"] } }),
      Store.find({ companyId }).select("name location").lean(),
      Event.find({ companyId, date: { $gte: new Date() } }).sort({ date: 1 }).limit(5).populate("storeId", "name").lean(),
      Shipment.find({ companyId }).sort({ updatedAt: -1 }).limit(5).populate("destinationStoreId", "name").lean(),
      SentEmail.countDocuments({ companyId, sentAt: { $gte: startOfMonth } }),
      Activity.find({ companyId }).sort({ createdAt: -1 }).limit(10).populate("userId", "name").lean(),
      myEmployeeId
        ? Task.find({ companyId, assigneeId: myEmployeeId, status: { $ne: "done" } })
            .sort({ dueDate: 1 }).limit(10)
            .populate("assigneeId", "name").lean()
        : [],
    ]);
    return NextResponse.json({
      employeeCount,
      activeShipments,
      storeCount: stores.length,
      stores,
      upcomingEvents,
      recentShipments,
      emailsThisMonth,
      recentActivity,
      myTasks,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
