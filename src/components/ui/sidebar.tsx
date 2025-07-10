// This component is no longer used in the new static sidebar layout.
// It can be safely removed or kept for future reference.
// To avoid breaking imports, we'll just return null from the main components.

import React from 'react';

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SidebarTrigger = () => null;
