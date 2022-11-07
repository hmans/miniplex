export type Document = {
  getHeadings: () => {
    depth: number
    text: string
    slug: string
  }[]
  getFrontMatter: () => {
    title?: string
    sectionTitle?: string
    order?: number
    section?: string
    sectionOrder?: number
    subsection?: string
  }
}

export const docs = import.meta.glob("./routes/**/*.{md,mdx}", {
  eager: true,
  query: { meta: "" }
}) as Record<any, Document>

export const cleanPath = (path: string) =>
  path.slice("./routes/".length).replace(/\.mdx?$/, "")
