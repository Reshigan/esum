/**
 * ESUM Energy Trading Platform - IPP Projects Worker
 * Independent Power Producer project management and financial close tracking
 */

interface Env {
  DB: D1Database;
  R2: R2Bucket;
  NOTIFICATION_QUEUE: Queue;
  ENVIRONMENT: string;
}

// ============================================================================
// IPP PROJECT MANAGEMENT
// ============================================================================

async function createProject(
  projectData: {
    ipp_org_id: string;
    project_name: string;
    project_type: string;
    province: string;
    location?: string;
    capacity_mw: number;
    estimated_annual_generation_gwh?: number;
    total_investment_zar?: number;
  },
  user_id: string,
  env: Env
): Promise<{ project_id: string; status: string }> {
  const projectId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Create project
  await env.DB.prepare(`
    INSERT INTO ipp_projects (
      id, ipp_org_id, project_name, project_type, province, location,
      capacity_mw, estimated_annual_generation_gwh, total_investment_zar,
      status, created_by_user_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    projectId,
    projectData.ipp_org_id,
    projectData.project_name,
    projectData.project_type,
    projectData.province,
    projectData.location || null,
    projectData.capacity_mw,
    projectData.estimated_annual_generation_gwh || null,
    projectData.total_investment_zar || null,
    'concept',
    user_id,
    now,
    now
  ).run();

  // Create standard financial close milestones for this project type
  await createStandardMilestones(projectId, projectData.project_type, user_id, env);

  // Log project creation
  await logProjectUpdate(projectId, 'general', 'Project Created', `Project ${projectData.project_name} created`, 'internal', user_id, env);

  return {
    project_id: projectId,
    status: 'concept'
  };
}

async function createStandardMilestones(
  projectId: string,
  projectType: string,
  userId: string,
  env: Env
) {
  const standardMilestones = [
    'land_acquisition',
    'grid_connection_approval',
    'environmental_authorization',
    'water_use_license',
    'municipal_approvals',
    'offtake_agreement',
    'engineering_procurement',
    'equity_commitment',
    'debt_commitment',
    'insurance_arrangement',
    'operations_maintenance',
    'regulatory_compliance'
  ];

  const now = new Date().toISOString();

  for (const milestoneType of standardMilestones) {
    await env.DB.prepare(`
      INSERT INTO financial_close_milestones (
        id, project_id, milestone_type, description, status, created_by_user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      projectId,
      milestoneType,
      `Complete ${milestoneType.replace(/_/g, ' ')} requirements`,
      'not_started',
      userId,
      now,
      now
    ).run();
  }
}

async function updateMilestoneStatus(
  milestoneId: string,
  status: string,
  completionPercent: number,
  userId: string,
  env: Env
): Promise<{ success: boolean }> {
  const now = new Date().toISOString();

  const milestone = await env.DB.prepare(`SELECT * FROM financial_close_milestones WHERE id = ?`).bind(milestoneId).first();
  if (!milestone) {
    throw new Error('Milestone not found');
  }

  let actualDate = milestone.actual_date;
  if (status === 'completed' && !actualDate) {
    actualDate = now;
  }

  await env.DB.prepare(`
    UPDATE financial_close_milestones
    SET status = ?, completion_percent = ?, actual_date = ?, updated_at = ?
    WHERE id = ?
  `).bind(status, completionPercent, actualDate, now, milestoneId).run();

  // Update project overall progress
  await updateProjectFinancialCloseProgress(milestone.project_id, env);

  // Notify stakeholders
  await env.NOTIFICATION_QUEUE.send({
    type: 'milestone_updated',
    project_id: milestone.project_id,
    milestone_id: milestoneId,
    milestone_type: milestone.milestone_type,
    new_status: status,
    completion_percent: completionPercent,
    timestamp: now
  });

  return { success: true };
}

