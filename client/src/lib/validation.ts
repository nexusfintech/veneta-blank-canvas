import { z } from "zod";

// Italian fiscal code validation
export const fiscalCodeRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;

// Italian VAT number validation
export const vatNumberRegex = /^IT[0-9]{11}$/;

export const validateFiscalCode = (code: string): boolean => {
  return fiscalCodeRegex.test(code.toUpperCase());
};

export const validateVatNumber = (vat: string): boolean => {
  return vatNumberRegex.test(vat.toUpperCase());
};

export const clientFormSchema = z.object({
  type: z.enum(["persona_fisica", "azienda"]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fiscalCode: z.string().optional(),
  birthDate: z.string().optional(),
  companyName: z.string().optional(),
  vatNumber: z.string().optional(),
  companyFiscalCode: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["attivo", "inattivo"]).default("attivo"),
}).refine((data) => {
  if (data.type === "persona_fisica") {
    return data.firstName && data.lastName && data.fiscalCode;
  } else if (data.type === "azienda") {
    return data.companyName && data.vatNumber;
  }
  return false;
}, {
  message: "Required fields missing based on client type",
}).refine((data) => {
  if (data.fiscalCode && data.fiscalCode.trim()) {
    return validateFiscalCode(data.fiscalCode);
  }
  return true;
}, {
  message: "Invalid fiscal code format",
  path: ["fiscalCode"],
}).refine((data) => {
  if (data.vatNumber && data.vatNumber.trim()) {
    return validateVatNumber(data.vatNumber);
  }
  return true;
}, {
  message: "Invalid VAT number format (should be ITxxxxxxxxxxx)",
  path: ["vatNumber"],
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
