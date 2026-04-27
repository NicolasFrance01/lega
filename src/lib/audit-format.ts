export function formatAuditLog(log: any) {
  if (!log) return "Acción desconocida";
  const { action, details } = log;
  const d = details || {};
  
  switch (action) {
    case 'CREATE_APPOINTMENT':
      return `Creó un turno para ${d.patient_name || 'un paciente'} (${d.analysis_type || 'General'})`;
    case 'UPDATE_APPOINTMENT':
      return `Actualizó un turno de ${d.analysis_type || 'General'}`;
    case 'DELETE_APPOINTMENT':
      return `Eliminó un turno del sistema`;
    case 'LOGIN':
      return `Inició sesión en el sistema`;
    case 'LOGOUT':
      return `Cerró su sesión de trabajo`;
    case 'CREATE_USER':
      return `Creó al nuevo usuario @${d.username} (${d.role})`;
    case 'DELETE_USER':
      return `Eliminó permanentemente al usuario @${d.username}`;
    case 'ADMIN_UPDATE_USER':
      return `Modificó los datos del usuario @${d.username}`;
    case 'ADMIN_UPDATE_USER_AND_PWD':
      return `Actualizó al usuario @${d.username} y reseteó su clave`;
    case 'UPDATE_PROFILE_NAME':
      return `Actualizó su nombre en el perfil`;
    case 'UPDATE_PROFILE_WITH_PASSWORD':
      return `Cambió su contraseña y datos de perfil`;
    
    // Ingresos
    case 'CREATE_INGRESO':
      return `Registró un nuevo ingreso: ${d.patient_name} - ${d.analysis} (Prot. ${d.report_id})`;
    case 'UPDATE_INGRESO':
      return `Actualizó datos del ingreso de ${d.patient_name} (Prot. ${d.report_id})`;
    case 'DELETE_INGRESO':
      return `Eliminó el ingreso de ${d.patient_name} (Prot. ${d.report_id})`;
    case 'UPDATE_INGRESO_FIELD':
      return `Modificó '${d.field}' de ${d.patient_name} (Prot. ${d.report_id}): de '${d.old_value || '-'}' a '${d.new_value}'`;
    
    // Resultados Médicos
    case 'UPLOAD_MEDICAL_RESULT':
      return `Subió un resultado (${d.type}) para el paciente ID: ${d.patient_id}`;
    case 'DELETE_MEDICAL_RESULT':
      return `Eliminó un resultado de ${d.patient_name} (${d.result_type})`;
    case 'NOTIFIED_PATIENT':
      return `Avisó por WhatsApp a ${d.patient_name} sobre su resultado`;
    
    // Prestaciones
    case 'ADD_PRESTACION':
      return `Agregó una nueva prestación en '${d.sheet_name}'`;
    case 'UPDATE_PRESTACION':
      return `Editó una prestación en '${d.sheet_name}'`;
    case 'DELETE_PRESTACION':
      return `Eliminó una prestación de '${d.sheet_name}'`;
    default:
      if (typeof action === 'string') {
        return action.replace(/_/g, ' ').toLowerCase();
      }
      return "Acción realizada";
  }
}
