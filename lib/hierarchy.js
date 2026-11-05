// Strict hierarchy and role permission logic for SalesTrack
import { ROLES, REQUIRED_PARENT_ROLE } from './constants';

/**
 * Recursively retrieves all descendant user IDs in the downward hierarchy of a manager.
 * For example:
 * - NSM -> gets all RSMs, ASMs, TSMs, and SEs under their branch.
 * - RSM -> gets all ASMs, TSMs, and SEs under their branch.
 * - ASM -> gets all TSMs and SEs under their branch.
 * - TSM -> gets all SEs under their supervision.
 * - SE -> empty list (SE has no subordinates).
 */
export function getSubordinateIds(managerId, allUsers = []) {
  if (!managerId || !Array.isArray(allUsers)) return [];

  const directSubordinates = allUsers.filter(
    (user) => user.parentId === managerId
  );

  let descendantIds = [];
  for (const sub of directSubordinates) {
    descendantIds.push(sub.id);
    descendantIds = descendantIds.concat(getSubordinateIds(sub.id, allUsers));
  }

  return descendantIds;
}

/**
 * Returns all user objects belonging to a manager's subordinate downline.
 */
export function getSubordinateUsers(managerId, allUsers = []) {
  const ids = getSubordinateIds(managerId, allUsers);
  return allUsers.filter((u) => ids.includes(u.id));
}

/**
 * Only Sales Executives can submit reports among normal employees.
 * (Admin does not need to submit reports, though can view/edit all reports).
 */
export function canSubmitReport(user) {
  if (!user) return false;
  return user.role === ROLES.SALES_EXECUTIVE;
}

/**
 * Checks if a user has permission to view a specific report:
 * - Admin: can view all company reports.
 * - Sales Executive: can view only their own reports.
 * - Managers (NSM, RSM, ASM, TSM): can only view reports from their own subordinate hierarchy.
 */
export function canViewReport(currentUser, report, allUsers = []) {
  if (!currentUser || !report) return false;

  // Admin has access to all reports
  if (currentUser.role === ROLES.ADMIN) return true;

  // Author can always view their own report
  if (currentUser.id === report.userId) return true;

  // Managers can view only if the author is in their subordinate downline
  const subordinateIds = getSubordinateIds(currentUser.id, allUsers);
  return subordinateIds.includes(report.userId);
}

/**
 * Checks if a user has permission to edit a specific report:
 * - Sales Executives CANNOT edit their reports after submission.
 * - Admin has full control to edit/update any report.
 * - All management tiers (NSM, RSM, ASM, TSM) are strictly read-only.
 */
export function canEditReport(currentUser, report) {
  if (!currentUser || !report) return false;

  // Only Admin has permission to edit submitted reports
  return currentUser.role === ROLES.ADMIN;
}

/**
 * Checks if a user has permission to delete a specific report:
 * - Only Admin can delete reports.
 */
export function canDeleteReport(currentUser) {
  return currentUser?.role === ROLES.ADMIN;
}

/**
 * Enforces strict non-skipping parent assignment when creating/editing a user.
 * Returns only the active users that can be selected as the immediate parent for a role:
 * - NSM must report to Admin.
 * - RSM must report to NSM.
 * - ASM must report to RSM.
 * - TSM must report to ASM.
 * - SE must report to TSM.
 */
export function getEligibleParents(roleToAssign, allUsers = []) {
  const expectedParentRole = REQUIRED_PARENT_ROLE[roleToAssign];
  if (!expectedParentRole) return [];
  return allUsers.filter(
    (u) => u.role === expectedParentRole && u.status === 'ACTIVE'
  );
}

/**
 * Builds the upward reporting chain for a user up to the Admin.
 */
export function getReportingChain(userId, allUsers = []) {
  const chain = [];
  let current = allUsers.find((u) => u.id === userId);

  while (current && current.parentId) {
    const parent = allUsers.find((u) => u.id === current.parentId);
    if (!parent) break;
    chain.push(parent);
    current = parent;
  }

  return chain;
}

/**
 * Checks if a report already exists for the given employee and date.
 * Prevents duplicate reports for the same employee on the same date.
 */
export function checkDuplicateReport(userId, dateString, allReports = [], excludeReportId = null) {
  if (!userId || !dateString) return null;
  return allReports.find(
    (r) =>
      r.userId === userId &&
      r.date === dateString &&
      (!excludeReportId || r.id !== excludeReportId)
  ) || null;
}

