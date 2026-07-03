import { updateAdminUserRoleAction, listAdminUsersAction } from "@/features/admin/server/admin-user-actions";
import type { ManagedUserRole } from "@/features/admin/master-policy";

type AdminUsuariosPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const roleLabels: Record<ManagedUserRole, string> = {
  customer: "Cliente",
  manager: "Manager",
  admin: "Admin"
};

const statusMessages: Record<string, string> = {
  "role-updated": "Permissão administrativa atualizada."
};

const errorMessages: Record<string, string> = {
  blocked: "Operação bloqueada neste ambiente.",
  forbidden: "Você não tem permissão master para alterar usuários.",
  "missing-db": "Banco local indisponível para gerenciar usuários.",
  "invalid-role": "Role inválida para atualização.",
  "not-found": "Usuário não encontrado.",
  "actor_not_admin": "Somente administradores master podem alterar permissões.",
  "actor_not_master": "Somente e-mails master autorizados podem conceder ou revogar permissões.",
  "self_downgrade": "Você não pode remover a própria permissão administrativa.",
  "master_downgrade": "E-mails master autorizados devem permanecer como admin.",
  "update-failed": "Não foi possível atualizar a permissão com segurança."
};

export default async function AdminUsuariosPage({ searchParams }: AdminUsuariosPageProps) {
  const emptyParams: Record<string, string | string[] | undefined> = {};
  const [result, params] = await Promise.all([
    listAdminUsersAction(),
    searchParams ? searchParams : Promise.resolve(emptyParams)
  ]);
  const status = firstParam(params.status);
  const error = firstParam(params.error);

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin</p>
        <h1>Usuários e permissões</h1>
        <p>
          Gestão restrita a e-mails master autorizados. O projeto usa as roles customer,
          manager e admin; master é uma allowlist operacional, não uma role nova no banco.
        </p>
      </section>

      {status ? (
        <div className="form-message form-message--success" role="status">
          {statusMessages[status] ?? "Operação concluída."}
        </div>
      ) : null}

      {error ? (
        <div className="form-message form-message--error" role="status">
          {errorMessages[error] ?? "Operação administrativa bloqueada."}
        </div>
      ) : null}

      {result.status === "success" ? (
        <>
          <section className="form-panel">
            <p className="muted">
              Allowlist master configurada: {result.masterCount > 0 ? "sim" : "não"}.
            </p>
          </section>
          <section className="admin-table" role="table" aria-label="Usuários administrativos">
            <div className="admin-table__row admin-table__row--head admin-table__row--users" role="row">
              <span role="columnheader">Usuário</span>
              <span role="columnheader">Role atual</span>
              <span role="columnheader">E-mail</span>
              <span role="columnheader">Alterar role</span>
            </div>
            {result.users.map((user) => (
              <div className="admin-table__row admin-table__row--users" role="row" key={user.id}>
                <span role="cell">
                  <strong>{user.name}</strong>
                  <small>{user.emailVerified ? "E-mail verificado" : "E-mail não verificado"}</small>
                </span>
                <span role="cell">{roleLabels[user.role]}</span>
                <span role="cell">{user.email}</span>
                <span role="cell">
                  <form className="admin-role-form" action={updateAdminUserRoleAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <label className="sr-only" htmlFor={`role-${user.id}`}>
                      Role de {user.name}
                    </label>
                    <select id={`role-${user.id}`} name="role" defaultValue={user.role}>
                      <option value="customer">Cliente</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button type="submit">Salvar</button>
                  </form>
                </span>
              </div>
            ))}
          </section>
        </>
      ) : (
        <div className="form-message form-message--error" role="status">
          {result.message}
        </div>
      )}
    </main>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
