// lib/accessStore.ts

export interface AccessRule {
  id: string;
  username: string;
  documentId: number;
  expiresAt: string | null; 
  createdAt: string;
  createdBy: string;
}

const rules: AccessRule[] = [];
let counter = 1;

export function listRules(): AccessRule[] {
  return rules;
}

export function addRule(input: Omit<AccessRule, "id" | "createdAt">): AccessRule {
  const rule: AccessRule = {
    ...input,
    id: String(counter++),
    createdAt: new Date().toISOString(),
  };
  rules.push(rule);
  return rule;
}

export function deleteRule(id: string): boolean {
  const idx = rules.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  rules.splice(idx, 1);
  return true;
}

export function isAllowed(username: string, documentId: number): boolean {
  const now = new Date();
  return rules.some((r) => {
    if (r.username !== username) return false;
    if (r.documentId !== documentId) return false;
    if (r.expiresAt) {
      const exp = new Date(r.expiresAt);
      if (exp < now) return false;
    }
    return true;
  });
}
