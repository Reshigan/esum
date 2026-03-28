// Demo accounts for platform testing
// Access convention: the credential is the local-part of the email (before @) concatenated with the string "123"

export interface DemoAccount {
  email: string;
  name: string;
  role: string;
  company: string;
}

const SUFFIX = "123";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "admin@esum.co.za", name: "Admin User", role: "Admin", company: "ESUM Platform" },
  { email: "trader@esum.co.za", name: "John Doe", role: "Trader", company: "Anglo American" },
  { email: "demo@esum.co.za", name: "Demo User", role: "Viewer", company: "Eskom Holdings" },
];

export function getCredentialForAccount(account: DemoAccount): string {
  return account.email.split("@")[0] + SUFFIX;
}

export function verifyAccess(email: string, input: string): DemoAccount | null {
  const account = DEMO_ACCOUNTS.find((a) => a.email === email);
  if (!account) return null;
  if (input !== getCredentialForAccount(account)) return null;
  return account;
}
