import { Button } from "@workspace/ui/components/button";

function App() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-y-4">
      <h1 className="text-primary-foreground text-4xl font-bold">
        Workspace Monorepo
      </h1>
      <Button
        onClick={() =>
          window.open("https://github.com/ari1337an/monorepo", "_blank")
        }
        className="p-4 font-bold"
        variant="default"
      >
        GitHub Link
      </Button>
    </div>
  );
}

export default App;
