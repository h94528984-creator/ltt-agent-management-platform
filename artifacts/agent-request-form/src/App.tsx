import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AgentRequestForm from "@/pages/AgentRequestForm";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AgentRequestForm />
    </QueryClientProvider>
  );
}

export default App;
