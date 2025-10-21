import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Unlock the full potential of your flashcard learning
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <PricingTable />
      </div>
    </div>
  );
}
