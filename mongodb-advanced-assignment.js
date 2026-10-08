use company_advanced

// Task 1
db.createCollection("employees", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "departmentId", "experience", "active"],
      properties: {
        name: { bsonType: "string" },
        departmentId: { bsonType: "int" },
        experience: { bsonType: "int" },
        active: { bsonType: "bool" }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
})

db.employees.insertMany([
  {
    _id: 1,
    name: "John",
    departmentId: NumberInt(10),
    skills: ["Java", "MongoDB"],
    experience: NumberInt(4),
    active: true,
    certifications: [
      { name: "MongoDB", status: "Expired", expiryYear: NumberInt(2026) }
    ]
  },
  {
    _id: 2,
    name: "Alice",
    departmentId: NumberInt(10),
    skills: ["Python", "MongoDB"],
    experience: NumberInt(6),
    active: true,
    certifications: [
      { name: "MongoDB", status: "Active", expiryYear: NumberInt(2028) }
    ]
  },
  {
    _id: 3,
    name: "David",
    departmentId: NumberInt(20),
    skills: ["Communication"],
    experience: NumberInt(3),
    active: false,
    certifications: [
      { name: "Communication", status: "Active", expiryYear: NumberInt(2027) }
    ]
  }
])

db.employees.insertOne({
  _id: 99,
  name: 123,
  departmentId: "HR",
  experience: "one",
  active: "yes"
})

// Task 2
db.employees.find({
  certifications: {
    $elemMatch: {
      name: "MongoDB",
      status: "Active"
    }
  }
})

db.employees.updateOne(
  {
    _id: 1,
    "certifications.name": "MongoDB"
  },
  {
    $set: {
      "certifications.$.status": "Active"
    }
  }
)

db.employees.updateMany(
  {},
  {
    $set: {
      "certifications.$[cert].status": "Renewal Due"
    }
  },
  {
    arrayFilters: [
      { "cert.expiryYear": { $lt: 2027 } }
    ]
  }
)

// Task 3
db.employees.bulkWrite([
  {
    updateOne: {
      filter: { _id: 1 },
      update: { $inc: { experience: 1 } }
    }
  },
  {
    updateOne: {
      filter: { _id: 2 },
      update: { $set: { active: false } }
    }
  },
  {
    insertOne: {
      document: {
        _id: 4,
        name: "Emma",
        departmentId: NumberInt(20),
        skills: ["Excel"],
        experience: NumberInt(2),
        active: true,
        certifications: [
          { name: "Excel", status: "Active", expiryYear: NumberInt(2026) }
        ]
      }
    }
  }
])

// Task 4
db.departments.insertMany([
  { _id: NumberInt(10), name: "Engineering" },
  { _id: NumberInt(20), name: "HR" }
])

db.employees.aggregate([
  {
    $lookup: {
      from: "departments",
      localField: "departmentId",
      foreignField: "_id",
      as: "department"
    }
  },
  { $unwind: "$department" },
  {
    $project: {
      _id: 0,
      employeeName: "$name",
      departmentName: "$department.name"
    }
  },
  { $sort: { employeeName: 1 } }
])

db.employees.aggregate([
  { $unwind: "$skills" },
  {
    $group: {
      _id: "$skills",
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1, _id: 1 } }
])

db.employees.aggregate([
  {
    $facet: {
      activeEmployees: [
        { $match: { active: true } },
        { $project: { _id: 0, name: 1 } },
        { $sort: { name: 1 } }
      ],
      activeEmployeeCount: [
        { $match: { active: true } },
        { $count: "total" }
      ]
    }
  }
])

// Task 5
db.employees.createIndex(
  { departmentId: 1, name: 1 },
  { name: "departmentId_1_name_1" }
)

db.employees
  .find({ departmentId: 10 })
  .sort({ name: 1 })
  .explain("executionStats")

db.sessions.insertOne({
  _id: 1,
  userName: "John",
  expiresAt: new Date(Date.now() + 600000)
})

db.sessions.createIndex(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    name: "expiresAt_1"
  }
)