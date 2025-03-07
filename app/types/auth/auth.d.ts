
type Roles =
  | 's3_admin'
  | 'audit_viewer';

interface RoleValidation {
  isValid: boolean;
  unknownRoles?: string[];
}