async function updateProjectFinancialCloseProgress(
  projectId: string,
  env: Env
): Promise<void> {
  // Calculate overall milestone completion
  const { results: milestones } = await env.DB.prepare(`
    SELECT status, completion_percent FROM financial_close_milestones WHERE project_id = ?
  `).bind(projectId).all();

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m: any) => m.status === 'completed').length;
  const avgCompletion = milestones.reduce((sum: number, m: any) => sum + (m.completion_percent || 0), 0) / totalMilestones;

  // Determine project status based on milestone progress
  let projectStatus = 'concept';
  const completionRate = completedMilestones / totalMilestones;

  if (completionRate > 0.9) projectStatus = 'financial_close';
  else if (completionRate > 0.7) projectStatus = 'development';
  else if (completionRate > 0.4) projectStatus = 'feasibility';

  await env.DB.prepare(`
    UPDATE ipp_projects
    SET status = ?, construction_progress = ?, updated_at = ?
    WHERE id = ?
  `).bind(projectStatus, Math.round(avgCompletion), new Date().toISOString(), projectId).run();
}

async function createOfftakeAgreement(
  agreementData: {
    ipp_org_id: string;
    offtaker_org_id: string;
    project_id?: string;
    agreement_type: string;
    contract_tenor_years: number;
    contracted_capacity_mw: number;
    tariff_structure: string;
    base_tariff_zar_kwh: number;
    delivery_point: string;
  },
  userId: string,
  env: Env
): Promise<{ agreement_id: string }> {
  const agreementId = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(`
    INSERT INTO offtake_agreements (
      id, ipp_org_id, offtaker_org_id, project_id, agreement_type,
      contract_tenor_years, contracted_capacity_mw, tariff_structure,
      base_tariff_zar_kwh, delivery_point, status, created_by_user_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    agreementId,
    agreementData.ipp_org_id,
    agreementData.offtaker_org_id,
    agreementData.project_id || null,
    agreementData.agreement_type,
    agreementData.contract_tenor_years,
    agreementData.contracted_capacity_mw,
    agreementData.tariff_structure,
    agreementData.base_tariff_zar_kwh,
    agreementData.delivery_point,
    'term_sheet',
    userId,
    now,
    now
  ).run();

  // Update milestone if linked to project
  if (agreementData.project_id) {
    await env.DB.prepare(`
      UPDATE financial_close_milestones
      SET status = 'completed', actual_date = ?, updated_at = ?
      WHERE project_id = ? AND milestone_type = 'offtake_agreement'
    `).bind(now, now, agreementData.project_id).run();

    await updateProjectFinancialCloseProgress(agreementData.project_id, env);
  }

  return { agreement_id: agreementId };
}

async function getProjectDashboard(
  projectId: string,
  env: Env
): Promise<any> {
  // Get project details
  const project = await env.DB.prepare(`
    SELECT p.*, o.name as ipp_name
    FROM ipp_projects p
    JOIN organisations o ON p.ipp_org_id = o.id
    WHERE p.id = ?
  `).bind(projectId).first();

  if (!project) {
    throw new Error('Project not found');
  }

  // Get milestones
  const { results: milestones } = await env.DB.prepare(`
    SELECT * FROM financial_close_milestones WHERE project_id = ? ORDER BY milestone_type
  `).bind(projectId).all();

  // Get offtake agreements
  const { results: offtakes } = await env.DB.prepare(`
    SELECT oa.*, o.name as offtaker_name
    FROM offtake_agreements oa
    LEFT JOIN organisations o ON oa.offtaker_org_id = o.id
    WHERE oa.project_id = ? OR oa.ipp_org_id = ?
  `).bind(projectId, project.ipp_org_id).all();

  // Get investor commitments
  const { results: commitments } = await env.DB.prepare(`
    SELECT ic.*, o.name as investor_name
    FROM investor_commitments ic
    JOIN organisations o ON ic.investor_org_id = o.id
    WHERE ic.project_id = ?
  `).bind(projectId).all();

  // Get recent updates
  const { results: updates } = await env.DB.prepare(`
    SELECT * FROM project_updates WHERE project_id = ? ORDER BY created_at DESC LIMIT 10
  `).bind(projectId).all();

  // Calculate financial close readiness
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m: any) => m.status === 'completed').length;
  const financialCloseReadiness = Math.round((completedMilestones / totalMilestones) * 100);

  // Calculate funding secured
  const totalCommitment = commitments.reduce((sum: number, c: any) => sum + (c.committed_amount_zar || 0), 0);
  const totalDisbursed = commitments.reduce((sum: number, c: any) => sum + (c.disbursed_amount_zar || 0), 0);

  return {
    project,
    milestones: {
      total: totalMilestones,
      completed: completedMilestones,
      in_progress: milestones.filter((m: any) => m.status === 'in_progress').length,
      not_started: milestones.filter((m: any) => m.status === 'not_started').length,
      blocked: milestones.filter((m: any) => m.status === 'blocked').length,
      items: milestones
    },
    offtakes,
    funding: {
      total_commitment_zar: totalCommitment,
      total_disbursed_zar: totalDisbursed,
      commitments_count: commitments.length
    },
    financial_close_readiness: financialCloseReadiness,
    recent_updates: updates
  };
}

async function addProjectUpdate(
  projectId: string,
  updateData: {
    update_type: string;
    title: string;
    content: string;
    visibility: string;
  },
  userId: string,
  env: Env
): Promise<{ update_id: string }> {
  const updateId = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(`
    INSERT INTO project_updates (
      id, project_id, update_type, title, content, visibility,
      author_user_id, published_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    updateId,
    projectId,
    updateData.update_type,
    updateData.title,
    updateData.content,
    updateData.visibility,
    userId,
    now,
    now,
    now
  ).run();

  // Notify stakeholders based on visibility
  if (updateData.visibility !== 'internal') {
    await env.NOTIFICATION_QUEUE.send({
      type: 'project_update_published',
      project_id: projectId,
      update_id: updateId,
      visibility: updateData.visibility,
      timestamp: now
    });
  }

  return { update_id: updateId };
}

async function addInvestorCommitment(
  commitmentData: {
    project_id: string;
    investor_org_id: string;
    commitment_type: string;
    committed_amount_zar: number;
    currency?: string;
    interest_rate_percent?: number;
    tenor_years?: number;
  },
  userId: string,
  env: Env
): Promise<{ commitment_id: string }> {
  const commitmentId = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(`
    INSERT INTO investor_commitments (
      id, project_id, investor_org_id, commitment_type,
      committed_amount_zar, currency, interest_rate_percent, tenor_years,
      status, created_by_user_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    commitmentId,
    commitmentData.project_id,
    commitmentData.investor_org_id,
    commitmentData.commitment_type,
    commitmentData.committed_amount_zar,
    commitmentData.currency || 'ZAR',
    commitmentData.interest_rate_percent || null,
    commitmentData.tenor_years || null,
    'committed',
    userId,
    now,
    now
  ).run();

  // Update milestone
  await env.DB.prepare(`
    UPDATE financial_close_milestones
    SET status = 'completed', actual_date = ?, updated_at = ?
    WHERE project_id = ? AND milestone_type IN ('equity_commitment', 'debt_commitment')
  `).bind(now, now, commitmentData.project_id).run();

  return { commitment_id: commitmentId };
}

// ============================================================================
// WORKER HANDLER
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Create IPP project
      if (path === '/api/ipp/projects' && request.method === 'POST') {
        const body = await request.json();
        const userId = request.headers.get('X-User-ID') || 'system';
        const result = await createProject(body, userId, env);
        return Response.json({ success: true, data: result }, { status: 201 });
      }

      // Get IPP projects for organisation
      if (path === '/api/ipp/projects' && request.method === 'GET') {
        const orgId = url.searchParams.get('org_id');
        const status = url.searchParams.get('status');

        let query = `SELECT * FROM ipp_projects WHERE 1=1`;
        const params: any[] = [];

        if (orgId) {
          query += ` AND ipp_org_id = ?`;
          params.push(orgId);
        }
        if (status) {
          query += ` AND status = ?`;
          params.push(status);
        }

        query += ` ORDER BY created_at DESC`;

        const { results } = await env.DB.prepare(query).bind(...params).all();

        return Response.json({
          success: true,
          data: results,
          count: results.length
        });
      }

      // Get project dashboard
      if (path.match(/^\/api\/ipp\/projects\/[^\/]+\/dashboard$/) && request.method === 'GET') {
        const projectId = path.split('/')[4];
        const dashboard = await getProjectDashboard(projectId, env);
        return Response.json({ success: true, data: dashboard });
      }

      // Update milestone status
      if (path.match(/^\/api\/ipp\/milestones\/[^\/]+\/status$/) && request.method === 'PUT') {
        const milestoneId = path.split('/')[4];
        const body = await request.json();
        const userId = request.headers.get('X-User-ID') || 'system';
        const result = await updateMilestoneStatus(
          milestoneId,
          body.status,
          body.completion_percent || 0,
          userId,
          env
        );
        return Response.json(result);
      }

      // Create offtake agreement
      if (path === '/api/ipp/offtake-agreements' && request.method === 'POST') {
        const body = await request.json();
        const userId = request.headers.get('X-User-ID') || 'system';
        const result = await createOfftakeAgreement(body, userId, env);
        return Response.json({ success: true, data: result }, { status: 201 });
      }

      // Get offtake agreements
      if (path === '/api/ipp/offtake-agreements' && request.method === 'GET') {
        const orgId = url.searchParams.get('org_id');
        const status = url.searchParams.get('status');

        let query = `SELECT * FROM offtake_agreements WHERE 1=1`;
        const params: any[] = [];

        if (orgId) {
          query += ` AND (ipp_org_id = ? OR offtaker_org_id = ?)`;
          params.push(orgId, orgId);
        }
        if (status) {
          query += ` AND status = ?`;
          params.push(status);
        }

        query += ` ORDER BY created_at DESC`;

        const { results } = await env.DB.prepare(query).bind(...params).all();

        return Response.json({
          success: true,
          data: results,
          count: results.length
        });
      }

      // Add project update
      if (path.match(/^\/api\/ipp\/projects\/[^\/]+\/updates$/) && request.method === 'POST') {
        const projectId = path.split('/')[4];
        const body = await request.json();
        const userId = request.headers.get('X-User-ID') || 'system';
        const result = await addProjectUpdate(projectId, body, userId, env);
        return Response.json({ success: true, data: result }, { status: 201 });
      }

      // Add investor commitment
      if (path === '/api/ipp/investor-commitments' && request.method === 'POST') {
        const body = await request.json();
        const userId = request.headers.get('X-User-ID') || 'system';
        const result = await addInvestorCommitment(body, userId, env);
        return Response.json({ success: true, data: result }, { status: 201 });
      }

      // Get investor commitments
      if (path === '/api/ipp/investor-commitments' && request.method === 'GET') {
        const projectId = url.searchParams.get('project_id');
        const type = url.searchParams.get('type');

        let query = `SELECT * FROM investor_commitments WHERE 1=1`;
        const params: any[] = [];

        if (projectId) {
          query += ` AND project_id = ?`;
          params.push(projectId);
        }
        if (type) {
          query += ` AND commitment_type = ?`;
          params.push(type);
        }

        query += ` ORDER BY created_at DESC`;

        const { results } = await env.DB.prepare(query).bind(...params).all();

        return Response.json({
          success: true,
          data: results,
          count: results.length
        });
      }

      return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('IPP Projects error:', error);
      return Response.json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500, headers: corsHeaders });
    }
  }
};
