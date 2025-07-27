import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ExtractedCompanyData {
  companyName?: string;
  vatNumber?: string;
  companyFiscalCode?: string;
  legalAddress?: string;
  legalZipCode?: string;
  legalCity?: string;
  legalProvince?: string;
  phone?: string;
  email?: string;
  pec?: string;
  legalRepresentative?: {
    firstName?: string;
    lastName?: string;
    fiscalCode?: string;
    birthDate?: string;
    birthPlace?: string;
  };
}

export async function extractCompanyDataFromText(text: string): Promise<ExtractedCompanyData> {
  try {
    const prompt = `
Analizza il seguente testo di un documento aziendale italiano (probabilmente una visura camerale) ed estrai i seguenti dati in formato JSON.
Se un campo non è presente o non è chiaro, non includerlo nel JSON di risposta.

Campi da estrarre:
- companyName: Denominazione/Ragione sociale dell'azienda
- vatNumber: Partita IVA (formato: IT + 11 cifre)
- companyFiscalCode: Codice Fiscale dell'azienda
- legalAddress: Indirizzo della sede legale (via, numero civico)
- legalZipCode: CAP della sede legale
- legalCity: Città della sede legale
- legalProvince: Provincia della sede legale (sigla a 2 lettere)
- phone: Numero di telefono
- email: Indirizzo email
- pec: Indirizzo PEC
- legalRepresentative: Oggetto con i dati del legale rappresentante:
  - firstName: Nome
  - lastName: Cognome
  - fiscalCode: Codice Fiscale
  - birthDate: Data di nascita (formato YYYY-MM-DD)
  - birthPlace: Luogo di nascita

Rispondi SOLO con un oggetto JSON valido, senza commenti o spiegazioni aggiuntive.

Testo da analizzare:
${text}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "Sei un esperto nell'estrazione di dati da documenti aziendali italiani. Rispondi sempre con JSON valido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as ExtractedCompanyData;
  } catch (error) {
    console.error("Error extracting company data:", error);
    throw new Error("Failed to extract company data from document");
  }
}