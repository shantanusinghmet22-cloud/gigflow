import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import Lead from '../models/Lead';
import { AuthRequest, ILead, LeadFilters, LeadSource, LeadStatus, UserRole } from '../types';

// Helper to build the mongo filter object from query params
const buildFilter = (
  filters: LeadFilters,
  userId?: string,
  isAdmin?: boolean
): FilterQuery<ILead> => {
  const query: FilterQuery<ILead> = {};

  // Sales users only see their own leads
  if (!isAdmin && userId) {
    query.createdBy = userId;
  }

  if (filters.status) query.status = filters.status;
  if (filters.source) query.source = filters.source;

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    query.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  return query;
};

// GET /api/leads
export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sort = 'latest',
      page = '1',
      limit = '10',
    } = req.query as Record<string, string>;

    const filters: LeadFilters = {
      status: status as LeadStatus,
      source: source as LeadSource,
      search,
      sort: sort as 'latest' | 'oldest',
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const isAdmin = req.user?.role === UserRole.ADMIN;
    const mongoFilter = buildFilter(filters, req.user?.id, isAdmin);

    const sortOrder = sort === 'oldest' ? 1 : -1;
    const pageNum = Math.max(1, filters.page ?? 1);
    const limitNum = Math.min(50, Math.max(1, filters.limit ?? 10));
    const skip = (pageNum - 1) * limitNum;

    const [leads, total] = await Promise.all([
      Lead.find(mongoFilter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Lead.countDocuments(mongoFilter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: leads,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

// GET /api/leads/:id
export const getLeadById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id).populate('createdBy', 'name email');

    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found.' });
      return;
    }

    // Sales user can only see their own leads
    const isAdmin = req.user?.role === UserRole.ADMIN;
    if (!isAdmin && lead.createdBy.toString() !== req.user?.id) {
      res.status(403).json({ success: false, error: 'Not authorized to view this lead.' });
      return;
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

// POST /api/leads
export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, status, source, notes } = req.body;

    const lead = await Lead.create({
      name,
      email,
      status: status ?? LeadStatus.NEW,
      source,
      notes,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully.',
      data: lead,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

// PATCH /api/leads/:id
export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found.' });
      return;
    }

    // Sales users can only update their own leads
    const isAdmin = req.user?.role === UserRole.ADMIN;
    if (!isAdmin && lead.createdBy.toString() !== req.user?.id) {
      res.status(403).json({ success: false, error: 'Not authorized to update this lead.' });
      return;
    }

    const { name, email, status, source, notes } = req.body;
    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { name, email, status, source, notes },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully.',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

// DELETE /api/leads/:id
export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found.' });
      return;
    }

    const isAdmin = req.user?.role === UserRole.ADMIN;
    if (!isAdmin && lead.createdBy.toString() !== req.user?.id) {
      res.status(403).json({ success: false, error: 'Not authorized to delete this lead.' });
      return;
    }

    await lead.deleteOne();

    res.status(200).json({ success: true, message: 'Lead deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

// GET /api/leads/export/csv
export const exportLeadsCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, source, search } = req.query as Record<string, string>;
    const isAdmin = req.user?.role === UserRole.ADMIN;
    const mongoFilter = buildFilter({ status: status as LeadStatus, source: source as LeadSource, search }, req.user?.id, isAdmin);

    const leads = await Lead.find(mongoFilter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const headers = ['Name', 'Email', 'Status', 'Source', 'Notes', 'Created By', 'Created At'];
    const rows = leads.map((lead) => [
      lead.name,
      lead.email,
      lead.status,
      lead.source,
      lead.notes ?? '',
      (lead.createdBy as any)?.name ?? '',
      new Date(lead.createdAt).toISOString().split('T')[0],
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="gigflow-leads-${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
