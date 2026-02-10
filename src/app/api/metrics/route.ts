import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import SentEmail from "@/models/SentEmail";
import Employee from "@/models/Employee";
import Shipment from "@/models/Shipment";
import Event from "@/models/Event";

const DAYS = 30;

function fillDailySeries(
  buckets: { date: string; count: number }[],
  days: number = DAYS
): { date: string; count: number }[] {
  const map = new Map(buckets.map((b) => [b.date, b.count]));
  const out: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    out.push({ date: dateStr, count: map.get(dateStr) ?? 0 });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const { auth, res } = requireAuth(req);
  if (res) return res;
  const companyId = auth!.companyId;
  try {
    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfRange = new Date(now);
    startOfRange.setDate(startOfRange.getDate() - DAYS);
    startOfRange.setHours(0, 0, 0, 0);

    const [
      totalEmailsSent,
      emailsThisMonth,
      recentEmails,
      employeeCount,
      shipmentCount,
      eventCount,
      emailsByDay,
      shipmentsByDay,
      eventsByDay,
    ] = await Promise.all([
      SentEmail.countDocuments({ companyId }),
      SentEmail.countDocuments({ companyId, sentAt: { $gte: startOfMonth } }),
      SentEmail.find({ companyId })
        .sort({ sentAt: -1 })
        .limit(20)
        .populate("fromUserId", "name")
        .lean(),
      Employee.countDocuments({ companyId, status: "active" }),
      Shipment.countDocuments({ companyId }),
      Event.countDocuments({ companyId }),
      SentEmail.aggregate([
        { $match: { companyId: new mongoose.Types.ObjectId(companyId), sentAt: { $gte: startOfRange } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$sentAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).then((r) => r.map((x) => ({ date: x._id, count: x.count }))),
      Shipment.aggregate([
        { $match: { companyId: new mongoose.Types.ObjectId(companyId), createdAt: { $gte: startOfRange } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).then((r) => r.map((x) => ({ date: x._id, count: x.count }))),
      Event.aggregate([
        { $match: { companyId: new mongoose.Types.ObjectId(companyId), date: { $gte: startOfRange } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).then((r) => r.map((x) => ({ date: x._id, count: x.count }))),
    ]);

    return NextResponse.json({
      emails: {
        total: totalEmailsSent,
        thisMonth: emailsThisMonth,
        recent: recentEmails,
        perDay: fillDailySeries(emailsByDay),
      },
      employees: employeeCount,
      shipments: shipmentCount,
      events: eventCount,
      shipmentsPerDay: fillDailySeries(shipmentsByDay),
      eventsPerDay: fillDailySeries(eventsByDay),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
