import { AppError } from "../exception/AppError.js";
import { adminRepository } from "../repositories/adminRepository.js";
import { userRepository } from "../repositories/userRepository.js";

export class AdminService {
  dashboard() { return adminRepository.dashboard(); }
  users(page: number, limit: number) { return adminRepository.users(page, limit); }
  requests(page: number, limit: number) { return adminRepository.listRequests(page, limit); }
  audit(page: number, limit: number) { return adminRepository.listAudit(page, limit); }

  async setUserStatus(id: string, status: "ACTIVE" | "SUSPENDED", actorId: string) {
    if (id === actorId && status === "SUSPENDED") throw new AppError("Não é possível suspender a própria conta.", 400);
    const user = await userRepository.findById(id);
    if (!user) throw new AppError("Usuário não encontrado.", 404);
    return adminRepository.setUserStatus(id, status, actorId);
  }

  async resolveAudit(id: string, actorId: string) {
    try { return await adminRepository.resolveAudit(id, actorId); }
    catch { throw new AppError("Evento de auditoria não encontrado.", 404); }
  }

  async flagAudit(id: string, flagged: boolean, actorId: string) {
    try { return await adminRepository.flagAudit(id, flagged, actorId); }
    catch { throw new AppError("Evento de auditoria não encontrado.", 404); }
  }
}

export const adminService = new AdminService();