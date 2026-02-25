import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// ─── Sample Data ─────────────────────────────────────────────────────────────

const GYMS = [
  { name: "Iron Paradise Fitness", slug: "iron-paradise-fitness", description: "Premium bodybuilding and strength training facility with state-of-the-art equipment.", address: "123 MG Road, Bangalore", lat: 12.9716, lng: 77.5946, phone: "+91-9876543210", website: "https://ironparadise.com", priceRange: "premium", type: "commercial", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800" },
  { name: "FlexZone CrossFit", slug: "flexzone-crossfit", description: "High-intensity CrossFit training with certified coaches and community vibes.", address: "45 Koramangala 4th Block, Bangalore", lat: 12.9352, lng: 77.6245, phone: "+91-9876543211", website: "https://flexzonecf.com", priceRange: "premium", type: "crossfit", imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800" },
  { name: "Zen Yoga Studio", slug: "zen-yoga-studio", description: "Peaceful yoga studio offering Hatha, Vinyasa, and Meditation classes.", address: "78 Indiranagar, Bangalore", lat: 12.9784, lng: 77.6408, phone: "+91-9876543212", website: "https://zenyoga.in", priceRange: "mid", type: "yoga", imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800" },
  { name: "FitBudget Gym", slug: "fitbudget-gym", description: "Affordable gym with all essential equipment. Great value for money.", address: "12 BTM Layout, Bangalore", lat: 12.9166, lng: 77.6101, phone: "+91-9876543213", website: null, priceRange: "budget", type: "budget", imageUrl: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800" },
  { name: "She Fitness - Women Only", slug: "she-fitness-women-only", description: "Exclusive women-only gym with personal trainers, group classes, and a safe space.", address: "56 HSR Layout, Bangalore", lat: 12.9121, lng: 77.6446, phone: "+91-9876543214", website: "https://shefitness.in", priceRange: "mid", type: "women_only", imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800" },
  { name: "24/7 Fitness Hub", slug: "247-fitness-hub", description: "Round-the-clock gym access with smart card entry and CCTV monitoring.", address: "89 Whitefield, Bangalore", lat: 12.9698, lng: 77.7500, phone: "+91-9876543215", website: "https://247fitnesshub.com", priceRange: "mid", type: "24x7", imageUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800" },
  { name: "PowerLift Arena", slug: "powerlift-arena", description: "Dedicated powerlifting and Olympic weightlifting facility.", address: "34 JP Nagar, Bangalore", lat: 12.9063, lng: 77.5857, phone: "+91-9876543216", website: "https://powerliftarena.com", priceRange: "premium", type: "commercial", imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800" },
  { name: "AquaFit Swimming & Gym", slug: "aquafit-swimming-gym", description: "Swimming pool with gym facilities, aqua aerobics, and personal training.", address: "67 Jayanagar, Bangalore", lat: 12.9308, lng: 77.5838, phone: "+91-9876543217", website: "https://aquafit.in", priceRange: "premium", type: "commercial", imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800" },
  { name: "Urban Fitness Co.", slug: "urban-fitness-co", description: "Modern fitness center with functional training, cardio zone, and smoothie bar.", address: "101 Electronic City, Bangalore", lat: 12.8456, lng: 77.6603, phone: "+91-9876543218", website: "https://urbanfitnessco.com", priceRange: "mid", type: "commercial", imageUrl: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800" },
  { name: "MuscleFactory", slug: "musclefactory", description: "Old-school bodybuilding gym with heavy iron, no frills, just results.", address: "22 Marathahalli, Bangalore", lat: 12.9591, lng: 77.6974, phone: "+91-9876543219", website: null, priceRange: "budget", type: "commercial", imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800" },
  { name: "Mindful Movement Studio", slug: "mindful-movement-studio", description: "Pilates, barre, and mindfulness-focused movement classes.", address: "88 Lavelle Road, Bangalore", lat: 12.9716, lng: 77.5993, phone: "+91-9876543220", website: "https://mindfulmovement.in", priceRange: "premium", type: "yoga", imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800" },
  { name: "CrossFit Inferno", slug: "crossfit-inferno", description: "Intense CrossFit box with competition-level programming and community WODs.", address: "15 Sarjapur Road, Bangalore", lat: 12.9107, lng: 77.6871, phone: "+91-9876543221", website: "https://cfinferno.com", priceRange: "premium", type: "crossfit", imageUrl: "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=800" },
  { name: "FitFirst Gym", slug: "fitfirst-gym", description: "Community gym with friendly staff, clean facilities, and affordable plans.", address: "44 Yelahanka, Bangalore", lat: 13.1005, lng: 77.5963, phone: "+91-9876543222", website: null, priceRange: "budget", type: "budget", imageUrl: "https://images.unsplash.com/photo-1570829460005-c840387bb1ca?w=800" },
  { name: "Strength & Soul", slug: "strength-and-soul", description: "Holistic fitness combining strength training with yoga and meditation.", address: "72 Rajajinagar, Bangalore", lat: 12.9883, lng: 77.5533, phone: "+91-9876543223", website: "https://strengthandsoul.com", priceRange: "mid", type: "commercial", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800" },
  { name: "Rapid Fitness 24x7", slug: "rapid-fitness-247", description: "Automated 24/7 gym with app-based access, modern machines, and AI tracking.", address: "99 Hebbal, Bangalore", lat: 13.0358, lng: 77.5970, phone: "+91-9876543224", website: "https://rapidfitness.in", priceRange: "mid", type: "24x7", imageUrl: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=800" },
  { name: "Peak Performance Center", slug: "peak-performance-center", description: "Sports performance training center with athletics coaching and rehab services.", address: "31 Malleshwaram, Bangalore", lat: 13.0035, lng: 77.5647, phone: "+91-9876543225", website: "https://peakperformance.in", priceRange: "premium", type: "commercial", imageUrl: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800" },
  { name: "Curves Fitness - Ladies", slug: "curves-fitness-ladies", description: "Women-focused circuit training gym with supportive coaches.", address: "53 Banashankari, Bangalore", lat: 12.9255, lng: 77.5468, phone: "+91-9876543226", website: "https://curvesfitness.in", priceRange: "mid", type: "women_only", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800" },
  { name: "GymBro Arena", slug: "gymbro-arena", description: "Massive training floor with every machine imaginable. Bro splits welcome.", address: "66 Bellandur, Bangalore", lat: 12.9260, lng: 77.6762, phone: "+91-9876543227", website: "https://gymbroarena.com", priceRange: "mid", type: "commercial", imageUrl: "https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=800" },
  { name: "Sunrise Yoga Shala", slug: "sunrise-yoga-shala", description: "Traditional Ashtanga and Mysore-style yoga in a serene setting.", address: "11 Sadashivanagar, Bangalore", lat: 13.0067, lng: 77.5800, phone: "+91-9876543228", website: "https://sunriseyoga.in", priceRange: "budget", type: "yoga", imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800" },
  { name: "Titan Strength Gym", slug: "titan-strength-gym", description: "Serious strength training facility with platforms, racks, and competition gear.", address: "40 Vijayanagar, Bangalore", lat: 12.9719, lng: 77.5350, phone: "+91-9876543229", website: "https://titanstrength.com", priceRange: "mid", type: "commercial", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800" },
];

const AMENITIES_POOL = [
  { name: "Swimming Pool", icon: "waves" },
  { name: "Sauna", icon: "thermometer" },
  { name: "Steam Room", icon: "cloud" },
  { name: "Parking", icon: "car" },
  { name: "Wi-Fi", icon: "wifi" },
  { name: "Locker Room", icon: "lock" },
  { name: "Showers", icon: "shower-head" },
  { name: "Air Conditioning", icon: "air-vent" },
  { name: "Personal Trainer", icon: "user-check" },
  { name: "Group Classes", icon: "users" },
  { name: "Cardio Zone", icon: "heart-pulse" },
  { name: "Free Weights", icon: "dumbbell" },
  { name: "Functional Training", icon: "zap" },
  { name: "Smoothie Bar", icon: "cup-soda" },
  { name: "Towel Service", icon: "shirt" },
  { name: "Body Composition Analysis", icon: "scan" },
  { name: "Physiotherapy", icon: "stethoscope" },
  { name: "Kids Play Area", icon: "baby" },
];

const CLASS_TYPES = [
  { className: "Yoga Flow", category: "yoga", duration: 60 },
  { className: "HIIT Blast", category: "cardio", duration: 45 },
  { className: "Zumba", category: "dance", duration: 60 },
  { className: "Spin Class", category: "cardio", duration: 45 },
  { className: "Boxing Fit", category: "martial_arts", duration: 60 },
  { className: "Pilates Core", category: "yoga", duration: 50 },
  { className: "Body Pump", category: "strength", duration: 55 },
  { className: "Kickboxing", category: "martial_arts", duration: 60 },
  { className: "Power Yoga", category: "yoga", duration: 60 },
  { className: "Aqua Aerobics", category: "cardio", duration: 45 },
];

const INSTRUCTORS = [
  "Priya Sharma", "Rahul Verma", "Anita Singh", "Vikram Patel",
  "Deepa Nair", "Arjun Kumar", "Meera Reddy", "Karthik Iyer",
  "Sneha Gupta", "Rohan Das"
];

const REVIEW_TEXTS = [
  "Excellent gym with great equipment and friendly staff. Highly recommended!",
  "Good value for money. The trainers are knowledgeable and helpful.",
  "Clean facilities and well-maintained equipment. Love the vibe here.",
  "Best gym in the area. The group classes are amazing!",
  "Decent gym but can get crowded during peak hours.",
  "Great variety of equipment. Could improve the ventilation though.",
  "Friendly atmosphere, perfect for beginners. Staff is very supportive.",
  "Top-notch facilities. The swimming pool is a big plus.",
  "Affordable and well-equipped. My go-to gym for the past year.",
  "Amazing CrossFit box! The community here keeps you motivated.",
  "Nice yoga studio with experienced instructors. Very calming environment.",
  "Good gym overall. Parking can be an issue sometimes.",
  "Love the 24/7 access. Perfect for my irregular schedule.",
  "The personal trainers here really know their stuff. Great results!",
  "Solid gym with everything you need. No complaints!",
  "Wonderful experience! The ambiance is perfect for workouts.",
  "Could be better. Equipment is a bit dated but functional.",
  "Premium gym with premium service. Worth every penny.",
  "Great for powerlifting. Has all the specialty equipment you need.",
  "Excellent women-only gym. Feels very safe and comfortable.",
];

const SAMPLE_USERS = [
  { name: "Aarav Patel", email: "aarav@example.com", fitnessGoals: '["muscle_gain","strength"]', preferredWorkouts: '["weightlifting","crossfit"]', budgetRange: "high" },
  { name: "Ishita Sharma", email: "ishita@example.com", fitnessGoals: '["weight_loss","flexibility"]', preferredWorkouts: '["yoga","cardio"]', budgetRange: "medium" },
  { name: "Rohan Gupta", email: "rohan@example.com", fitnessGoals: '["general_fitness"]', preferredWorkouts: '["mixed"]', budgetRange: "low" },
  { name: "Sneha Kumar", email: "sneha@example.com", fitnessGoals: '["toning","endurance"]', preferredWorkouts: '["hiit","dance"]', budgetRange: "medium" },
  { name: "Vikram Singh", email: "vikram@example.com", fitnessGoals: '["powerlifting"]', preferredWorkouts: '["powerlifting","strongman"]', budgetRange: "high" },
  { name: "Priya Nair", email: "priya@example.com", fitnessGoals: '["weight_loss","mental_health"]', preferredWorkouts: '["yoga","pilates"]', budgetRange: "medium" },
  { name: "Arjun Reddy", email: "arjun@example.com", fitnessGoals: '["muscle_gain"]', preferredWorkouts: '["bodybuilding"]', budgetRange: "low" },
  { name: "Meera Das", email: "meera@example.com", fitnessGoals: '["general_fitness","social"]', preferredWorkouts: '["group_classes","zumba"]', budgetRange: "medium" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = randomInt(min, max);
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─── Seed Functions ──────────────────────────────────────────────────────────

async function seedUsers() {
  console.log("👤 Seeding users...");
  const users = [];
  for (const u of SAMPLE_USERS) {
    const user = await prisma.user.create({ data: u });
    users.push(user);
  }
  console.log(`   Created ${users.length} users`);
  return users;
}

async function seedGyms() {
  console.log("🏋️ Seeding gyms...");
  const gyms = [];
  for (const g of GYMS) {
    const gym = await prisma.gym.create({ data: g });
    gyms.push(gym);
  }
  console.log(`   Created ${gyms.length} gyms`);
  return gyms;
}

async function seedGymHours(gyms: { id: string }[]) {
  console.log("🕐 Seeding gym hours...");
  let count = 0;
  for (const gym of gyms) {
    for (let day = 0; day < 7; day++) {
      const isSunday = day === 0;
      await prisma.gymHour.create({
        data: {
          gymId: gym.id,
          dayOfWeek: day,
          openTime: isSunday ? "08:00" : "06:00",
          closeTime: isSunday ? "18:00" : "22:00",
          isClosed: false,
        },
      });
      count++;
    }
  }
  console.log(`   Created ${count} hour entries`);
}

async function seedAmenities(gyms: { id: string; type: string }[]) {
  console.log("✨ Seeding amenities...");
  let count = 0;
  for (const gym of gyms) {
    const numAmenities = gym.type === "budget" ? randomInt(4, 6) : randomInt(6, 12);
    const selected = randomSubset(AMENITIES_POOL, numAmenities, numAmenities);
    for (const amenity of selected) {
      await prisma.gymAmenity.create({
        data: {
          gymId: gym.id,
          amenityName: amenity.name,
          icon: amenity.icon,
        },
      });
      count++;
    }
  }
  console.log(`   Created ${count} amenity entries`);
}

async function seedMemberships(gyms: { id: string; priceRange: string }[]) {
  console.log("💳 Seeding memberships...");
  let count = 0;
  const priceMultiplier: Record<string, number> = { budget: 0.5, mid: 1, premium: 2 };

  for (const gym of gyms) {
    const mult = priceMultiplier[gym.priceRange] || 1;
    const plans = [
      { planName: "Day Pass", price: Math.round(200 * mult), durationMonths: 0, features: '["gym_access"]', isPopular: false },
      { planName: "Monthly", price: Math.round(1500 * mult), durationMonths: 1, features: '["gym_access","locker"]', isPopular: false },
      { planName: "Quarterly", price: Math.round(4000 * mult), durationMonths: 3, features: '["gym_access","locker","group_classes"]', isPopular: true },
      { planName: "Annual", price: Math.round(12000 * mult), durationMonths: 12, features: '["gym_access","locker","group_classes","personal_trainer_1_session"]', isPopular: false },
    ];
    for (const plan of plans) {
      await prisma.membership.create({
        data: { gymId: gym.id, ...plan },
      });
      count++;
    }
  }
  console.log(`   Created ${count} membership plans`);
}

async function seedPhotos(gyms: { id: string; imageUrl: string | null }[]) {
  console.log("📸 Seeding photos...");
  let count = 0;
  const stockPhotos = [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800",
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800",
    "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800",
  ];

  for (const gym of gyms) {
    if (gym.imageUrl) {
      await prisma.gymPhoto.create({
        data: { gymId: gym.id, url: gym.imageUrl, caption: "Main entrance", isPrimary: true, order: 0 },
      });
      count++;
    }
    const extraPhotos = randomInt(2, 4);
    for (let i = 0; i < extraPhotos; i++) {
      await prisma.gymPhoto.create({
        data: { gymId: gym.id, url: randomPick(stockPhotos), caption: `Photo ${i + 1}`, isPrimary: false, order: i + 1 },
      });
      count++;
    }
  }
  console.log(`   Created ${count} photos`);
}

async function seedReviews(gyms: { id: string }[], users: { id: string }[]) {
  console.log("⭐ Seeding reviews...");
  let count = 0;
  for (const gym of gyms) {
    const numReviews = randomInt(3, 7);
    const reviewers = randomSubset(users, numReviews, numReviews);
    for (const user of reviewers) {
      const rating = randomFloat(2.5, 5, 1);
      await prisma.review.create({
        data: {
          gymId: gym.id,
          userId: user.id,
          rating,
          cleanliness: randomFloat(2, 5, 1),
          equipment: randomFloat(2, 5, 1),
          staff: randomFloat(2, 5, 1),
          valueForMoney: randomFloat(2, 5, 1),
          text: randomPick(REVIEW_TEXTS),
          helpfulCount: randomInt(0, 15),
          isVerified: Math.random() > 0.5,
        },
      });
      count++;
    }
  }
  console.log(`   Created ${count} reviews`);
}

async function seedClasses(gyms: { id: string; type: string }[]) {
  console.log("📅 Seeding classes...");
  let count = 0;
  for (const gym of gyms) {
    if (["budget"].includes(gym.type)) continue;
    const numClasses = randomInt(3, 6);
    const selectedClasses = randomSubset(CLASS_TYPES, numClasses, numClasses);
    for (const cls of selectedClasses) {
      const dayOfWeek = randomInt(1, 6);
      const startHour = randomInt(6, 18);
      const startTime = `${String(startHour).padStart(2, "0")}:00`;
      const endMinutes = startHour * 60 + cls.duration;
      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

      await prisma.gymClass.create({
        data: {
          gymId: gym.id,
          className: cls.className,
          instructor: randomPick(INSTRUCTORS),
          dayOfWeek,
          startTime,
          endTime,
          capacity: randomInt(10, 30),
          category: cls.category,
        },
      });
      count++;
    }
  }
  console.log(`   Created ${count} class entries`);
}

async function seedProjectTasks() {
  console.log("📋 Seeding project tasks from mygym.json...");
  const dbPath = path.join(__dirname, "..", "mygym.json");
  const raw = fs.readFileSync(dbPath, "utf-8");
  const mygymDB = JSON.parse(raw);

  let count = 0;
  for (const phase of mygymDB.phases) {
    for (const task of phase.tasks) {
      for (const subtask of task.subtasks) {
        await prisma.projectTask.create({
          data: {
            id: subtask.id,
            phaseId: phase.id,
            taskId: task.id,
            name: subtask.name,
            status: subtask.status || "pending",
            testType: subtask.test.type,
            testSpec: JSON.stringify(subtask.test),
          },
        });
        count++;
      }
    }
  }
  console.log(`   Created ${count} project tasks`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 Seeding MyGym Database...\n");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.reviewReport.deleteMany();
  await prisma.reviewHelpful.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.gymClass.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.gymPhoto.deleteMany();
  await prisma.gymAmenity.deleteMany();
  await prisma.gymHour.deleteMany();
  await prisma.gym.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.projectTask.deleteMany();

  // Seed all data
  const users = await seedUsers();
  const gyms = await seedGyms();
  await seedGymHours(gyms);
  await seedAmenities(gyms);
  await seedMemberships(gyms);
  await seedPhotos(gyms);
  await seedReviews(gyms, users);
  await seedClasses(gyms);
  await seedProjectTasks();

  // Print summary
  const gymCount = await prisma.gym.count();
  const userCount = await prisma.user.count();
  const reviewCount = await prisma.review.count();
  const amenityCount = await prisma.gymAmenity.count();
  const membershipCount = await prisma.membership.count();
  const hourCount = await prisma.gymHour.count();
  const photoCount = await prisma.gymPhoto.count();
  const classCount = await prisma.gymClass.count();
  const taskCount = await prisma.projectTask.count();

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║           🌱 Seed Complete — Summary             ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log(`║  Users:        ${String(userCount).padStart(4)}                           ║`);
  console.log(`║  Gyms:         ${String(gymCount).padStart(4)}                           ║`);
  console.log(`║  Hours:        ${String(hourCount).padStart(4)}                           ║`);
  console.log(`║  Amenities:    ${String(amenityCount).padStart(4)}                           ║`);
  console.log(`║  Memberships:  ${String(membershipCount).padStart(4)}                           ║`);
  console.log(`║  Photos:       ${String(photoCount).padStart(4)}                           ║`);
  console.log(`║  Reviews:      ${String(reviewCount).padStart(4)}                           ║`);
  console.log(`║  Classes:      ${String(classCount).padStart(4)}                           ║`);
  console.log(`║  Tasks:        ${String(taskCount).padStart(4)}                           ║`);
  console.log("╚══════════════════════════════════════════════════╝\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
