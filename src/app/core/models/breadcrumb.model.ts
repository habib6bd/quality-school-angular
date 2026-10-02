export interface BreadcrumbItem {
  label: string;
  /** Router commands; omit for the current page. */
  link?: readonly string[];
}
