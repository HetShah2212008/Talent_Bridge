/** Shared Clerk auth UI — signup shows first/last name when enabled in Clerk Dashboard. */
export const authAppearance = {
  elements: {
    rootBox: "mx-auto w-full",
    card: "shadow-lg rounded-xl border bg-card",
    headerTitle: "text-2xl font-semibold text-foreground",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton: "border border-input",
    formButtonPrimary:
      "bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium",
    formFieldLabel: "text-foreground font-medium",
    formFieldInput:
      "rounded-md border border-input bg-background text-foreground",
    footerActionLink: "text-primary hover:underline",
    identityPreviewText: "text-foreground",
    formFieldInputShowPasswordButton: "text-muted-foreground",
  },
  layout: {
    socialButtonsPlacement: "bottom",
  },
};
