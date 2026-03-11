export const RENEWAL_CYCLE_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annually', label: 'Semi-annually' },
  { value: 'annually', label: 'Annually' },
  { value: 'custom', label: 'Custom' },
];

export const ENVIRONMENT_OPTIONS = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'development', label: 'Development' },
  { value: 'test', label: 'Test' },
  { value: 'sandbox', label: 'Sandbox' },
];

export const CLIENT_USER_ROLE_OPTIONS = [
  { value: 'Primary Contact', label: 'Primary Contact' },
  { value: 'Billing Contact', label: 'Billing Contact' },
  { value: 'Technical Contact', label: 'Technical Contact' },
  { value: 'Operations Contact', label: 'Operations Contact' },
  { value: 'Requester', label: 'Requester' },
  { value: 'Approver', label: 'Approver' },
  { value: 'Administrator', label: 'Administrator' },
];

export function withCurrentOption(options, value) {
  if (!value) return options;
  return options.some((option) => option.value === value)
    ? options
    : [{ value, label: `${value} (current)` }, ...options];
}
