const memberRepository = require("../repositories/memberRepository");
const transactionRepository = require("../repositories/transactionRepository");
const { AppError } = require("../middleware");
const { sumOutstandingFine } = require("../utils/fineUtils");

function normalizeMemberInput(data) {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    address: data.address || null,
    membership_date: data.membership_date,
    status: data.status || "active",
  };
}

async function attachOutstandingFine(member) {
  const transactions = await transactionRepository.findByMemberId(member.id);
  return {
    ...member,
    outstanding_fine: sumOutstandingFine(transactions),
  };
}

async function getAllMembers() {
  const members = await memberRepository.findAll();
  return Promise.all(members.map(attachOutstandingFine));
}

async function getMemberById(id) {
  const member = await memberRepository.findById(id);
  if (!member) return null;
  return attachOutstandingFine(member);
}

async function createMember(data) {
  if (!data.name || !data.email || !data.membership_date) {
    throw new AppError("Name, email, and membership date are required", 400);
  }

  const id = await memberRepository.create(normalizeMemberInput(data));
  return getMemberById(id);
}

async function updateMember(id, data) {
  const existing = await memberRepository.findById(id);
  if (!existing) return null;

  const merged = {
    name: data.name ?? existing.name,
    email: data.email ?? existing.email,
    phone: data.phone ?? existing.phone,
    address: data.address ?? existing.address,
    membership_date: data.membership_date ?? existing.membership_date,
    status: data.status ?? existing.status,
  };

  await memberRepository.update(id, merged);
  return getMemberById(id);
}

async function deleteMember(id) {
  const existing = await memberRepository.findById(id);
  if (!existing) return false;
  return memberRepository.remove(id);
}

module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};
