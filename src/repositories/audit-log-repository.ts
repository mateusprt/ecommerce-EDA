import { db } from '../database/database.js';
import { AuditLog } from '../models/audit-log.js';

export class AuditLogRepository {
  create(auditLog: AuditLog): number {
    const insert = db.prepare(`
      INSERT INTO audit_logs (event_type, entity_type, entity_id, action, data, occurred_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      auditLog.event_type,
      auditLog.entity_type,
      auditLog.entity_id,
      auditLog.action,
      auditLog.data,
      auditLog.occurred_at
    );

    return result.lastInsertRowid as number;
  }
}
