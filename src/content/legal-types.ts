/** A piece of a legal document: a paragraph, a bullet list or a table. Content is data so it can be edited and tested. */
export type Block = string | { list: string[] } | { table: { head: string[]; rows: string[][] } };

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

export interface Processor {
  name: string;
  purpose: string;
  where: string;
  /** Only providers that are really in use are listed in the policy. */
  active: boolean;
}

/** Everything the documents state as fact. Change the facts here, not in the text. */
export interface LegalFacts {
  product: string;
  operatorName: string;
  contactEmail: string;
  lastUpdated: string;
  passDays: number;
  refundDays: number;
  freeScansPerDay: number;
  governingLaw: string;
  processors: Processor[];
}