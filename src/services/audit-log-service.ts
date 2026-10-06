import { AuditLogRepository } from '../repositories/audit-log-repository.js';
import { AuditLog } from '../models/audit-log.js';

export class AuditLogService {
  private auditLogRepository = new AuditLogRepository();

  log(
    eventType: string,
    entityType: string,
    entityId: string,
    action: string,
    data: any
  ): void {
    const auditLog: AuditLog = {
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      action: action,
      data: JSON.stringify(data),
      occurred_at: new Date().toISOString()
    };

    this.auditLogRepository.create(auditLog);
    console.log(`📋 Audit: ${eventType} - ${entityType} #${entityId} (${action})`);
  }
}
