import Header from "~/components/ui/header";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-grow">
        <img 
          src="https://images.pexels.com/photos/1435075/pexels-photo-1435075.jpeg" 
          alt="Full width image" 
          className="w-full h-auto object-cover"
        />
      </main>
    </div>
  );
}