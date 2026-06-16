const memberService = require('../services/memberService');
const { AppError } = require('../middleware');

async function listMembers(req, res) {
  const members = await memberService.getAllMembers();
  res.json(members);
}

async function getMember(req, res) {
  const member = await memberService.getMemberById(req.params.id);
  if (!member) throw new AppError('Member not found', 404);
  res.json(member);
}

async function createMember(req, res) {
  const member = await memberService.createMember(req.body);
  res.status(201).json(member);
}

async function updateMember(req, res) {
  const member = await memberService.updateMember(req.params.id, req.body);
  if (!member) throw new AppError('Member not found', 404);
  res.json(member);
}

async function deleteMember(req, res) {
  const deleted = await memberService.deleteMember(req.params.id);
  if (!deleted) throw new AppError('Member not found', 404);
  res.json({ message: 'Member deleted successfully' });
}

module.exports = {
  listMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
};
