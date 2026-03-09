import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/Components/ui/accordion';

export function CollapsibleDetailSection({ title, value }) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={title}>
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent>{value}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
