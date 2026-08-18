import {
  createManagedUserAction,
  listAdminUsersAction,
  resetManagedUserTwoFactorAction,
  revokeManagedUserSessionsAction,
  updateAdminUserRoleAction
} from "@/features/admin/server/admin-user-actions";
import type { ManagedUserRole } from "@/features/admin/master-policy";

type AdminUsuariosPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const roleLabels: Record<ManagedUserRole, string> = {
  customer: "Cliente",
  manager: "Gerente",
  admin: "Administrador"
};

const statusMessages: Record<string, string> = {
  "role-updated": "Permissão administrativa atualizada.",
  "user-created": "Conta criada. Compartilhe a senha inicial por um canal seguro.",
  "sessions-revoked": "Sessões do usuário encerradas.",
  "two-factor-reset": "Autenticação em duas etapas redefinida e sessões encerradas."
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
  "update-failed": "Não foi possível atualizar a permissão com segurança.",
  "invalid-user": "Revise nome, e-mail, senha e perfil da nova conta.",
  "create-failed": "Não foi possível criar a conta. O e-mail pode já estar cadastrado.",
  "self-session-revoke": "Encerre sua própria sessão pelo botão Sair.",
  "self-2fa-reset": "Sua própria autenticação em duas etapas só pode ser recuperada por outro administrador master."
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
          Cadastre contas, ajuste perfis, confira a proteção em duas etapas e encerre
          sessões. Somente administradores master podem alterar permissões.
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
          <section className="admin-user-create" aria-labelledby="new-user-title">
            <header>
              <div><p className="muted">Nova conta</p><h2 id="new-user-title">Cadastrar usuário</h2></div>
              <p>Clientes também podem criar a própria conta pela loja. Use este formulário para cadastros assistidos e equipe.</p>
            </header>
            <form action={createManagedUserAction}>
              <label><span>Nome completo</span><input name="name" autoComplete="off" minLength={2} required /></label>
              <label><span>E-mail</span><input name="email" type="email" autoComplete="off" required /></label>
              <label><span>Senha inicial</span><input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
              <label><span>Perfil</span><select name="role" defaultValue="customer"><option value="customer">Cliente</option><option value="manager">Gerente</option><option value="admin">Administrador</option></select></label>
              <button className="primary-action" type="submit">Criar conta</button>
            </form>
            <small>A senha deve ter pelo menos 12 caracteres, uma letra e um número. Nunca envie senhas por e-mail aberto.</small>
          </section>
          <section className="admin-table" role="table" aria-label="Usuários administrativos">
            <div className="admin-table__row admin-table__row--head admin-table__row--users" role="row">
              <span role="columnheader">Usuário</span>
              <span role="columnheader">Perfil e segurança</span>
              <span role="columnheader">Sessões</span>
              <span role="columnheader">Ações</span>
            </div>
            {result.users.map((user) => (
              <div className="admin-table__row admin-table__row--users" role="row" key={user.id}>
                <span data-label="Usuário" role="cell">
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </span>
                <span data-label="Perfil e segurança" role="cell">
                  <strong>{roleLabels[user.role]}</strong>
                  <small>{user.twoFactorEnabled ? "2FA ativo" : "2FA não configurado"} · {user.emailVerified ? "E-mail verificado" : "E-mail não verificado"}</small>
                </span>
                <span data-label="Sessões" role="cell"><strong>{user.activeSessions}</strong><small>{user.activeSessions === 1 ? "sessão ativa" : "sessões ativas"}</small></span>
                <span data-label="Ações" role="cell" className="admin-user-actions">
                  <form className="admin-role-form" action={updateAdminUserRoleAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <label className="sr-only" htmlFor={`role-${user.id}`}>
                      Role de {user.name}
                    </label>
                    <select id={`role-${user.id}`} name="role" defaultValue={user.role}>
                      <option value="customer">Cliente</option>
                      <option value="manager">Gerente</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <button type="submit">Salvar</button>
                  </form>
                  {user.activeSessions > 0 ? <form action={revokeManagedUserSessionsAction}><input type="hidden" name="userId" value={user.id} /><button type="submit">Encerrar sessões</button></form> : null}
                  {user.twoFactorEnabled ? <form action={resetManagedUserTwoFactorAction}><input type="hidden" name="userId" value={user.id} /><button className="danger-link" type="submit">Redefinir 2FA</button></form> : null}
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
