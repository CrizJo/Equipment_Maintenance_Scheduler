import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function d(iso) {
  return new Date(`${iso}T00:00:00.000Z`);
}

async function main() {
  await prisma.maintenanceRecord.deleteMany();
  await prisma.equipment.deleteMany();

  const created = [];
  const rows = [
      {
        name: "CNC Milling Machine",
        category: "Machinery",
        location: "Workshop A",
        assignedTechnician: "John Smith",
        status: "operational",
        repeatType: "monthly",
        fixedInterval: true,
        nextMaintenanceDate: d("2026-09-10"),
        expiryDate: d("2029-03-01"),
        notes: "Annual calibration due with the vendor in March.",
      },
      {
        name: "Industrial Air Compressor",
        category: "Utilities",
        location: "Plant Room",
        assignedTechnician: "Sarah Chen",
        status: "operational",
        repeatType: "custom",
        repeatInterval: 3,
        repeatUnit: "months",
        fixedInterval: true,
        nextMaintenanceDate: d("2026-08-26"),
        expiryDate: d("2028-11-15"),
        notes: "Check belt tension and drain condensate.",
      },
      {
        name: "3D Printer - Prusa XL",
        category: "Lab Equipment",
        location: "Lab 301",
        assignedTechnician: "Alex Park",
        status: "under_maintenance",
        repeatType: "weekly",
        fixedInterval: false,
        nextMaintenanceDate: d("2026-08-18"),
        expiryDate: d("2026-09-20"),
        notes: "Hotend replacement in progress. Expiry warning should appear.",
      },
      {
        name: "Laboratory Centrifuge",
        category: "Lab Equipment",
        location: "Lab 204",
        assignedTechnician: "Dr. Rachel Kim",
        status: "operational",
        repeatType: "monthly",
        fixedInterval: true,
        nextMaintenanceDate: d("2026-08-21"),
        expiryDate: d("2027-06-30"),
      },
      {
        name: "Ultrasound Machine",
        category: "Medical",
        location: "Clinic B",
        assignedTechnician: "Dr. Rachel Kim",
        status: "operational",
        repeatType: "yearly",
        fixedInterval: true,
        nextMaintenanceDate: d("2026-12-01"),
        expiryDate: d("2030-01-01"),
        notes: "Probe inspection and software update.",
      },
      {
        name: "Toyota 8FG Forklift",
        category: "Vehicles",
        location: "Warehouse",
        assignedTechnician: "Emily Wang",
        status: "out_of_service",
        repeatType: "custom",
        repeatInterval: 15,
        repeatUnit: "days",
        fixedInterval: false,
        nextMaintenanceDate: d("2026-09-12"),
        expiryDate: d("2026-08-30"),
        notes: "Hydraulic leak. Expiry date has passed — show expired flag only.",
      },
      {
        name: "HVAC Rooftop Unit",
        category: "Utilities",
        location: "Roof East",
        assignedTechnician: "Tom Harris",
        status: "operational",
        repeatType: "weekdays",
        fixedInterval: true,
        nextMaintenanceDate: d("2026-09-15"),
        expiryDate: d("2031-04-12"),
      },
      {
        name: "Backup Generator",
        category: "Utilities",
        location: "Plant Room",
        assignedTechnician: "Sarah Chen",
        status: "retired",
        repeatType: "yearly",
        fixedInterval: false,
        nextMaintenanceDate: null,
        expiryDate: d("2025-12-31"),
        notes: "Replaced by the 2026 generator. Kept for history.",
      },
  ];

  for (const row of rows) {
    created.push(await prisma.equipment.create({ data: row }));
  }

  const byName = Object.fromEntries(created.map((item) => [item.name, item]));

  await prisma.maintenanceRecord.createMany({
    data: [
      {
        equipmentId: byName["Ultrasound Machine"].id,
        type: "inspection",
        description: "Calibration and probe inspection",
        assignedTo: "Dr. Rachel Kim",
        scheduledDate: d("2026-06-12"),
        completedDate: d("2026-06-12"),
        status: "completed",
        completionNotes: "All probes within spec.",
      },
      {
        equipmentId: byName["CNC Milling Machine"].id,
        type: "preventive",
        description: "Lubrication and spindle inspection",
        assignedTo: "John Smith",
        scheduledDate: d("2026-08-10"),
        completedDate: d("2026-08-10"),
        status: "completed",
        completionNotes: "Replaced coolant filter.",
      },
      {
        equipmentId: byName["CNC Milling Machine"].id,
        type: "preventive",
        description: "Monthly preventive service",
        assignedTo: "John Smith",
        scheduledDate: d("2026-09-10"),
        status: "scheduled",
      },
      {
        equipmentId: byName["Industrial Air Compressor"].id,
        type: "preventive",
        description: "Filter change and pressure test",
        assignedTo: "Sarah Chen",
        scheduledDate: d("2026-08-26"),
        status: "scheduled",
      },
      {
        equipmentId: byName["3D Printer - Prusa XL"].id,
        type: "corrective",
        description: "Replace hotend assembly and recalibrate",
        assignedTo: "Alex Park",
        scheduledDate: d("2026-08-18"),
        status: "overdue",
      },
      {
        equipmentId: byName["Laboratory Centrifuge"].id,
        type: "inspection",
        description: "Rotor balance and safety interlock check",
        assignedTo: "Dr. Rachel Kim",
        scheduledDate: d("2026-08-21"),
        status: "scheduled",
      },
      {
        equipmentId: byName["Ultrasound Machine"].id,
        type: "preventive",
        description: "Annual preventive maintenance",
        assignedTo: "Dr. Rachel Kim",
        scheduledDate: d("2026-12-01"),
        status: "scheduled",
      },
      {
        equipmentId: byName["Toyota 8FG Forklift"].id,
        type: "corrective",
        description: "Repair hydraulic leak and inspect mast",
        assignedTo: "Emily Wang",
        scheduledDate: d("2026-09-12"),
        status: "scheduled",
      },
      {
        equipmentId: byName["HVAC Rooftop Unit"].id,
        type: "preventive",
        description: "Filter and coil inspection",
        assignedTo: "Tom Harris",
        scheduledDate: d("2026-09-15"),
        status: "in_progress",
      },
    ],
  });

  console.log("Seeded 8 equipment items and maintenance history.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
